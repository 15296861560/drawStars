<template>
  <div class="g-list-vertical">
    <el-row class="mb40">
      <el-button type="primary" @click="query">{{ $t("btn.query") }}</el-button>
      <el-button type="primary" @click="create">{{ $t("btn.create") }}</el-button>
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
          @change="query"
        ></el-input>
      </el-form-item>
      <el-form-item :label="'地址'">
        <el-input
          v-model="formInline.address"
          :placeholder="$t('placeholder.inputAdress')"
          ref="address"
          @change="query"
        ></el-input>
      </el-form-item>
      <el-form-item :label="'类型'">
        <el-select
          v-model="formInline.type"
          :placeholder="$t('placeholder.inputType')"
          clearable
          @change="query"
        >
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
          clearable
          @change="query"
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
    </el-form>

    <base-table
      ref="tableRef"
      :options="tableOptions"
      :page="pageInfo"
      max-height="700"
      @selection-change="handleSelectionChange"
    >
    </base-table>

    <base-dialog
      ref="dialogRef"
      :options="dialogOptions"
      :title="dialogTitle"
      @confirm="query"
    ></base-dialog>
  </div>
</template>
<script setup>
import { onMounted, ref, reactive, defineAsyncComponent } from "vue";
import * as webAdressApi from "@/assets/js/api/webAdressController/webAdressApi.js";
import { showTips } from "@/utils/message/showTips.js";
import { ElMessageBox } from "element-plus";
import { dialogFields, tableFields } from "./schema/configureSchema";

const BaseDialog = defineAsyncComponent(() =>
  import("@/components/base/form/BaseDialog.vue")
);
const BaseTable = defineAsyncComponent(() =>
  import("@/components/base/form/BaseTable.vue")
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
  const params = {
    curPage: pageInfo.curPage,
    pageSize: pageInfo.pageSize,
    ...formInline,
  };

  getTotal(params);

  const result = await webAdressApi.queryWebsite(params);
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

async function getTotal(params) {
  const result = await webAdressApi.getWebsiteCount(params);
  if (result.status) {
    pageInfo.total = result.data[0]?.["COUNT(*)"] || 0;
  } else {
    showTips("error", result.msg);
  }
}
// 删除
async function deleteRow(row) {
  const id = row.id;
  try {
    await ElMessageBox.confirm("是否确认删除该数据", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch (e) {
    showTips("info", "已取消删除操作");
    return;
  }

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
// 查看
const getDetail = (row) => {
  dialogTitle.value = "查看";
  dialogOptions.disabled = true;
  dialogOptions.initParams = { id: row.id };
  dialogRef.value?.opentDialog();
};

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

const pageTableOperate = [
  {
    label: "查看",
    type: "primary",
    action: getDetail,
  },
  {
    label: "编辑",
    type: "warning",
    action: updateRow,
  },
  {
    label: "删除",
    type: "danger",
    action: deleteRow,
  },
];

const tableOptions = reactive({
  tableData,
  tableFields,
  showIndex: false,
  showSelection: true,
  pageTableOperate,
  tableOperateWidth: "200",
});

const pageInfo = reactive({
  curPage: 1,
  pageSize: 10,
  total: 100,
  curPageChange: query,
});

onMounted(() => {
  query();
});
</script>
<style>
.avatar {
  width: 40px;
  height: 40px;
  display: block;
}
</style>
