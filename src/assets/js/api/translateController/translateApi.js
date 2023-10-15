/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-07-25 00:05:13
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-17 15:30:23
 */
/* 翻译相关接口 */
import {
  $axios
} from '@/assets/js/axios-api/axios-config.js';

function getSign(params) {
  return new Promise((resolve, reject) => {
    $axios(params, '/translateApi/getSign').then(res => {
      resolve(res);
    });
  });
}

export {
  getSign
};