/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-05-23 23:24:07
 * @LastEditors: lgy
 * @LastEditTime: 2023-07-22 23:11:09
 */
import axios from 'axios'

import { apiInfoStore } from '@/stores/api-info'
import { userInfoStore } from '@/stores/user-info'

import { showTips, getRequestErrorMessage } from '@/utils/message/showTips.js'

import router from '@/router'

import reqCache from './cache.js'
import {
  trackRequestBegin,
  trackRequestEnd
} from '@/composables/useInflightRequests'

const DEFAULT_TIMEOUT = 1000 * 60 * 2

// 生产环境走当前站点同源 /api（由 Nginx 反代到后端），避免写死 127.0.0.1 导致跨域
const api_base_url = ''

let hasSyncedProdApiUrl = false

const getApiInfo = () => {
  const apiInfo = apiInfoStore()
  if (!hasSyncedProdApiUrl && import.meta.env.PROD) {
    const current = String(apiInfo.url || '')
    // 纠正本地/旧缓存里的绝对地址，统一为同源 /api
    if (
      !current ||
      current === '/' ||
      /^https?:\/\//i.test(current) ||
      current.includes('127.0.0.1') ||
      current.includes('localhost')
    ) {
      apiInfo.changeApi('/api')
    }
    hasSyncedProdApiUrl = true
  }
  return apiInfo
}

const getUserInfo = () => userInfoStore()

const requests = axios.create({
  baseURL: api_base_url
})

requests.defaults.timeout = DEFAULT_TIMEOUT
requests.interceptors.request.use(config => {
  // console.log('请求拦截器', config)
  trackRequestBegin()
  let token = getUserInfo().getToken.value
  if (token) {
    // 将token放到请求头发送给服务器,将tokenkey放在请求头中
    config.headers.accessToken = token
  }
  return config
})
/** 登录态失效统一处理：清空本地凭证并跳登录（已在登录页则不重复跳转） */
const handleTokenFail = () => {
  if (import.meta.env.VITE_SKIP_LOGIN === 'true') return
  const userInfo = getUserInfo()
  userInfo.clearUserInfo()
  if (router.currentRoute && router.currentRoute.value) {
    if (router.currentRoute.value.path !== '/login') {
      router.push({ path: '/login' })
    }
  } else {
    router.push({ path: '/login' })
  }
}

let refreshPromise = null

/** 并发 401 共享同一次轮换，避免旧 refresh token 被后续请求判定为重放 */
const refreshAuthTokens = () => {
  if (refreshPromise) return refreshPromise
  const userInfo = getUserInfo()
  const currentRefreshToken = userInfo.getRefreshToken.value
  const url = getApiInfo().getURL.value + '/loginApi/refreshToken'
  refreshPromise = axios
    .post(
      url,
      { refreshToken: currentRefreshToken },
      { timeout: 30000 }
    )
    .then(res => {
      const body = res.data || {}
      const data = body.data || {}
      if (!body.status || !data.token || !data.refreshToken) {
        const error = new Error(body.msg || '刷新登录态失败')
        error.response = res
        throw error
      }
      userInfo.updateAuthTokens(data.token, data.refreshToken)
      return data
    })
    .catch(err => {
      const status = err && err.response && err.response.status
      const code =
        err && err.response && err.response.data && err.response.data.code
      if (status === 401 || code === 'TOKEN-FAIL') {
        handleTokenFail()
      }
      return Promise.reject(err)
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

const retryAuthorizedRequest = config => {
  const userInfo = getUserInfo()
  if (!config || config._retry || !userInfo.getRefreshToken.value) {
    handleTokenFail()
    return null
  }
  config._retry = true
  return refreshAuthTokens().then(data => {
    config.headers = config.headers || {}
    config.headers.accessToken = data.token
    return requests(config)
  })
}

const logoutAuthSession = () => {
  const refreshToken = getUserInfo().getRefreshToken.value
  if (!refreshToken) return Promise.resolve()
  const url = getApiInfo().getURL.value + '/loginApi/logout'
  return axios.post(url, { refreshToken }, { timeout: 30000 })
}

requests.interceptors.response.use(
  response => {
    trackRequestEnd()
    if (response.data && response.data.code === 'TOKEN-FAIL') {
      return retryAuthorizedRequest(response.config) || response
    }
    return response
  },
  err => {
    trackRequestEnd()
    const status = err && err.response && err.response.status
    const code =
      err && err.response && err.response.data && err.response.data.code
    if (status === 401 || code === 'TOKEN-FAIL') {
      return retryAuthorizedRequest(err.config) || Promise.reject(err)
    }
    return Promise.reject(err)
  }
)

const rejectWithBizMessage = function (err, fallback) {
  const bizMsg = getRequestErrorMessage(err, fallback)
  const status = err && err.response && err.response.status
  const code =
    err && err.response && err.response.data && err.response.data.code
  // 登录失效已由拦截器统一跳转，避免再叠加报错弹窗
  if (status !== 401 && code !== 'TOKEN-FAIL') {
    showTips('error', bizMsg)
  }
  const next = new Error(bizMsg)
  next.response = err && err.response
  next.code = err && err.code
  next.config = err && err.config
  return Promise.reject(next)
}

const $axios = function (params, methodURL, config = { method: 'post' }) {
  let promise = new Promise(function (resolve, reject) {
    const apiInfo = getApiInfo()
    let url = apiInfo.getURL.value
    if (methodURL) {
      url += methodURL
    }

    requests
      .post(url, params, {
        timeout: params.timeout || 30000
      })
      .then(res => {
        const data = res.data || {}
        const hideTip = config.hideErrorTip || data.code === 'TOKEN-FAIL'
        if (!data.status && !hideTip) {
          // 统一配置请求成功但接口报错时的提示
          showTips('error', data.msg || '请求失败')
        }
        resolve(data)
      })
      .catch(err => {
        rejectWithBizMessage(err, '请求失败').catch(reject)
      })
  })
  return promise
}

let apiObj = reqCache()

const $axiosGet = function (params = {}, methodURL = '', options = {}) {
  return new Promise((resolve, reject) => {
    const run = async () => {
      const apiInfo = getApiInfo()
      let reqURL = apiInfo.getURL.value
      methodURL && (reqURL += methodURL)
      let realURL = reqURL + '?'

      Object.keys(params).forEach(key => {
        realURL = `${realURL}${key}=${params[key]}&`
      })
      realURL = realURL.slice(0, -1)

      try {
        const cacheResp = await apiObj.beforeFetch(realURL, options)
        if (cacheResp) {
          resolve(cacheResp.data)
          return
        }

        requests
          .get(
            reqURL,
            {
              params,
              ...options.extOption
            },
            {
              timeout: params.timeout || 300000
            }
          )
          .then(res => {
            res.status === 200 && apiObj.afterFetch(res, realURL, options)
            const data = res.data || {}
            const hideTip = options.hideErrorTip || data.code === 'TOKEN-FAIL'
            if (!hideTip && data && data.status === false && data.msg) {
              showTips('error', data.msg)
            }
            resolve(data)
          })
          .catch(err => {
            rejectWithBizMessage(err, '请求失败').catch(reject)
          })
      } catch (err) {
        rejectWithBizMessage(err, '请求失败').catch(reject)
      }
    }
    void run()
  })
}

export {
  $axios,
  $axiosGet,
  requests,
  getRequestErrorMessage,
  logoutAuthSession
}
