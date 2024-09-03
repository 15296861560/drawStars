/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 22:05:22
 * @LastEditors: “lgy lgy-lgy@qq.com
 * @LastEditTime: 2024-04-14 19:50:30
 */
/* 配置资料相关接口 */
import { $axios } from "@/assets/js/axios-api/axios-config.js";

export default {
  createWebsite: (websiteInfo) => {
    let fields = "";
    let values = "";
    for (let k in websiteInfo) {
      fields += k + ",";
      values = values + "'" + websiteInfo[k] + "',";
    }
    fields = fields.slice(0, -1);
    values = values.slice(0, -1);
    let sql = {
      sql: "INSERT INTO web_adress" + "(" + fields + ") VALUES(" + values + ")",
    };
    return $axios(sql, "/mysqlApi/sql");
  },

  deleteWebsite: (id) =>
    $axios(
      {
        sql: "DELETE  FROM web_adress WHERE id=" + id,
      },
      "/mysqlApi/sql",
    ),

  batchDeleteWebsite: (ids) =>
    $axios(
      {
        sql: `DELETE  FROM web_adress WHERE id in (${ids})`,
      },
      "/mysqlApi/sql",
    ),

  updateWebsite: (websiteInfo) => {
    let fields = "";
    const websiteInfoId = websiteInfo.id;
    delete websiteInfo.id;
    for (let k in websiteInfo) {
      fields += `${k}='${websiteInfo[k]}',`;
    }
    fields = fields.slice(0, -1);
    let sql = {
      sql: "UPDATE web_adress SET " + fields + " WHERE id=" + websiteInfoId,
    };
    return $axios(sql, "/mysqlApi/sql");
  },

  queryWebsite: (param) => {
    const pageSize = param.pageSize || 10;
    const limit = (param.curPage - 1) * pageSize;
    const params = {
      sql: "SELECT * FROM web_adress where name like concat('%',?,'%') and type like concat('%',?,'%') and address like concat('%',?,'%') and open_way like concat('%',?,'%') order by update_time desc limit ?,?",
      values: [
        param.name,
        param.type,
        param.address,
        param.open_way,
        limit,
        pageSize,
      ],
    };
    return $axios(params, "/mysqlApi/sql");
  },

  getWebsiteCount: (param) => {
    const params = {
      sql: "SELECT COUNT(*) FROM web_adress where name like concat('%',?,'%') and type like concat('%',?,'%') and address like concat('%',?,'%') and open_way like concat('%',?,'%')",
      values: [param.name, param.type, param.address, param.open_way],
    };
    return $axios(params, "/mysqlApi/sql");
  },
  getWebsiteDetailById: (id) => {
    const params = {
      sql: "SELECT * FROM web_adress where id = ?",
      values: [id],
    };
    return $axios(params, "/mysqlApi/sql");
  },
};
