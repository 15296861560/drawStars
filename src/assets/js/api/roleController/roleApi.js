import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'

const roleApi = {
  queryList: params => $axiosGet(params, `/roleApi/list`),
  getDetail: id => $axiosGet({}, `/roleApi/detail/${id}`),
  create: data => $axios(data, `/roleApi/create`),
  update: data => requests({ url: `/api/roleApi/update`, data, method: 'put' }),
  delete: id =>
    requests({ url: `/api/roleApi/delete/${id}`, method: 'delete' }),
  getMenuIds: roleId => $axiosGet({}, `/roleApi/menuIds/${roleId}`),
  bindMenus: data => $axios(data, `/roleApi/bindMenus`)
}

export default roleApi
