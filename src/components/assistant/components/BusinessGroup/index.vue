<template>
  <div class="flex flex-row items-center justify-between w-full h-full">
    <div class="flex flex-row items-center ml-4 assistant-dialog-header-left">
      <img
        src="@/assets/img/assistant/robot-avatar.png"
        class="w-30px h-30px ml-5px mr-8px"
        alt="avatar"
      />
      <el-dropdown
        trigger="click"
        popper-class="assistant-dropdown"
        class="mr-2.5"
      >
        <div class="text-base color-[#343438]">
          <span class="vertical-middle">{{ selectedDirectionName }} </span>
          <img
            src="@/assets/img/assistant/assistant-dialog-header-switch.png"
            class="inline-block w-24px h-24px vertical-middle"
            alt=""
          />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in businessDirections"
              :key="item.key"
              class="assistant-dropdown-item"
              :class="{
                'assistant-dropdown-item__active': item.key === curDirection
              }"
              @click="changeCurDirection(item.key)"
              >{{ item.name }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div>
      <el-dropdown trigger="click" popper-class="dialog-record-dropdown">
        <img
          src="@/assets/img/assistant/assistant-dialog-header-history.png"
          class="inline-block mr-4 cursor-pointer w-24px h-24px"
          title="历史记录"
          alt="历史记录"
        />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in groups"
              :key="item.groupId"
              class="dialog-record-dropdown-item"
              :class="{
                'dialog-record-dropdown-item__active':
                  curGroupId === item.groupId
              }"
              @click="changeGroup(item)"
            >
              <div class="group-name">{{ item.groupName }}</div>

              <el-icon
                class="btn-icon"
                size="16px"
                @click.stop="deleteSingleGroup(item.groupId, index)"
                ><Close
              /></el-icon>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <img
        src="@/assets/img/assistant/assistant-dialog-header-newdialogue.png"
        class="inline-block mr-4 cursor-pointer w-24px h-24px"
        title="新建对话"
        alt="新建对话"
        @click="addDialog"
      />
      <img
        src="@/assets/img/assistant/assistant-dialog-header-minimize.png"
        class="inline-block mr-3 cursor-pointer w-24px h-24px"
        title="最小化"
        alt="最小化"
        @click="minimizeDialog"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch, nextTick, computed, onMounted } from 'vue'
import { getAssetsImgFile } from '@/utils/tool'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'

import { userInfoStore } from '@/stores/user-info'
const userInfo = userInfoStore()
const userId = computed(() => userInfo.getUserId || '')

const emit = defineEmits([
  'direction-change',
  'change-group',
  'delete-group',
  'add-dialog',
  'minimize-dialog'
])

const props = defineProps({
  businessDirections: {
    type: Array,
    default: []
  }
})

const selectedDirectionName = computed(() => {
  const item = props.businessDirections.find(d => d.key === curDirection.value)
  return item?.name || '请选择'
})

const curDirection = ref('0')

const changeCurDirection = (newVal: string) => {
  if (curDirection.value === newVal) {
    return
  }

  curDirection.value = newVal
  emit('direction-change', newVal)
  createGroup()
}

const curGroupId = ref('')
const groups = ref<Array<any>>([])

const addDialog = () => {
  createGroup()

  emit('direction-change', '0')
  emit('add-dialog')

  curDirection.value = '0'
}

const minimizeDialog = () => {
  emit('minimize-dialog')
}

const createGroup = () => {
  curGroupId.value = uuidv4().replace(/-/g, '')
  const groupInfo = {
    groupId: curGroupId.value,
    groupName: ''
  }
  emit('change-group', groupInfo)
}
const deleteAllDialog = async () => {
  if (await deleteGroup()) {
    groups.value = []
  }
}
const deleteSingleGroup = async (id: string, index: number) => {
  if (await deleteGroup(id)) {
    await getListGroup() // 强制刷新整个列表
  }
}

const deleteGroup = async (groupId = '') => {
  ElMessage.success('删除成功')
  return true
}

const changeGroup = (groupInfo: any) => {
  curGroupId.value = groupInfo.groupId
  curDirection.value = groupInfo.type || '0'
  emit('direction-change', curDirection.value)
  emit('change-group', groupInfo)
}

const getListGroup = async () => {
  groups.value = res.data = []
}

const clear = () => {
  curDirection.value = '0'
  curGroupId.value = ''
}

onMounted(() => {
  getListGroup()
  addDialog()
})

defineExpose({
  curDirection,
  groups,
  addDialog,
  createGroup,
  clear,
  curGroupId
})
</script>

<style lang="less">
.assistant-dropdown {
  z-index: 10000 !important;
  .assistant-dropdown-item {
    height: 40px;
    padding: 0px 15px;
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #333333;
    background: #ffffff;
    width: 100%;
    cursor: pointer;
    position: relative;
    box-sizing: border-box;
    &:hover {
      background: #e8f3ff;
    }
    &__active {
      color: var(--el-color-primary);
      &::before {
        content: '';
        position: absolute;
        left: 0px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 20px;
        background: var(--el-color-primary);
      }
    }
    &__disabled {
      cursor: not-allowed;
      background-color: var(--el-disabled-bg-color);
      color: var(--el-disabled-text-color);
      &:hover {
        background-color: var(--el-disabled-bg-color);
      }
    }
  }
}

.dialog-record-dropdown {
  z-index: 10000 !important;
  height: 200px;
  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    color: #333333;
    font-size: 14px;
    max-width: 350px;
    &:first-child {
      border-radius: 6px 6px 0px 0px;
    }
    &:last-child {
      border-radius: 0px 0px 6px 6px;
    }
    .btn-icon {
      display: none;
    }
    &:hover {
      background: #e8f3ff;
      .btn-icon {
        display: block;
      }
    }
    &__active {
      color: var(--el-color-primary);
      &::before {
        content: '';
        position: absolute;
        left: 0px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 20px;
        background: var(--el-color-primary);
      }
    }
    .group-name {
      text-wrap: nowrap;
      width: 90%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
