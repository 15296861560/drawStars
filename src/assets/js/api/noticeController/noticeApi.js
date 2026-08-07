/* 通知公告管理接口 */
import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'

const noticeApi = {
  queryNoticeList: params => $axiosGet(params, '/noticeApi/list'),

  getNoticeDetailById: id => $axiosGet({}, `/noticeApi/detail/${id}`),

  createNotice: notice => $axios(notice, '/noticeApi/create'),

  updateNotice: data =>
    requests({ url: '/api/noticeApi/update', data, method: 'put' }),

  deleteNotice: id =>
    requests({ url: `/api/noticeApi/delete/${id}`, method: 'delete' }),

  batchDeleteNotice: ids =>
    requests({
      url: '/api/noticeApi/batchDelete',
      data: ids,
      method: 'delete'
    })
}

export default noticeApi
