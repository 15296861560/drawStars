<template>
  <div>
    <div
      class="assitant-entry"
      ref="assitantRntryRef"
      @click="openDialog"
      @mousedown="mousedown($event)"
      @mouseup="mouseup"
      title="Tips:快速敲击两下空格键可以唤醒AI喔:)"
    >
      <template v-if="!isMoving">
        <div class="assitant-entry__icon"></div>
        <div class="assitant-entry__icon-ripple"></div>
      </template>

      <div v-else class="assitant-entry__drag"></div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :show-close="false"
      width="90%"
      class="p-0 assistant-dialog"
    >
      <template #header="{ close, titleId, titleClass }">
        <div class="assistant-header">
          <div class="flex items-center">
            <img class="logo" :src="getAssetsImgFile(`assistant/logo.png`)" />
            <div class="logo-title">{{ aiName }}</div>
            <div
              class="ml-4 cursor-pointer"
              @click="chatRef?.handleVoiceSwitch"
            >
              <img
                v-show="!chatRef?.voiceStatus"
                src="@/assets/img/assistant/voice-mute.png"
                alt=""
              />
              <img
                v-show="chatRef?.voiceStatus"
                src="@/assets/img/assistant/voice-up.png"
                alt=""
              />
            </div>
          </div>

          <div class="title" :id="titleId" :class="titleClass">{{ title }}</div>

          <el-icon class="icon-close" @click="close"><Close /></el-icon>
        </div>
      </template>

      <div
        v-if="dialogVisible"
        class="assistant-container"
        v-loading="pageLoading"
      >
        <business-group
          ref="businessGroupRef"
          @change-group="changeGroup"
          @delete-group="deleteGroup"
          @add-dialog="addDialog"
        />
        <assistant-chat
          ref="chatRef"
          width="80%"
          @msg-text-link="msgTextLink"
          @create-group="createGroup"
        >
        </assistant-chat>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  defineAsyncComponent,
  ref,
  watch,
  toRefs,
  nextTick,
  onMounted,
  onUnmounted
} from 'vue'
import { debounce } from 'lodash'
import { getAssetsImgFile } from '@/utils/tool'

const BusinessGroup = defineAsyncComponent(
  () => import('./components/BusinessGroup/index.vue')
)
const AssistantChat = defineAsyncComponent(
  () => import('./components/AssistantChat/index.vue')
)

const props = withDefaults(
  defineProps<{
    title?: string
  }>(),
  {
    title: '智能助手'
  }
)

const { title } = toRefs(<IReactive>props)

const emit = defineEmits(['close'])

const dialogVisible = ref(false)
watch(dialogVisible, newVal => {
  if (!newVal) {
    chatRef.value?.clear()
    businessGroupRef.value?.clear()
    curBusinessType.value = '0'

    emit('close')
  }
})

const pageLoading = ref(false)

const aiName = ref('彗星')

const businessGroupRef = ref()
const chatRef = ref()
const isMoving = ref(false)
const openDialog = () => {
  if (isMoving.value || dialogVisible.value) {
    return
  }
  dialogVisible.value = true
  setTimeout(() => {
    chatRef.value?.init()
    chatRef.value?.appendMsgItem(builtInMsg.init)
    businessGroupRef.value?.addDialog()
  }, 500)
}

const msgTextLink = async (_link: string) => {}

const createGroup = (groupInfo: IReactive) => {
  businessGroupRef.value.groups.unshift(groupInfo)
}

// 内置消息
const builtInMsg = {
  init: {
    content: {
      emphasize: `您好，我是${aiName.value}`,
      prefixContent: '你需要我如何帮助你呢？',
      showBusinessCards: true,
      extContent: '试试这样和我说话：',
      btnExamples: ['日志查询', '功能查询']
    },
    role: 0,
    type: 3,
    userId: '',
    groupId: ''
  }
}

const changeGroup = (groupInfo: IReactive) => {
  if (!chatRef.value) {
    return
  }
  chatRef.value.groupInfo.groupId = groupInfo.groupId
  chatRef.value.groupInfo.groupName = groupInfo.groupName
}

const deleteGroup = (groupId: string) => {
  if (!groupId || groupId === chatRef.value.groupInfo.groupId) {
    businessGroupRef.value?.createGroup()
  }
}

const addDialog = () => {
  nextTick(() => {
    chatRef.value?.appendMsgItem(builtInMsg.init)
  })
}

/**拖拽移动 */
const assitantRntryRef = ref()

