/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 22:05:22
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-18 21:23:22
 */
import {
  showTips
} from '@/utils/message/showTips.js';
// 创建sqlite的数据库连接
const DB = openDatabase("DrawstartsDB", "1.0", "Drawstarts DB", 1024 * 1024 * 1024);
// sqlite事务使用
function transaction(sql) {
  return new Promise((resolve, reject) => {
    DB.transaction(
      function (tx) {
        tx.executeSql(sql);
      },
      function (tx, err) {
        if (!err) err = "事务执行失败";

        showTips("error", err);
        reject(err);
        // console.log("transaction fail:", err);
      },
      function (tx, msg) {
        resolve();
        // if (!msg) msg = "事务执行成功";
        // console.log("transaction success:", msg);
      },
    );
  })

};
// 获取sql执行结果
function executeSql(sql, valArray, successful) {
  if (arguments.length == 2) {
    DB.transaction(
      function (tx) {
        tx.executeSql(sql, valArray, function (tx, msg) {
            // console.log("executeSql success:", msg);
          },
          function (tx, err) {
            showTips("error", err.source + "====" + err.message);
            // console.log("executeSql fail:", err.source + "====" + err.message);
          });
      },
      function (tx, err) {
        showTips("error", err);
        // console.log("transaction fail:", err);
      },
      function (tx, msg) {
        // if (!msg) msg = "事务执行成功";
        // console.log("transaction success:", msg);
      },
    );
  } else if (arguments.length == 3) {

    DB.transaction(
      function (tx) {
        tx.executeSql(sql, valArray, successful,
          function (tx, err) {
            showTips("error", err.source + "====" + err.message);
          });
      },
      function (tx, err) {
        showTips("error", err);
      },
      function (tx, msg) {
        // if (!msg) msg = "事务执行成功";
        // console.log("transaction success:", msg);
      },
    );
  } else {
    // console.log('传入参数错误');
    showTips("error", "传入参数错误");
  }
};

function dbTransaction(fnHandle, fnReject, fnResolve) {
  return new Promise((resolve, reject) => {
    DB.transaction(
      fnHandle,
      fnReject, fnResolve,
    );
  })
}


export {
  transaction,
  executeSql,
  dbTransaction
};