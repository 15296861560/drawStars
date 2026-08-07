import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'

const menuApi = {
  getTree: () => $axiosGet({}, `/menuApi/tree`),
  getDetail: id => $axiosGet({}, `/menuApi/detail/${id}`),
  create: data => $axios(data, `/menuApi/create`),
  update: data =>
    requests({ url: `/api/menuApi/update`, data, method: 'put' }),
  delete: id =>
    requests({ url: `/api/menuApi/delete/${id}`, method: 'delete' }),
  userMenus: params => $axiosGet(params || {}, `/menuApi/userMenus`),
  userPermissions: params =>
    $axiosGet(params || {}, `/menuApi/userPermissions`)
}

export default menuApi
