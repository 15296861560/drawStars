/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 22:05:22
 * @LastEditors: “lgy lgy-lgy@qq.com
 * @LastEditTime: 2024-04-06 16:59:28
 */
/* 配置资料相关接口 */
import {
  $axios
} from '@/assets/js/axios-api/axios-config.js';

function createWebsite(websiteInfo) {
  return new Promise((resolve, reject) => {
    let fields = '';
    let values = '';
    for (let k in websiteInfo) {
      fields += k + ',';
      values = values + '\'' + websiteInfo[k] + '\',';
    }
    fields = fields.slice(0, -1);
    values = values.slice(0, -1);
    let sql = {
      sql: 'INSERT INTO web_adress' + '(' + fields + ') VALUES(' + values + ')'
    };
    $axios(sql, '/mysqlApi/sql').then(res => {
      resolve(res);
    }).catch(e => reject(e));


  });
}

function deleteWebsite(id) {
  return new Promise((resolve, reject) => {
    let sql = {
      sql: 'DELETE  FROM web_adress WHERE id=' + id
    };
    $axios(sql, '/mysqlApi/sql').then(res => {
      resolve(res);
    }).catch(e => reject(e));
  });
}

function batchDeleteWebsite(ids) {
  return new Promise((resolve, reject) => {
    let sql = {
      sql: `DELETE  FROM web_adress WHERE id in (${ids})`
    };
    $axios(sql, '/mysqlApi/sql').then(res => {
      resolve(res);
    }).catch(e => reject(e));
  });
}

function updateWebsite(websiteInfo) {
  return new Promise((resolve, reject) => {
    let fields = '';
    const websiteInfoId = websiteInfo.id;
    delete websiteInfo.id;
    for (let k in websiteInfo) {
      fields += `${k}='${websiteInfo[k]}',`;
    }
    fields = fields.slice(0, -1);
    let sql = {
      sql: 'UPDATE web_adress SET ' + fields + ' WHERE id=' + websiteInfoId
    };
    $axios(sql, '/mysqlApi/sql').then(res => {
      resolve(res);
    }).catch(e => reject(e));


  });
}

function queryWebsite() {
  return new Promise((resolve, reject) => {
    const params = {
      sql: 'SELECT * FROM web_adress order by update_time desc'
    };
    $axios(params, '/mysqlApi/sql').then(res => {
      resolve(res);
    }).catch(e => reject(e));
  });
}


function getWebsiteDetailById(id) {
  return new Promise((resolve, reject) => {
    const params = {
      sql: 'SELECT * FROM web_adress where id = ?',
      values: [id]
    };
    $axios(params, '/mysqlApi/sql').then(res => {
      resolve(res);
    }).catch(e => reject(e));
  });
}

export {
  createWebsite,
  deleteWebsite,
  updateWebsite,
  queryWebsite,
  batchDeleteWebsite,
  getWebsiteDetailById
};