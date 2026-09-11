import { requests } from '@/assets/js/axios-api/axios-config.js'

const convertApi = {
  /**
   * 上传文件
   * @param {Object} data - 文件信息
   * @returns {Promise} - 返回更新结果
   */
  convert: data =>
    requests({ url: `/api/convertApi/convert`, data, method: 'post' }),
  /**
   * 上传文件
   * @param {Object} data - 文件信息
   * @returns {Promise} - 返回(适配Quill)更新结果
   */
  convertQuill: data =>
    requests({ url: `/api/convertApi/convertQuill`, data, method: 'post' }),
  /**
   * 上传文件
   * @param {Object} data - 文件信息
   * @returns {Promise} - 返回(适配mammoth)更新结果
   */
  convertMammoth: data =>
    requests({ url: `/api/convertApi/convertMammoth`, data, method: 'post' })
}

export default convertApi
