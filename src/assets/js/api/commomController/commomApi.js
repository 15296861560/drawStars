/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-07-25 00:05:13
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-17 22:26:39
 */
import { $axios, $axiosGet } from "@/assets/js/axios-api/axios-config.js";

export default {
  /**
   * @description: 获取提交信息
   * @param {
   * phone:String,
   * password:String
   * } params
   * @return {*}
   * @author: lgy
   */
  getCommitInfo: () => $axios({}, "/controller/getCommitInfo"),
  /**
   * @description: 模板
   * @param {}
   * @return {*}
   * @author: lgy
   */
  getContent: () => $axios({}, "/controller/practice/getContent"),
  /**
   * @description: 压缩代码
   * @param {}
   * @return {*}
   * @author: lgy
   */
  compressCode: (params) => $axios(params, "/controller/compressCode"),

  /**
   * @description: 上传文件
   * @param {}
   * @return {*}
   * @author: lgy
   */
  uploadFile: (params) => $axios(params, "/controller/upload"),

  /**
   * @description: 下载文件
   * @param {}
   * @return {*}
   * @author: lgy
   */
  downloadFile: (params) => {
    return new Promise((resolve) => {
      $axiosGet(params, "/controller/download", {
        extOption: { responseType: "blob" },
      }).then((res) => {
        let blob = new Blob([res], {
          type: "charset=utf-8",
        });
        let src = window.URL.createObjectURL(blob);
        if (src) {
          let link = document.createElement("a");
          link.style.display = "none";
          link.href = src;
          link.setAttribute("download", params.filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link); // 下载完成移除元素
          window.URL.revokeObjectURL(src); // 释放掉blob对象
        }

        resolve(res);
      });
    });
  },

  // 通用插入数据
  insertInfo: (info, tableName) => {
    let fields = "";
    let values = "";
    Object.keys(info).forEach(k => {
      fields += k + ",";
      values = values + "'" + info[k] + "',";
    })

    fields = fields.slice(0, -1);
    values = values.slice(0, -1);
    let sql = {
      sql: `INSERT INTO ${tableName} (${fields}) VALUES(${values})`,
    };
    return $axios(sql, "/mysqlApi/sql");
  },
  // 通用删除数据
  deleteInfo: (id, tableName) =>
    $axios(
      {
        sql: `DELETE  FROM ${tableName} WHERE id=` + id,
      },
      "/mysqlApi/sql",
    ),
  // 通用批量删除数据
  batchDeleteInfo: (ids, tableName) =>
    $axios(
      {
        sql: `DELETE FROM ${tableName} WHERE id in (${ids})`,
      },
      "/mysqlApi/sql",
    ),
  // 通用更新数据
  updateInfo: (info, tableName) => {
    let fields = "";
    const infoId = info.id;
    delete info.id;
    for (let k in info) {
      fields += `${k}='${info[k]}',`;
    }
    fields = fields.slice(0, -1);
    let sql = {
      sql: `UPDATE ${tableName} SET ` + fields + " WHERE id=" + infoId,
    };
    return $axios(sql, "/mysqlApi/sql");
  },
  // 通用分页查询数据
  queryInfoList: (param, tableName, paramKeys = [], orderInfo = { field: 'update_time', order: 'desc' }) => {
    const pageSize = param.pageSize || 10;
    const limit = ((param.curPage - 1) * pageSize) || 0;
    let whereStr = paramKeys.map(key => {
      return `${key} like concat('%',?,'%') and`
    })?.join(" ");

    if (whereStr.length) {
      whereStr = `where ${whereStr.slice(0, -3)}`
    }

    whereStr = `${whereStr}order by ${orderInfo.field} ${orderInfo.order} limit ?,?`

    const params = {
      sql: `SELECT * FROM ${tableName} ${whereStr}`,
      values: [
        ...paramKeys.map(key => param[key]),
        limit,
        pageSize,
      ],
    };
    return $axios(params, "/mysqlApi/sql");
  },
  // 通用查询总数
  getInfoCount: (paramKeys = [], values, tableName) => {
    let whereStr = paramKeys.map(key => {
      return `${key} like concat('%',?,'%') and`
    })?.join(" ");

    if (whereStr.length) {
      whereStr = `where ${whereStr.slice(0, -3)}`
    }

    const params = {
      sql: `SELECT COUNT(*) FROM ${tableName} ${whereStr}`,
      values,
    };
    return $axios(params, "/mysqlApi/sql");
  },
  // 通用根据id查数据
  getInfoDetailById: (id, tableName) => {
    const params = {
      sql: `SELECT * FROM ${tableName} where id = ?`,
      values: [id],
    };
    return $axios(params, "/mysqlApi/sql");
  },
};
