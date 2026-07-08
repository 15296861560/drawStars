<template>
  <div class="log-container">
    <el-row class="mb40" :gutter="20">
      <el-col :span="20">
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
      <el-col :span="4">
        <div class="flex justify-end">
          <el-button type="primary" @click="query">{{
            $t("btn.search")
          }}</el-button>
          <el-button type="warning" @click="reset">{{
            $t("btn.reset")
          }}</el-button>
        </div>
      </el-col>
    </el-row>
    <BaseTable
      :options="tableOptions"
      :page="pageInfo"
      max-height="700"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, defineAsyncComponent } from "vue";
import { showTips } from "@/utils/message/showTips.js";
import { ElMessageBox, ElTooltip } from "element-plus";
import logApi from "@/assets/js/api/logController/logApi.js";
import { exportFile } from "@/utils/commom/importAndExport.ts";
const BaseTable = defineAsyncComponent(
  () => import("@/components/base/form/BaseTable.vue"),
);
const SearchItem = defineAsyncComponent(
  () => import("@/components/base/SearchItem/index.vue"),
);

// 搜索条件
const searchInfo = reactive({
  module: "",
  type: "",
  operator: "",
  startTime: "",
  endTime: "",
});

// 表格数据
const tableData = ref([]);
const checkList = ref([]);

// 分页信息
const pageInfo = reactive({
  curPage: 1,
  pageSize: 10,
  total: 0,
  curPageChange: query,
});

// 业务模块选项
const moduleOptions = [
  { label: "用户管理", value: "user" },
  { label: "角色管理", value: "role" },
  { label: "权限管理", value: "permission" },
  { label: "系统设置", value: "system" },
  { label: "日志管理", value: "log" },
];

// 日志类型选项
const logTypeOptions = [
  { label: "业务日志", value: "business" },
  { label: "系统日志", value: "system" },
  { label: "异常日志", value: "error" },
];

// 搜索项配置
const searchItems = computed(() => [
  {
    field: "module",
    label: "业务模块",
    type: "select",
    options: moduleOptions,
    placeholder: "请选择业务模块",
  },
  {
    field: "type",
    label: "日志类型",
    type: "select",
    options: logTypeOptions,
    placeholder: "请选择日志类型",
  },
  {
    field: "operator",
    label: "操作人",
    type: "input",
    placeholder: "请输入操作人",
  },
  {
    field: "timeRange",
    label: "时间范围",
    type: "daterange",
    startField: "startTime",
    endField: "endTime",
  },
]);

// 查询方法
async function query() {
  const params = {
    ...searchInfo,
    curPage: pageInfo.curPage,
    pageSize: pageInfo.pageSize,
  };

  const result = await logApi.queryBusinessLogs(params);
  if (result.status) {
    tableData.value = result.data.list;
    pageInfo.total = result.data.total;
  } else {
    showTips("error", result.msg);
  }
}

// 重置方法
const reset = () => {
  Object.keys(searchInfo).forEach((key) => {
    searchInfo[key] = "";
  });
  query();
};

// 选择变化
const handleSelectionChange = (val) => {
  checkList.value = val.map((v) => v.id);
};

// 批量删除
const batchDelete = () => {
  if (checkList.value.length === 0) {
    showTips("warning", "请选择要删除的日志");
    return;
  }

  ElMessageBox.confirm("确定要删除选中的日志吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const result = await logApi.batchDeleteLogs(checkList.value);
      if (result.status) {
        showTips("success", "删除成功");
        query();
      }
    })
    .catch(() => {
      showTips("info", "已取消删除");
    });
};

// 导出选中
const exportSelected = () => {
  const data = tableData.value.filter((item) =>
    checkList.value.includes(item.id),
  );
  exportFile(data, "业务日志");
};

// 表格配置
const tableOptions = reactive({
  tableData,
  tableName: "业务日志",
  tableFields: [
    { fieldName: "module", label: "业务模块", width: 120 },
    { fieldName: "type", label: "日志类型", width: 120 },
    { fieldName: "title", label: "日志标题", width: 200 },
    {
      fieldName: "content",
      label: "日志内容",
      slotName: "content",
    },
    { fieldName: "operator", label: "操作人", width: 120 },
    { fieldName: "create_time", label: "操作时间", width: 180 },
  ],
  showIndex: false,
  showSelection: true,
  pageTableOperate: [
    {
      label: "查看",
      type: "primary",
      icon: "View",
      action: (row) => handleView(row),
    },
    {
      label: "删除",
      type: "danger",
      icon: "Delete",
      action: (row) => handleDelete(row),
    },
  ],
  tableOperate: [
    { label: "导出选中", type: "primary", action: exportSelected },
    { label: "批量删除", type: "danger", action: batchDelete },
  ],
});

// 查看详情
const handleView = (row) => {
  ElMessageBox.alert(
    `
    <div class="log-detail">
      <p><strong>业务类型：</strong>${row.businessType}</p>
      <p><strong>操作用户：</strong>${row.username}</p>
      <p><strong>操作内容：</strong>${row.operation}</p>
      <p><strong>请求参数：</strong>${row.params}</p>
      <p><strong>IP地址：</strong>${row.ip}</p>
      <p><strong>状态：</strong>${row.status}</p>
      ${row.errorMsg ? `<p><strong>错误信息：</strong>${row.errorMsg}</p>` : ""}
      <p><strong>操作时间：</strong>${row.create_time}</p>
    </div>
  `,
    "业务日志详情",
    {
      dangerouslyUseHTMLString: true,
      customClass: "log-detail-dialog",
      width: "600px",
    },
  );
};

// 单条删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除这条业务日志吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const result = await logApi.deleteLog(row.id);
      if (result.status) {
        showTips("success", "删除成功");
        query();
      }
    })
    .catch(() => {
      showTips("info", "已取消删除");
    });
};

onMounted(() => {
  query();
});
</script>

<style scoped>
.text-ellipsis {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
