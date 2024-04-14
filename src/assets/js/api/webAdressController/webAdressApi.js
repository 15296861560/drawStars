/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 22:05:22
 * @LastEditors: “lgy lgy-lgy@qq.com
 * @LastEditTime: 2024-04-14 19:50:30
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

function queryWebsite(param) {
  const pageSize = param.pageSize || 10;
  const limit = (param.curPage - 1) * pageSize
  return new Promise((resolve, reject) => {
    const params = {
      sql: "SELECT * FROM web_adress where name like concat('%',?,'%') and type like concat('%',?,'%') and address like concat('%',?,'%') and open_way like concat('%',?,'%') order by update_time desc limit ?,?",
      values: [param.name,param.type,param.address,param.open_way, limit, pageSize]
    };
    $axios(params, '/mysqlApi/sql').then(res => {
      resolve(res);
    }).catch(e => reject(e));
  });
}

function getWebsiteCount(param) {
  return new Promise((resolve, reject) => {
    const params = {
      sql: `SELECT COUNT(*) FROM web_adress where name like concat('%',?,'%') and type like concat('%',?,'%') and address like concat('%',?,'%') and open_way like concat('%',?,'%')`,
      values: [param.name,param.type,param.address,param.open_way]
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
  getWebsiteDetailById,
  getWebsiteCount
};