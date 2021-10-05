<template>
  <div>
    <el-row class="mb40">
      <el-button type="primary" @click="query">{{ $t("btn.query") }}</el-button>

      <el-button type="warning" @click="updateDatas">{{
        $t("btn.batchUpdate")
      }}</el-button>
      <el-button type="danger" @click="batchDelete">{{
        $t("btn.batchDelete")
      }}</el-button>
    </el-row>

    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item :label="$t('text.userName')">
        <el-input
          v-model="formInline.name"
          :placeholder="$t('placeholder.inputUserName')"
          ref="name"
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('text.phone')">
        <el-input
          v-model="formInline.phone"
          :placeholder="$t('placeholder.inputPhone')"
          ref="phone"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="insert">{{ $t("btn.create") }}</el-button>
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
          <th>{{ $t("text.userName") }}</th>
          <th>{{ $t("text.level") }}</th>
          <th>{{ $t("text.phone") }}</th>
          <th>{{ $t("text.operate") }}</th>
        </tr>
        <tr v-for="(item, index) in tableData" :key="index">
          <td>
            <input type="checkbox" v-model="checkList" :value="item.id" />
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.level }}</td>
          <td>{{ item.phone }}</td>
          <td>
            <el-button type="danger" @click="deleteRow(item.phone)">{{
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
        phone: "",
      },
      checkList: [],
    };
  },
  methods: {
    // 插入
    insert() {
      let rowData = this.formInline;
      let data = {
        name: rowData.name,
        password: "123456",
        phone: rowData.phone,
      };

      this.$axios(data, "/register").then((res) => {
        if (res.status) {
          this.$message({
            type: "success",
            message: "创建成功!",
          });
          this.query();
          this.formInline.name = "";
          this.formInline.phone = "";
          this.$refs.name.select();
        }
      });
    },
    // 查询
    query() {
      this.$axios({}, "/query").then((res) => {
        if (res.status) {
          this.tableData = res.data;
        }
      });
    },
    // 删除
    deleteRow(phone) {
      this.$axios({ phone: phone }, "/cancel").then((res) => {
        if (res.status) {
          this.$message({
            type: "success",
            message: "删除成功!",
          });
          this.query();
        }
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
            "update user set name='" +
            this.formInline.name +
            "' WHERE Id in (" +
            ids +
            ")";
          this.$axios({sql:sql}, "/sql").then(() => {
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
          let sql = { sql: "delete from user where id in (" + ids + ")" };
          this.$axios(sql, "/sql").then((res) => {
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
    // 获取选中的id
    getCheckListIds() {
      let ids = "";
      this.checkList.forEach((item) => {
        ids = ids + item + ",";
      });
      ids = ids.slice(0, -1);
      return ids;
    },
  },

  mounted() {
    this.query();
  },
};
</script>
