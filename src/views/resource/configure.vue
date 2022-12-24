<template>
  <div class="g-list-vertical">
    <el-row class="mb40">
      <el-button type="primary" @click="query">{{ $t("btn.query") }}</el-button>
      <el-button type="primary" @click="insert">{{ $t("btn.create") }}</el-button>

      <el-button type="warning" @click="updateDatas">{{
        $t("btn.batchUpdate")
      }}</el-button>
      <el-button type="danger" @click="batchDelete">{{
        $t("btn.batchDelete")
      }}</el-button>
    </el-row>

    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item :label="'名称'">
        <el-input
          v-model="formInline.name"
          :placeholder="$t('placeholder.inputName')"
          ref="name"
        ></el-input>
      </el-form-item>
      <el-form-item :label="'地址'">
        <el-input
          v-model="formInline.address"
          :placeholder="$t('placeholder.inputAdress')"
          ref="address"
        ></el-input>
      </el-form-item>
      <el-form-item :label="'类型'">
        <el-select v-model="formInline.type" :placeholder="$t('placeholder.inputType')">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="'打开方式'">
        <el-select
          v-model="formInline.openWay"
          :placeholder="$t('placeholder.inputOpenWay')"
        >
          <el-option
            v-for="item in openWayOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="图标">
        <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="formInline.icon" :src="formInline.icon" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" style="width: 100%" max-height="700">
      <el-table-column type="selection" width="55"> </el-table-column>

      <el-table-column sortable prop="name" label="名称" width="300"> </el-table-column>
      <el-table-column prop="address" label="地址" width="300"> </el-table-column>
      <el-table-column prop="type" label="类型" width="120"> </el-table-column>
      <el-table-column prop="icon" label="图标" width="200">
        <template #default="scope">
          <img class="icon" :src="scope.row.date" />
        </template>
      </el-table-column>
      <el-table-column sortable prop="create_time" label="创建时间" width="300">
      </el-table-column>
      <el-table-column sortable prop="update_time" label="修改时间" width="300">
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="150">
        <template #default="scope">
          <el-button @click.native.prevent="deleteRow(scope.$index)" size="small">
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import * as webAdressApi from "@/assets/js/api/webAdressController/webAdressApi.js";

export default {
  data() {
    return {
      formInline: {
        name: "",
        type: "",
        icon: "",
        address: "",
        openWay: "",
      },
      tableData: [],
      openWayOptions: [
        {
          label: "新tab页签打开",
          value: "newTab",
        },
        {
          label: "当前窗口打开",
          value: "curWindow",
        },
      ],
      typeOptions: [
        {
          label: "框架",
          value: "frame",
        },
        {
          label: "工具",
          value: "tool",
        },
        {
          label: "资源",
          value: "resource",
        },
      ],
    };
  },
  methods: {
    // 查询
    query() {
      webAdressApi
        .queryWebsite()
        .then((result) => {
          if (result.status) {
            this.tableData = result.data.map((item) => {
              item.create_time = new Date(item.create_time).toLocaleString();
              item.update_time = new Date(item.update_time).toLocaleString();
              return item;
            });
          } else {
            this.$message({
              type: "error",
              message: result.msg,
            });
          }
        })
        .catch((err) => {});
    },
    // 删除
    deleteRow(index) {
      let id = this.tableData[index].id;
      webAdressApi
        .deleteWebsite(id)
        .then((result) => {
          if (result.status) {
            this.$message({
              type: "error",
              message: "删除成功",
            });
            this.query();
          } else {
            this.$message({
              type: "error",
              message: result.msg,
            });
          }
        })
        .catch((err) => {});
    },
    // 创建
    insert() {
      let nowDate = new Date().getTime();
      let websiteInfo = {
        name: this.formInline.name,
        type: this.formInline.type,
        icon: this.formInline.icon,
        address: this.formInline.address,
        open_way: this.formInline.openWay,
        create_time: nowDate,
        update_time: nowDate,
      };
      webAdressApi
        .createWebsite(websiteInfo)
        .then((result) => {
          if (result.status) this.query();
          else
            this.$message({
              type: "error",
              message: result.msg,
            });
        })
        .catch((err) => {});
    },
    updateDatas() {},
    batchDelete() {},
    handleAvatarSuccess(res, file) {
      console.log(file);
      // this.formInline.icon = URL.createObjectURL(file.raw);
    },
    beforeAvatarUpload(file) {
      console.log(file.type);
      let isImg = false;
      if (
        file.type === "image/jpeg" ||
        file.type === "image/svg+xml" ||
        file.type === "image/png"
      )
        isImg = true;
      let isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImg) {
        this.$message.error("上传头像图片只能是 jpg、svg和png 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isImg && isLt2M;
    },
  },
  created() {
    this.query();
  },
};
</script>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
}
.avatar {
  width: 40px;
  height: 40px;
  display: block;
}
</style>
