/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-07-25 00:05:13
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-17 22:26:39
 */
import { $axios, $axiosGet } from '@/assets/js/axios-api/axios-config.js'

export default {
  /**
   * @description: 获取提交信息
   * @param {
   * phone:String,
   * password:String
   * } params
   * @return {*}
   * @author: lgy
   */
  getCommitInfo: () => $axios({}, '/controller/getCommitInfo'),
  /**
   * @description: 模板
   * @param {}
   * @return {*}
   * @author: lgy
   */
  getContent: () => $axios({}, '/controller/practice/getContent'),
  /**
   * @description: 压缩代码
   * @param {}
   * @return {*}
   * @author: lgy
   */
  compressCode: params => $axios(params, '/controller/compressCode'),

  /**
   * @description: 上传文件
   * @param {}
   * @return {*}
   * @author: lgy
   */
  uploadFile: params => $axios(params, '/controller/upload'),

  /**
   * @description: 下载文件
   * @param {}
   * @return {*}
   * @author: lgy
   */
  downloadFile: params => {
    return new Promise(resolve => {
      $axiosGet(params, '/controller/download', {
        extOption: { responseType: 'blob' }
      }).then(res => {
        let blob = new Blob([res], {
          type: 'charset=utf-8'
        })
        let src = window.URL.createObjectURL(blob)
        if (src) {
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = src
          link.setAttribute('download', params.filename)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link) // 下载完成移除元素
          window.URL.revokeObjectURL(src) // 释放掉blob对象
        }

        resolve(res)
      })
    })
  }
}
