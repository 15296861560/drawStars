import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'

const userManageApi = {
  queryList: params => $axiosGet(params, `/userManageApi/list`),
  getDetail: id => $axiosGet({}, `/userManageApi/detail/${id}`),
  create: data => $axios(data, `/userManageApi/create`),
  update: data =>
    requests({ url: `/api/userManageApi/update`, data, method: 'put' }),
  delete: id =>
    requests({ url: `/api/userManageApi/delete/${id}`, method: 'delete' }),
  resetPassword: data => $axios(data, `/userManageApi/resetPassword`),
  assignRoles: data => $axios(data, `/userManageApi/assignRoles`)
}

export default userManageApi
