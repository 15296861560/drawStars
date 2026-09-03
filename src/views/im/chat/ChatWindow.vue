<template>
  <div class="im-chat-window">
    <div class="im-chat-header">
      <div class="im-chat-title">
        <el-icon v-if="conv?.isPinned"><Star /></el-icon>
        <span>{{ title }}</span>
        <el-tag v-if="conv?.isMuted" size="small" type="info">免打扰</el-tag>
      </div>
      <div class="im-chat-actions">
        <el-dropdown trigger="click" @command="onAction">
          <el-button text :icon="MoreFilled" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="pin">{{ conv?.isPinned ? '取消置顶' : '置顶' }}</el-dropdown-item>
              <el-dropdown-item command="mute">{{ conv?.isMuted ? '取消免打扰' : '免打扰' }}</el-dropdown-item>
              <el-dropdown-item command="delete" divided>删除会话</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <MessageList
      :items="messages"
      :loading="loadingHistory"
      @contextmenu="onContextmenu"
    />

    <MessageInput
      :muted="false"
      :sending="sending"
      @send="onSend"
      @image="onImage"
    />

    <!-- 右键菜单 -->
    <ul v-if="menu.show" class="im-chat-menu" :style="{ left: menu.x + 'px', top: menu.y + 'px' }" @click.stop>
      <li v-if="canRecall" @click="onRecall">撤回</li>
      <li @click="onDelete">删除</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { MoreFilled, Star } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
import { imStore } from '@/stores/im/im-im'
import { imConversationStore } from '@/stores/im/im-conversation'
import { imMessageStore } from '@/stores/im/im-message'
import { roomApi, filesApi } from '@/api/im'
import { MsgStatus, type ImMessage } from '@/api/im/types'
import { userInfoStore } from '@/stores/user-info'

const props = defineProps<{ conversationId: string }>()

const convStore = imConversationStore()
const msgStore = imMessageStore()
const selfUid = () => String(userInfoStore().getUserId.value || '0')

const conv = computed(() => convStore.list.find(c => c.id === props.conversationId))
const messages = computed(() => msgStore.getMessages(props.conversationId))
const loadingHistory = computed(() => !!msgStore.loadingHistory[props.conversationId])
const sending = ref(false)

const title = computed(() => conv.value?.title || conv.value?.bizId || '会话')

const menu = reactive({ show: false, x: 0, y: 0, msg: null as ImMessage | null })
const canRecall = computed(() => {
  const m = menu.msg
  if (!m) return false
  if (String(m.senderId) !== selfUid()) return false
  if (m.status !== MsgStatus.NORMAL) return false
  const ageMin = (Date.now() - Number(m.serverTime)) / 60000
  return ageMin <= 2
})

let closeMenuHandler: (() => void) | null = null

onMounted(async () => {
  await imStore.openConversation(props.conversationId)
  closeMenuHandler = () => (menu.show = false)
  window.addEventListener('click', closeMenuHandler)
})

onUnmounted(() => {
  imStore.closeConversation(props.conversationId)
  if (closeMenuHandler) window.removeEventListener('click', closeMenuHandler)
})

async function onSend(text: string) {
  sending.value = true
  try {
    await msgStore.sendText(props.conversationId, text)
  } finally {
    sending.value = false
  }
}

async function onImage(file: File) {
  // 简化：直接用本地 URL 预览上传（真实环境走 presign + 对象存储）
  sending.value = true
  try {
    const presignRes = await filesApi.presign(file.type, file.size, (file.name.split('.').pop() || 'png'))
    if (presignRes.status && presignRes.data?.url) {
      // 上传文件到 uploadPath（此处仅作演示：用本地对象 URL）
      await msgStore.sendImage(props.conversationId, URL.createObjectURL(file))
    } else {
      // 兜底：本地预览
      await msgStore.sendImage(props.conversationId, URL.createObjectURL(file))
    }
  } catch {
    ElMessage.error('图片发送失败')
  } finally {
    sending.value = false
  }
}

function onContextmenu(msg: ImMessage, x: number, y: number) {
  menu.msg = msg
  menu.x = x
  menu.y = y
  menu.show = true
}

async function onRecall() {
  if (!menu.msg) return
  menu.show = false
  await msgStore.recallMessage(menu.msg.msgId)
}

async function onDelete() {
  if (!menu.msg) return
  menu.show = false
  await msgStore.deleteForMe(menu.msg.msgId)
}

async function onAction(cmd: string) {
  if (!conv.value) return
  if (cmd === 'pin') {
    await convStore.togglePin(props.conversationId, !conv.value.isPinned)
  } else if (cmd === 'mute') {
    await convStore.toggleMute(props.conversationId, !conv.value.isMuted)
  } else if (cmd === 'delete') {
    await ElMessageBox.confirm('确认删除该会话？', '提示', { type: 'warning' })
    await convStore.remove(props.conversationId)
  }
}
</script>

<style scoped lang="less">
.im-chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: @color-base-bg;
}
.im-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: @color-bg;
  border-bottom: 1px solid @color-bg-divider;
}
.im-chat-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 500;
  color: @color-text-normal;
}
.im-chat-menu {
  position: fixed;
  z-index: 3000;
  background: @color-bg;
  border: 1px solid @color-bg-divider;
  border-radius: 6px;
  box-shadow: 0 2px 12px @color-shadow-dropdown;
  padding: 4px 0;
  list-style: none;
  margin: 0;
  li {
    padding: 6px 16px;
    font-size: 13px;
    cursor: pointer;
    color: @color-text-normal;
    &:hover {
      background: @color-fill-hover;
    }
  }
}
</style>
