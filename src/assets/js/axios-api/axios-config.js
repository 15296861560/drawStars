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

const DEFAULT_TIMEOUT = 1000 * 60 * 2

let api_base_url = ''
if (process.env.NODE_ENV === 'production') {
  api_base_url = 'http://127.0.0.1:8010/'
}

let hasSyncedProdApiUrl = false

const getApiInfo = () => {
  const apiInfo = apiInfoStore()
  if (!hasSyncedProdApiUrl && process.env.NODE_ENV === 'production') {
    apiInfo.changeApi('')
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
  let token = getUserInfo().getToken.value
  if (token) {
    // 将token放到请求头发送给服务器,将tokenkey放在请求头中
    config.headers.accessToken = token
  }
  return config
})
requests.interceptors.response.use(
  response => {
    // console.log('回复拦截器', response)
    if (
      response.data &&
      response.data.code &&
      response.data.code === 'TOKEN-FAIL'
    ) {
      if (import.meta.env.VITE_SKIP_LOGIN !== 'true') {
        router.push({
          path: '/login'
        })
      }
    }
    return response
  },
  err => {
    // console.log('报错拦截器',err)
    return Promise.reject(err)
  }
)

const rejectWithBizMessage = function (err, fallback) {
  const bizMsg = getRequestErrorMessage(err, fallback)
  showTips('error', bizMsg)
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
            const hideTip =
              options.hideErrorTip || data.code === 'TOKEN-FAIL'
            if (
              !hideTip &&
              data &&
              data.status === false &&
              data.msg
            ) {
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

export { $axios, $axiosGet, requests, getRequestErrorMessage }
