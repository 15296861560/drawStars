<!--
 * @Author: “lgy lgy-lgy@qq.com
 * @Date: 2024-04-06 21:41:22
 * @LastEditors: “lgy lgy-lgy@qq.com
 * @LastEditTime: 2024-06-16 20:46:55
 * @FilePath: \drawStars-Vue3\src\components\base\form\BaseTable.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="base-table">
    <div class="table-header">
      <div class="table-name" v-if="tableName">{{ tableName }}</div>
      <div class="table-operation" v-show="tableOperate?.length">
        <el-button
          v-for="operate in tableOperate"
          :key="operate.label"
          :color="operate.color"
          :type="operate.type"
          @click="operate.action"
          v-loading="operate.loading"
        >
          {{ operate.label }}
        </el-button>
      </div>
    </div>

    <!-- 表格内容 -->
    <el-table
      ref="tableRef"
      class="mb-10 custom-table"
      tooltip-effect="dark"
      stripe
      v-bind="$attrs"
      :data="tableData"
      :row-key="rowKey || 'id'"
    >
      <slot name="table">
        <el-table-column
          v-if="showIndex ?? true"
          type="index"
          label="序号"
          width="90"
        ></el-table-column>
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="50"
          reserve-selection
        />
        <el-table-column
          v-for="fields in tableFields"
          :key="fields.fieldName"
          :prop="fields.fieldName"
          :label="fields.label"
          :sortable="fields.sortable"
          show-overflow-tooltip
          :width="fields.width"
          :min-width="fields.minWidth || '100px'"
        >
          <template #default="{ row }">
            <base-table-item
              v-model:field="row[fields.fieldName]"
              readonly
              :type="fields.type"
              :options="fields.options"
            ></base-table-item>
          </template>
        </el-table-column>
      </slot>
      <el-table-column
        v-if="pageTableOperate?.length"
        label="操作"
        fixed="right"
        :width="tableOperateWidth"
      >
        <template #default="scope">
          <div class="table-operate-div">
            <el-button
              v-for="operate in pageTableOperate"
              v-show="handleShowButton(operate, scope.row)"
              :key="operate.label"
              :disabled="handleDisabledButton(operate, scope.row)"
              :color="operate.color"
              :type="operate.type"
              link
              @click="operate.action(scope.row)"
            >
              {{ operate.label }}
            </el-button>
          </div>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>

    <!-- 分页 （自定义内容时还需判断是否需要分页）-->
    <div v-if="page" class="__pagination">
      <el-pagination
        v-model:current-page="page.curPage"
        v-model:page-size="page.pageSize"
        background
        :layout="page.layout || defaultPage.layout"
        :total="page.total"
        @current-change="page.curPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onUnmounted,
  reactive,
  ref,
  toRefs,
  watch,
} from "vue";
import type { AnyObject, Field, TableOption, PageInfo } from "@/types/global";
import { useRoute } from "vue-router";

const route = useRoute();
const BaseTableItem = defineAsyncComponent(() => import("./BaseTableItem/index.vue"));

const props = defineProps<{
  options: TableOption;
  page: PageInfo;
}>();

const defaultPage = ref({
  layout: "total,prev, pager, next,jumper",
});

const {
  tableData,
  tableFields,
  showIndex,
  showSelection,
  pageTableOperate,
  tableOperateWidth,
  rowKey,
  tableName,
  tableOperate,
} = toRefs(<TableOption>props.options);

//是否展示按钮
const handleShowButton = (operate: AnyObject, row: AnyObject): boolean =>
  operate.show ? operate.show(operate, row, props.options, route) : true;

//是否禁用按钮
const handleDisabledButton = (operate: AnyObject, row: AnyObject): boolean =>
  operate.disabled ? operate.disabled(operate, row) : false;
</script>

<style scoped lang="less">
.el-pagination {
  justify-content: flex-end;
}

.base-table {
  background-color: white;
  min-height: 60vh;
  max-height: 75vh;
  border-radius: 8px;
  padding: 1rem /* 16/16 */;
  .table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem /* 12/16 */;
    .table-name {
      font-weight: bold;
      font-size: 1.75rem /* 28/16 */;
    }
  }
  .table-operation {
    display: flex;
  }
}
</style>
