import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'

const appApi = {
  queryAppList: params => $axiosGet(params, `/appApi/list`),
  getAppDetailById: id => $axiosGet({}, `/appApi/detail/${id}`),
  createApp: app => $axios(app, `/appApi/create`),
  updateApp: data =>
    requests({ url: `/api/appApi/update`, data, method: 'put' }),
  deleteApp: id =>
    requests({ url: `/api/appApi/delete/${id}`, method: 'delete' }),
  batchDeleteApp: ids =>
    requests({ url: `/api/appApi/batchDelete`, data: ids, method: 'delete' }),
  upgradeApp: data =>
    requests({
      url: `/api/appApi/upgrade/${data.id}`,
      data,
      method: 'post'
    }),
  publishApp: id =>
    requests({ url: `/api/appApi/publish/${id}`, method: 'post' }),
  offlineApp: id =>
    requests({ url: `/api/appApi/offline/${id}`, method: 'post' }),
  listVersions: id => $axiosGet({}, `/appApi/versions/${id}`),
  bindPermissions: (moduleCode, permissionCodes) =>
    requests({
      url: `/api/mobile/modules/${encodeURIComponent(moduleCode)}/permissions`,
      data: { permissionCodes },
      method: 'post'
    }),
  listShellReleases: () => $axiosGet({}, `/mobile/shell/releases`),
  createShellRelease: data =>
    requests({
      url: `/api/mobile/shell/releases`,
      data,
      method: 'post'
    }),
  listOpsBanners: () => $axiosGet({}, '/mobile/ops/banners/admin'),
  saveOpsBanner: data =>
    requests({
      url: '/api/mobile/ops/banners',
      data,
      method: 'post'
    }),
  createPreviewCode: data =>
    requests({
      url: '/api/mobile/preview/create',
      data,
      method: 'post'
    }),
  listDebugWhitelist: () => $axiosGet({}, '/mobile/debug/whitelist'),
  addDebugWhitelist: data =>
    requests({
      url: '/api/mobile/debug/whitelist',
      data,
      method: 'post'
    }),
  signPackageChecksum: checksum =>
    requests({
      url: '/api/mobile/package/sign',
      data: { checksum },
      method: 'post'
    })
}

export default appApi
