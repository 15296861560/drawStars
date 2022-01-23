/*配置资料相关接口*/
import Vue from 'vue';

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
    Vue.prototype.$axios(sql, "/mysqlApi/sql").then((res) => {
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
    Vue.prototype.$axios(sql, "/mysqlApi/sql").then((res) => {
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
      sql: "UPDATE web_adress SET "+ fields+" WHERE id="+websiteInfo.id
    };
    Vue.prototype.$axios(sql, "/mysqlApi/sql").then((res) => {
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
    Vue.prototype.$axios(sql, "/mysqlApi/sql").then((res) => {
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
