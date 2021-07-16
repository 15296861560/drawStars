<template>
  <div>
    <el-row class="mb40">
      <!-- <el-button type="primary">{{$t("btn.originalImg")}}</el-button> -->
      <el-button type="primary" @click="createDB">{{ $t("btn.create") }}</el-button>
      <!-- <el-button type="primary" @click="insert">{{ $t("btn.insert") }}</el-button> -->
      <el-button type="primary" @click="query">{{ $t("btn.query") }}</el-button>
      <el-button type="primary" @click="batchInsertBefore">{{
        $t("btn.batchInsert")
      }}</el-button>
      <el-button type="warning" @click="updateDatas">{{
        $t("btn.batchUpdate")
      }}</el-button>
      <el-button type="danger" @click="batchDelete">{{
        $t("btn.batchDelete")
      }}</el-button>
      <el-button type="danger" @click="dropTableBefore">{{
        $t("btn.dropTable")
      }}</el-button>
      <el-button type="danger" @click="clearTableBefore">{{
        $t("btn.clearTable")
      }}</el-button>
    </el-row>

    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <!-- <el-form-item label="ID">
        <el-input v-model="formInline.id" placeholder="请输入id"></el-input>
      </el-form-item> -->
      <el-form-item :label="$t('text.userName')">
        <el-input
          v-model="formInline.name"
          :placeholder="$t('placeholder.inputUserName')"
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('text.balance')">
        <el-input
          v-model="formInline.balance"
          :placeholder="$t('placeholder.inputBalance')"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="insert">{{ $t("btn.insert") }}</el-button>
      </el-form-item>
    </el-form>
    <div class="g-table-normal">
      <table
        class="m-table-content-normal"
        cellspacing="0"
        cellpadding="0"
        align="center"
      >
        <tr>
          <th>{{ $t("text.selected") }}</th>
          <th>ID</th>
          <th>{{ $t("text.userName") }}</th>
          <th>{{ $t("text.balance") }}</th>
          <th>{{ $t("text.operate") }}</th>
        </tr>
        <tr v-for="(item, index) in tableData" :key="index">
          <td>
            <!-- <el-checkbox v-model="item.selected" @click.native="item.selected=!item.selected">{{ index }}</el-checkbox> -->
            <input type="checkbox" v-model="checkList" :value="item.id" />
          </td>
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.balance }}</td>
          <td>
            <el-button type="danger" @click="deleteRow(item.id)">{{
              $t("btn.delete")
            }}</el-button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      tableData: [],
      // db: null,
      formInline: {
        id: "",
        name: "",
        balance: "",
      },
      checkList: [],
    };
  },
  methods: {
    //创建数据库和数据表
    createDB() {
      // let tableName = "DrawstartsDB"; //数据库名称
      // let version = "1.0"; //版本
      // let des = "Drawstarts DB"; //描述
      // let size = 1024 * 1024 * 1024; //大小
      // this.db== openDatabase(tableName, version, des, size);
      let sql =
        "CREATE TABLE IF NOT EXISTS USERTABLE (id INTEGER PRIMARY KEY AUTOINCREMENT, name,balance)"; //建表
      this.$transaction(sql);
    },
    // 插入
    insert() {
      let rowData = this.formInline;
      // 该形式可插入中文
      let sql = "INSERT INTO USERTABLE VALUES (?,?,?)";
      let valArray = [null, rowData.name, rowData.balance];

      this.$executeSql(sql, valArray);

      // let sql =
      //   "INSERT INTO USERTABLE (id, name,balance) VALUES (" +
      //   null +
      //   "," +
      //   rowData.name +
      //   "," +
      //   rowData.balance +
      //   ")";
      // this.$transaction(sql);
    },
    // 查询
    query() {
      let _this = this;
      let sql = "SELECT * FROM USERTABLE";
      let successful = function (tx, results) {
        _this.tableData = Object.values(results.rows);
      };
      this.$executeSql(sql, [], successful);
    },
    // 删除
    deleteRow(id) {
      let sql = "DELETE FROM USERTABLE WHERE ID = " + id;
      this.$transaction(sql);
      this.query();
    },
    // 删表
    dropTableBefore() {
      this.$confirm("是否确认删除表", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.dropTable("USERTABLE");
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除表操作",
          });
        });
    },
    // 删表
    dropTable(tableName) {
      let sql = "DROP TABLE " + tableName;
      this.$transaction(sql).then(() => {
        this.query();
        this.$message({
          type: "success",
          message: "清空表数据成功!",
        });
      });
    },
    //清除表数据
    clearTableBefore() {
      this.$confirm("是否确认删除表数据", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.clearTable("USERTABLE");
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消清空表数据操作",
          });
        });
    },
    //清除表数据
    clearTable(tableName) {
      let sql = "DELETE FROM " + tableName;
      this.$transaction(sql).then(() => {
        this.query();
        this.$message({
          type: "success",
          message: "清空表数据成功!",
        });
      });
    },
    //更新数据
    update(columnName, columnValue, id) {
      let sql =
        "UPDATE processStorage SET " +
        columnName +
        " = '" +
        columnValue +
        "' WHERE Id = " +
        id;

      this.$transaction(sql);
    },
    // 更新多条数据
    updateDatas() {
      let tip = "是否确认更新选中的" + this.checkList.length + "条数据";
      this.$confirm(tip, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let ids = this.getCheckListIds();
          let sql =
            "UPDATE USERTABLE SET name='" +
            this.formInline.name +
            "',balance='" +
            this.formInline.balance +
            "' WHERE Id in (" +
            ids +
            ")";
          this.$transaction(sql).then(() => {
            // 更新成功后操作
            this.checkList = [];
            this.query();
            this.$message({
              type: "success",
              message: "更新成功!",
            });
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消更新",
          });
        });
    },
    // 批量删除
    batchDelete() {
      this.$confirm("此操作将永久删除这些信息, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          //构造sql
          let ids = this.getCheckListIds();
          let sql = "DELETE FROM USERTABLE WHERE Id in (" + ids + ")";
          this.$transaction(sql).then(() => {
            // 删除成功后操作
            this.checkList = [];
            this.query();
            this.$message({
              type: "success",
              message: "删除成功!",
            });
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    // 批量插入
    batchInsertBefore() {
      this.$prompt("请输入插入数量", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^\d+$/,
        inputErrorMessage: "请输入正整数数字",
      })
        .then(({ value }) => {
          this.batchInsert(value).then(() => {
            this.$message({
              type: "success",
              message: "成功插入 " + value + "条数据",
            });
            this.query();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消批量插入",
          });
        });
    },
    // 批量插入
    batchInsert(value) {
      return new Promise((resolve, reject) => {
        let _this = this;
        this.$DB.transaction(
          function (tx) {
            let rowData = _this.formInline;
            // 该形式可插入中文
            let sql = "INSERT INTO USERTABLE VALUES (?,?,?)";
            let valArray = [null, rowData.name, rowData.balance];

            for (let i = 0; i < value; i++) {
              tx.executeSql(sql, valArray);
            }
          },
          function (tx, err) {
            this.$message({
              type: "error",
              message: err,
            });
            reject(err);
          },
          function (tx, msg) {
            resolve();
          }
        );
      });
    },
    // 获取选中的id
    getCheckListIds() {
      let ids = "";
      this.checkList.forEach((item) => {
        ids = ids + item + ",";
      });
      ids = ids.slice(0, ids.length - 1);
      return ids;
    },
  },

  mounted() {
    this.createDB();
    this.query();
    // this.dropTable('USERTABLE');
  },
};
</script>
