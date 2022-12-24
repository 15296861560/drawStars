/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 22:05:22
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-29 00:30:44
 */
/*配置资料相关接口*/
import {
  $axios
} from "@/assets/js/axios-api/axios-config.js";

function createWebsite(websiteInfo) {
  return new Promise((resolve, reject) => {
    let fields = '';
    let values = '';
    for (let k in websiteInfo) {
      fields += k + ',';
      values = values + "'" + websiteInfo[k] + "',"
    }
    fields = fields.slice(0, -1);
    values = values.slice(0, -1);
    let sql = {
      sql: "INSERT INTO web_adress" + '(' + fields + ') VALUES(' + values + ')'
    };
    $axios(sql, "/mysqlApi/sql").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });


  })
}

function deleteWebsite(id) {
  return new Promise((resolve, reject) => {
    let sql = {
      sql: "DELETE  FROM web_adress WHERE id=" + id
    };
    $axios(sql, "/mysqlApi/sql").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });
  })
}

function updateWebsite(websiteInfo) {
  return new Promise((resolve, reject) => {
    for (let k in websiteInfo) {
      fields += k + "=" + websiteInfo[k] + ",";
    }
    fields = fields.slice(0, -1);
    let sql = {
      sql: "UPDATE web_adress SET " + fields + " WHERE id=" + websiteInfo.id
    };
    $axios(sql, "/mysqlApi/sql").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });


  })
}

function queryWebsite(id) {
  return new Promise((resolve, reject) => {
    let sql = {
      sql: "SELECT * FROM web_adress"
    };
    $axios(sql, "/mysqlApi/sql").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });
  })
}
export {
  createWebsite,
  deleteWebsite,
  updateWebsite,
  queryWebsite
};