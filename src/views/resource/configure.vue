<template>
  <div class="g-list-vertical">
    <el-row class="mb40">
      <el-button type="primary" @click="query">{{ $t("btn.query") }}</el-button>
      <el-button type="primary" @click="create">{{ $t("btn.create") }}</el-button>
      <el-button type="danger" @click="batchDelete">{{
        $t("btn.batchDelete")
      }}</el-button>
      <el-button type="warning" v-show="formInline.id" @click="confirmUpdate"
        >确认 编辑</el-button
      >
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
          v-model="formInline.open_way"
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
          <el-icon class="avatar-uploader-icon" v-else>
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
    </el-form>

    <el-table
      :data="tableData"
      style="width: 100%"
      max-height="700"
      @selection-change="handleSelectionChange"
    >
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
      <el-table-column sortable prop="update_time" label=" 编辑时间" width="300">
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="200">
        <template #default="scope">
          <el-button @click.native.prevent="getDetail(scope.row)" size="small"
            >查看</el-button
          >
          <el-button @click.native.prevent="deleteRow(scope.row)" size="small">
            删除
          </el-button>
          <el-button @click.native.prevent="updateRow(scope.row)" size="small">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <base-dialog
    ref="dialogRef"
    :options="dialogOptions"
    :title="dialogTitle"
    @confirm="query"
  ></base-dialog>
</template>
<script setup>
import { onMounted, ref, reactive, defineAsyncComponent } from "vue";
import * as webAdressApi from "@/assets/js/api/webAdressController/webAdressApi.js";
import { showTips } from "@/utils/message/showTips.js";
import { ElMessageBox } from "element-plus";
import { dialogFields } from "./schema/configureSchema";

const BaseDialog = defineAsyncComponent(() =>
  import("@/components/base/form/BaseDialog.vue")
);

const confirmMethod = async (newData) => {
  const nowDate = new Date().getTime();
  const websiteInfo = {
    name: newData.name,
    type: newData.type,
    icon: newData.icon,
    address: newData.address,
    open_way: newData.open_way,
    create_time: nowDate,
    update_time: nowDate,
  };
  let confirmFun = webAdressApi.createWebsite;
  let successTips = "创建成功";
  if (newData.id) {
    websiteInfo.id = newData.id;
    confirmFun = webAdressApi.updateWebsite;
    successTips = "编辑成功";
  }
  const result = await confirmFun(websiteInfo);
  if (result.status) {
    showTips("success", successTips);
    query();
  } else {
    showTips("error", result.msg);
  }
  return result;
};

const initMethod = async (params) => {
  const { id } = params;
  const result = await webAdressApi.getWebsiteDetailById(id);
  return result;
};

const dialogOptions = reactive({
  fieldList: dialogFields,
  confirmMethod,
  confirmParams: {},
  initMethod,
  initParams: {},
  disabled: false,
});

const dialogRef = ref();

const dialogTitle = ref("新增");

const formInline = reactive({
  id: "",
  name: "",
  type: "",
  icon: "",
  address: "",
  open_way: "",
});
const tableData = ref([]);
const checkList = ref([]);
const handleSelectionChange = (val) => {
  checkList.value = val.map((v) => v.id);
};
const openWayOptions = ref([
  {
    label: "新tab页签打开",
    value: "newTab",
  },
  {
    label: "当前窗口打开",
    value: "curWindow",
  },
  {
    label: "进入模块",
    value: "module",
  },
]);
const typeOptions = ref([
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
  {
    label: "模块",
    value: "module",
  },
]);

// 查询
async function query() {
  const result = await webAdressApi.queryWebsite();
  if (result.status) {
    tableData.value = result.data.map((item) => {
      item.create_time = new Date(item.create_time).toLocaleString();
      item.update_time = new Date(item.update_time).toLocaleString();
      return item;
    });
  } else {
    showTips("error", result.msg);
  }
}
// 删除
async function deleteRow(row) {
  const id = row.id;
  await ElMessageBox.confirm("是否确认删除该数据", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).catch(() => {
    showTips("info", "已取消删除操作");
  });
  const result = await webAdressApi.deleteWebsite(id);
  if (result.status) {
    showTips("success", "删除成功");
    query();
  } else {
    showTips("error", result.msg);
  }
}
// 编辑
async function updateRow(row) {
  dialogTitle.value = "编辑";
  dialogOptions.disabled = false;
  dialogOptions.initParams = { id: row.id };
  dialogRef.value?.opentDialog();
}
// 创建
function create() {
  dialogTitle.value = "新增";
  dialogOptions.disabled = false;
  dialogRef.value?.opentDialog();
}
const getDetail = (row) => {
  dialogTitle.value = "查看";
  dialogOptions.disabled = true;
  dialogOptions.initParams = { id: row.id };
  dialogRef.value?.opentDialog();
};

async function confirmUpdate() {
  const nowDate = new Date().getTime();
  const websiteInfo = {
    id: formInline.id,
    name: formInline.name,
    type: formInline.type,
    icon: formInline.icon,
    address: formInline.address,
    open_way: formInline.open_way,
    update_time: nowDate,
  };
  const result = await webAdressApi.updateWebsite(websiteInfo);
  if (result.status) {
    showTips("success", " 编辑成功");
    formInline.id = "";
    query();
  } else {
    showTips("error", result.msg);
  }
}
function batchDelete() {
  ElMessageBox.confirm("此操作将永久删除选中, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      //构造sql
      let ids = checkList.value;
      const result = await webAdressApi.batchDeleteWebsite(ids);
      if (result.status) {
        // 删除成功后操作
        checkList.value = [];
        query();
        showTips("success", "删除成功");
      }
    })
    .catch(() => {
      showTips("info", "已取消删除");
    });
}
function handleAvatarSuccess(res, file) {
  console.log(file);
  // formInline.icon = URL.createObjectURL(file.raw);
}
async function beforeAvatarUpload(file) {
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
}

onMounted(() => {
  query();
});
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
