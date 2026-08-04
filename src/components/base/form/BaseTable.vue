<template>
  <div class="base-table">
    <div
      v-if="hasToolbar"
      class="base-table__toolbar"
    >
      <div class="base-table__toolbar-left">
        <div
          v-if="tableName"
          class="base-table__title"
        >
          {{ tableName }}
        </div>
        <el-button
          v-for="operate in tableOperate"
          v-show="handleShowButton(operate, {})"
          :key="operate.label"
          :color="operate.color"
          :type="operate.type || 'primary'"
          :plain="operate.plain !== false"
          :icon="operate.icon"
          :disabled="handleDisabledButton(operate, {})"
          :loading="!!operate.loading"
          @click="operate.action"
        >
          {{ operate.label }}
        </el-button>
        <slot name="toolbar-left" />
      </div>
      <div class="base-table__toolbar-right">
        <slot name="toolbar-right" />
        <el-tooltip
          v-for="tool in tableTools || []"
          :key="tool.tip || tool.label"
          :content="tool.tip || tool.label"
          placement="top"
        >
          <el-button
            circle
            :icon="tool.icon"
            :disabled="tool.disabled ? tool.disabled() : false"
            @click="tool.action"
          />
        </el-tooltip>
      </div>
    </div>

    <el-table
      ref="tableRef"
      class="base-table__body"
      tooltip-effect="dark"
      border
      stripe
      v-bind="tableAttrs"
      :data="tableData"
      :row-key="rowKey || 'id'"
    >
      <slot name="table">
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="55"
          align="center"
        />
        <el-table-column
          v-if="showIndex ?? true"
          type="index"
          label="序号"
          width="70"
          align="center"
        />
        <el-table-column
          v-for="fields in tableFields"
          :key="fields.fieldName"
          :prop="fields.fieldName"
          :label="fields.label"
          :sortable="fields.sortable"
          show-overflow-tooltip
          :width="fields.width"
          :min-width="resolveMinWidth(fields)"
          :align="fields.align || 'left'"
        >
          <template #default="{ row }">
            <base-table-item
              v-model:field="row[fields.fieldName]"
              :row="row"
              readonly
              :type="fields.type"
              :options="fields.options"
              :config="fields.config"
              :active-value="fields.activeValue"
              :inactive-value="fields.inactiveValue"
              :disabled="
                fields.disabled ? fields.disabled(row, fields) : false
              "
              @change="val => handleFieldChange(fields, row, val)"
            />
          </template>
        </el-table-column>
      </slot>
      <el-table-column
        v-if="pageTableOperate?.length"
        label="操作"
        :fixed="resolveOperateFixed"
        align="center"
        :width="operateColumnWidth"
      >
        <template #default="scope">
          <div class="base-table__row-ops">
            <template
              v-for="operate in pageTableOperate"
              :key="operate.label"
            >
              <el-tooltip
                v-if="handleShowButton(operate, scope.row) && operate.icon"
                :content="operate.tip || operate.label"
                placement="top"
              >
                <el-button
                  link
                  :type="operate.type || 'primary'"
                  :icon="operate.icon"
                  :disabled="handleDisabledButton(operate, scope.row)"
                  @click="operate.action(scope.row)"
                />
              </el-tooltip>
              <el-button
                v-else-if="handleShowButton(operate, scope.row)"
                link
                :color="operate.color"
                :type="operate.type"
                :disabled="handleDisabledButton(operate, scope.row)"
                @click="operate.action(scope.row)"
              >
                {{ operate.label }}
              </el-button>
            </template>
          </div>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>

    <div
      v-if="page"
      class="base-table__pagination"
    >
      <el-pagination
        v-model:current-page="page.curPage"
        v-model:page-size="page.pageSize"
        background
        :layout="page.layout || defaultPage.layout"
        :page-sizes="page.pageSizes || defaultPage.pageSizes"
        :total="page.total"
        @size-change="handleSizeChange"
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
  ref,
  toRefs,
  useAttrs,
  watch
} from 'vue'
import type { AnyObject, TableOption, PageInfo } from '@/types/global'
import { useRoute } from 'vue-router'

defineOptions({ inheritAttrs: false })

const route = useRoute()
const attrs = useAttrs()
const BaseTableItem = defineAsyncComponent(
  () => import('./BaseTableItem/index.vue')
)

const props = defineProps<{
  options: TableOption
  page?: PageInfo
  /** 仅用于触发工具栏禁用态刷新，不传到 el-table */
  selectionCount?: number
}>()

const tableAttrs = computed(() => {
  const raw = { ...attrs } as Record<string, unknown>
  delete raw.selectionCount
  delete raw['selection-count']
  return raw
})

const defaultPage = ref({
  layout: 'total, sizes, prev, pager, next, jumper',
  pageSizes: [10, 20, 50, 100]
})

const tableRef = ref()

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
  tableTools,
  operateFixed
} = toRefs(props.options as TableOption)

const hasToolbar = computed(() => {
  return !!(
    tableName?.value ||
    tableOperate?.value?.length ||
    tableTools?.value?.length
  )
})

/** 默认不 fixed，避免表头/表体错位；需要时 options.operateFixed = 'right' */
const resolveOperateFixed = computed(() => {
  const val = operateFixed?.value
  if (val === false || val === null || val === undefined || val === '') {
    return false
  }
  return val
})

const operateColumnWidth = computed(() => {
  if (tableOperateWidth?.value != null && tableOperateWidth.value !== '') {
    return tableOperateWidth.value
  }
  const list = pageTableOperate?.value || []
  const iconCount = list.filter((o: AnyObject) => o.icon).length
  if (iconCount && iconCount === list.length) {
    return Math.max(120, iconCount * 36 + 24)
  }
  const count = list.length || 0
  return Math.max(88, count * 48 + 24)
})

/** 已设 width 时不再设 min-width，避免 Element Plus 列宽计算错乱 */
const resolveMinWidth = (fields: AnyObject) => {
  if (fields.minWidth != null && fields.minWidth !== '') return fields.minWidth
  if (fields.width != null && fields.width !== '') return undefined
  return 100
}

const handleShowButton = (operate: AnyObject, row: AnyObject): boolean =>
  operate.show ? operate.show(operate, row, props.options, route) : true

const handleDisabledButton = (operate: AnyObject, row: AnyObject): boolean =>
  operate.disabled ? operate.disabled(operate, row) : false

const handleFieldChange = (fields: AnyObject, row: AnyObject, val: any) => {
  fields.onChange?.(row, val, fields)
}

const handleSizeChange = () => {
  const p = props.page
  if (!p) return
  if (typeof p.sizeChange === 'function') {
    p.sizeChange()
  } else if (typeof p.curPageChange === 'function') {
    p.curPageChange()
  }
}

const doLayout = () => {
  nextTick(() => {
    tableRef.value?.doLayout?.()
  })
}

watch(
  () => tableData?.value,
  () => doLayout(),
  { deep: true }
)

defineExpose({ tableRef, doLayout })
</script>

<style scoped lang="less">
.base-table {
  background: #fff;
  border-radius: 4px;
  padding: 12px 16px 8px;

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    gap: 12px;
  }

  &__toolbar-left,
  &__toolbar-right {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-right: 8px;
  }

  &__body {
    width: 100%;

    :deep(.el-table__header),
    :deep(.el-table__body) {
      width: 100% !important;
    }
  }

  &__row-ops {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 4px;
    white-space: nowrap;

    :deep(.el-button + .el-button) {
      margin-left: 0;
    }
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;
    padding: 14px 0 6px;
  }
}
</style>
