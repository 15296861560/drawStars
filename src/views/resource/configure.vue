<template>
  <div class="g-list-vertical">
    <el-row class="mb40" :gutter="20">
      <el-col :span="16">
        <div class="flex">
          <search-item
            v-for="item in searchItems"
            :key="item.field"
            v-model:field="searchInfo[item.field]"
            :label="item.label"
            :type="item.type"
            :placeholder="item.placeholder"
            :options="item.options"
            clearable
            :class="`w-1/${searchItems.length}`"
          ></search-item>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="flex justify-end">
          <el-button type="primary" @click="query">{{
            $t("btn.search")
          }}</el-button>
          <el-button type="warning" @click="reset">{{
            $t("btn.reset")
          }}</el-button>
          <el-button type="success" @click="create">{{
            $t("btn.create")
          }}</el-button>
        </div>
      </el-col>
    </el-row>

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
import { onMounted, ref, reactive, defineAsyncComponent, computed } from "vue";
import * as webAdressApi from "@/assets/js/api/webAdressController/webAdressApi.js";
import { showTips } from "@/utils/message/showTips.js";
import { ElMessageBox } from "element-plus";
import { dialogFields, tableFields } from "./schema/configureSchema";
import i18n from "@/lang/index.js";
import { exportFile } from "@/utils/commom/importAndExport.ts";

const $t = i18n.global.t;

const BaseDialog = defineAsyncComponent(
  () => import("@/components/base/form/BaseDialog.vue"),
);
const BaseTable = defineAsyncComponent(
  () => import("@/components/base/form/BaseTable.vue"),
);
const SearchItem = defineAsyncComponent(
  () => import("@/components/base/SearchItem/index.vue"),
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

const searchInfo = reactive({
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

const searchItems = computed(() => [
  {
    field: "name",
    label: "名称",
    placeholder: $t("placeholder.inputName"),
    type: "input",
  },
  {
    field: "address",
    label: "地址",
    placeholder: $t("placeholder.inputAdress"),
    type: "input",
  },
  {
    field: "type",
    label: "类型",
    placeholder: $t("placeholder.inputType"),
    type: "select",
    options: typeOptions.value,
  },
  {
    field: "open_way",
    label: "打开方式",
    placeholder: $t("placeholder.inputOpenWay"),
    type: "select",
    options: openWayOptions.value,
  },
]);

const reset = () => {
  Object.keys(searchInfo).forEach((key) => {
    searchInfo[key] = "";
  });
  query();
};

// 查询
async function query() {
  const params = {
    curPage: pageInfo.curPage,
    pageSize: pageInfo.pageSize,
    ...searchInfo,
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

const getAllData = async () => {
  let dataList = [];
  const params = {
    curPage: 1,
    pageSize: 999,
    ...searchInfo,
  };

  const result = await webAdressApi.queryWebsite(params);
  if (result.status) {
    dataList = result.data.map((item) => {
      item.create_time = new Date(item.create_time).toLocaleString();
      item.update_time = new Date(item.update_time).toLocaleString();
      return item;
    });
  } else {
    showTips("error", result.msg);
  }

  return dataList;
};

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
      // 构造sql
      const ids = checkList.value;
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

const exportSelected = () => {
  const dataList =
    tableData.value?.filter((item) => checkList.value?.includes(item.id)) || [];
  exportFile(dataList);
};
const exportAll = async () => {
  exportAllLoading.value = true;
  const dataList = await getAllData();
  exportAllLoading.value = false;
  exportFile(dataList);
};

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

const exportAllLoading = ref(false);

const tableOperate = [
  {
    label: "导出选中",
    type: "primary",
    action: exportSelected,
  },
  {
    label: "导出全部",
    type: "warning",
    loading: exportAllLoading,
    action: exportAll,
  },
  {
    label: $t("btn.batchDelete"),
    type: "danger",
    action: batchDelete,
  },
];

const tableOptions = reactive({
  tableData,
  tableFields,
  tableName: "资料列表",
  showIndex: false,
  showSelection: true,
  pageTableOperate,
  tableOperate,
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