const mousedown = (event: Event) => {
  event.preventDefault()

  setTimeout(() => {
    isMoving.value = true
  }, 300)

  document.onmousemove = function (e) {
    const el = assitantRntryRef.value

    const left = Math.min(window.innerWidth - 64, e.pageX - 34)
    const top = Math.min(window.innerHeight - 64, e.pageY - 28)

    el.style.left = `${Math.max(0, left)}px`
    el.style.top = `${Math.max(0, top)}px`

    savePosition(left, top)
  }
}

const savePosition = debounce((left, top) => {
  sessionStorage.setItem('inquireDataPosition', JSON.stringify({ left, top }))
}, 300)

const mouseup = () => {
  document.onmousemove = () => {}
  setTimeout(() => {
    isMoving.value = false
  }, 300)
}

let temFlag = false
const keyOpenDialog = (e: KeyboardEvent) => {
  const code = e.code
  if (code === 'Space') {
    if (temFlag) {
      openDialog()
    }
    temFlag = true
    setTimeout(() => {
      temFlag = false
    }, 500)
  }
}

onMounted(() => {
  const inquireDataPositionStr = sessionStorage.getItem('inquireDataPosition')
  if (inquireDataPositionStr && assitantRntryRef.value) {
    const inquireDataPosition = JSON.parse(inquireDataPositionStr)

    assitantRntryRef.value.style.left = `${Math.min(window.innerWidth - 80, inquireDataPosition.left)}px`
    assitantRntryRef.value.style.top = `${Math.min(window.innerHeight - 80, inquireDataPosition.top)}px`
  }

  window.addEventListener('keydown', keyOpenDialog)
})

onUnmounted(() => {
  window.removeEventListener('keydown', keyOpenDialog)
})

defineExpose({ openDialog })
</script>

<style scoped lang="less">
.assitant-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  left: calc(100vw - 16px - 64px);
  top: calc(100vh - 80px - 64px);
  width: 64px;
  height: 64px;
  cursor: pointer;
  z-index: 999;
  &__icon {
    width: 100%;
    height: 100%;
    background: url('@/assets/img/assistant/assistant-icon__animation.png')
      no-repeat;
    background-size: contain;
    border-radius: 50%;
    position: absolute;
    z-index: 3;
    // &:hover {
    //   background: url('@/assets/img/assistant/inquire-data__hover.png') no-repeat;
    //   background-size: contain;
    // }
    &-ripple {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      position: absolute;
      z-index: 2;
      &::before {
        content: '';
        animation: entry-ripple ease 3s infinite;
        width: 100%;
        height: 100%;
        display: block;
        background: #94c8ff;
        border-radius: 50%;
        position: absolute;
        z-index: 1;
      }
    }
  }

  &__drag {
    width: 100%;
    height: 100%;
    background: url('@/assets/img/assistant/assistant-icon__drag.png') no-repeat;
    background-size: contain;
  }
  .hover-show {
    display: none;
  }
  .hover-hidden {
    display: block;
  }
  &:hover {
    .hover-show {
      display: block;
    }
    .hover-hidden {
      display: none;
    }
  }

  @keyframes entry-ripple {
    0% {
      transform: scale(0.9);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
}

.assistant-header {
  width: 100%;
  height: 50px;
  background: #ffffff;
  border-bottom: solid 1px #dfdfe6;
  padding: 10px 15px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .logo {
    width: 30px;
    height: 30px;
    margin-right: 10px;
    &-title {
      color: #343438;
      font-size: 16px;
    }
  }

  .title {
    font-size: 16px;
    color: #333333;
    font-weight: bold;
  }

  .icon-close {
    font-size: 20px;
    cursor: pointer;
    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.assistant-container {
  height: 81.5vh;
  display: flex;
  .ask-tabs {
    width: 252px;
    height: 40px;
    background: #ffffff;
    border-radius: 23px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px;
    box-sizing: border-box;
    margin-bottom: 20px;
    gap: 4px;
    .ask-tab {
      width: 50%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #343438;
      font-size: 14px;
      cursor: pointer;
      border-radius: 15px;
      &__active {
        background: #e8f3ff;
      }
      &:hover {
        color: var(--el-color-primary);
      }
      &__disabled {
        cursor: not-allowed;
        background-color: var(--el-disabled-bg-color);
        color: var(--el-disabled-text-color);
        border-radius: 15px;
        &:hover {
          background-color: var(--el-disabled-bg-color);
          color: var(--el-disabled-text-color);
          border-radius: 15px;
        }
      }
    }
  }
}
</style>

<style lang="less">
.assistant-dialog {
  margin: 0px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .el-dialog__header {
    padding-bottom: 0px;
  }
}
</style>
