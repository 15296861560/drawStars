/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-07-25 00:05:13
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-17 15:30:07
 */
/* 支付相关接口 */
import {
  $axios
} from '@/assets/js/axios-api/axios-config.js';

/**
 * @description: 付款
 * @param {} params
 * @return {*}
 * @author: lgy
 */
function toPay(params) {
  return new Promise((resolve, reject) => {
    $axios(params, '/payApi/toPay').then(res => {
      resolve(res);
    });
  });
}

export {
  toPay
};