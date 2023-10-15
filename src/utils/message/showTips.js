/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-12-18 00:23:03
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-18 00:31:33
 */
import {
  ElMessage
} from 'element-plus';

let showTips = function (type, msg) {
  ElMessage({
    type: type,
    message: msg,
  });
};


export {
  showTips
};