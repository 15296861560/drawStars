/* 通知公告相关接口 */
import commomApi from "../commomController/commomApi.js";

const tableName = 'notice'

export default {
  createNotice: (info) => {
    return commomApi.insertInfo(info, tableName)
  },
  deleteNotice: (id) => {
    return commomApi.deleteInfo(id, tableName)
  },
  batchDeleteNotice: (ids) => {
    return commomApi.batchDeleteInfo(ids, tableName)
  },
  updateNotice: (info) => {
    return commomApi.updateInfo(info, tableName)
  },
  queryNoticeList: (param) => {
    return commomApi.queryInfoList(param, tableName, Object.keys(param).filter(item => item !== 'pageSize' && item !== 'curPage'))
  },
  getNoticeCount: (param) => {
    const paramKeys = Object.keys(param).filter(item => item !== 'pageSize' && item !== 'curPage')
    return commomApi.getInfoCount(paramKeys, paramKeys.map(key => param[key]), tableName)
  },
  getNoticeDetailById: (id) => {
    return commomApi.getInfoDetailById(id, tableName)
  },
};
