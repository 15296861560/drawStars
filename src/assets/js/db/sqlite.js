import Vue from 'vue';
// 创建sqlite的数据库连接
Vue.prototype.$DB = openDatabase("DrawstartsDB", "1.0", "Drawstarts DB", 1024 * 1024 * 1024);
// sqlite事务使用
Vue.prototype.$transaction = function (sql) {
  return new Promise((resolve, reject) => {
    this.$DB.transaction(
      function (tx) {
        tx.executeSql(sql);
      },
      function (tx, err) {
        if (!err) err = "事务执行失败";

        Vue.prototype.$message({
          type: "error",
          message: err,
        });
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
Vue.prototype.$executeSql = function (sql, valArray, successful) {
  if (arguments.length == 2) {
    this.$DB.transaction(
      function (tx) {
        tx.executeSql(sql, valArray, function (tx, msg) {
            // console.log("executeSql success:", msg);
          },
          function (tx, err) {
            Vue.prototype.$message({
              type: "error",
              message: err.source + "====" + err.message,
            });
            // console.log("executeSql fail:", err.source + "====" + err.message);
          });
      },
      function (tx, err) {
        Vue.prototype.$message({
          type: "error",
          message: err,
        });
        // console.log("transaction fail:", err);
      },
      function (tx, msg) {
        // if (!msg) msg = "事务执行成功";
        // console.log("transaction success:", msg);
      },
    );
  } else if (arguments.length == 3) {

    this.$DB.transaction(
      function (tx) {
        tx.executeSql(sql, valArray, successful,
          function (tx, err) {
            Vue.prototype.$message({
              type: "error",
              message: err.source + "====" + err.message,
            });
          });
      },
      function (tx, err) {
        Vue.prototype.$message({
          type: "error",
          message: err,
        });
      },
      function (tx, msg) {
        // if (!msg) msg = "事务执行成功";
        // console.log("transaction success:", msg);
      },
    );
  } else {
    // console.log('传入参数错误');
    Vue.prototype.$message({
      type: "error",
      message: "传入参数错误",
    });
  }
};
