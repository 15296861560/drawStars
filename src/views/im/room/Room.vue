<template>
  <div class="im-room">
    <div v-if="loading" class="im-room-loading">加载中…</div>
    <template v-else-if="room">
      <div class="im-room-header">
        <div>
          <h2>{{ room.title }} <el-tag v-if="room.official" size="small" type="warning">官方</el-tag></h2>
          <div class="im-room-meta">
            <span>{{ onlineLabel }} 在线</span>
            <span v-if="room.status === 'CLOSED'"><el-tag type="info" size="small">已关闭</el-tag></span>
            <span v-if="room.status === 'BANNED'"><el-tag type="danger" size="small">已封禁</el-tag></span>
          </div>
        </div>
        <div class="im-room-actions">
          <el-button v-if="!joined" type="primary" @click="onJoin">进入房间</el-button>
          <el-button v-else @click="onLeave">离开</el-button>
          <el-button v-if="isManager" @click="manageDialog = true">管理</el-button>
        </div>
      </div>

      <div class="im-room-notice" v-if="room.notice">公告：{{ room.notice }}</div>

      <div class="im-room-tags" v-if="room.tags?.length">
        <span>共同标签：</span>
        <el-tag v-for="t in room.tags" :key="t" size="small">{{ t }}</el-tag>
      </div>

      <!-- 满员/封禁错误态 -->
      <el-result v-if="room.status === 'BANNED'" icon="error" title="房间已被封禁" sub-title="该房间因违规已被管理员封禁" />

      <div v-else class="im-room-main">
        <ChatWindow v-if="joined && conversationId" :conversation-id="conversationId" />
        <el-empty v-else description="点击「进入房间」开始聊天" />
      </div>
    </template>
    <el-empty v-else description="房间不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ChatWindow from '../chat/ChatWindow.vue'
import { imRoomStore } from '@/stores/im/im-room'
import { imWsClient } from '@/utils/im/ws-client'
import { roomApi } from '@/api/im'

const route = useRoute()
const router = useRouter()
const store = imRoomStore()

const loading = ref(true)
const joined = ref(false)
const conversationId = ref('')
const manageDialog = ref(false)

const roomId = computed(() => String(route.params.roomId || ''))
const room = computed(() => store.currentRoom)
const onlineLabel = computed(() => room.value?.onlineCount ?? 0)
const isManager = computed(() => false) // 简化：实际按成员 role 判断

async function load() {
  loading.value = true
  try {
    const res = await store.enterRoom(roomId.value)
    if (res?.status && res.data) {
      // 已加入则展示会话
    }
  } finally {
    loading.value = false
  }
}

async function onJoin() {
  const res = await roomApi.joinRoom(roomId.value)
  if (res.status) {
    joined.value = true
    if (res.data?.conversationId) conversationId.value = res.data.conversationId
    imWsClient.enterRoom(roomId.value)
    ElMessage.success('已进入房间')
  }
}

async function onLeave() {
  await roomApi.leaveRoom(roomId.value)
  imWsClient.leaveRoom(roomId.value)
  joined.value = false
  ElMessage.success('已离开房间')
}

onMounted(load)
watch(roomId, load)
onBeforeUnmount(() => {
  imWsClient.leaveRoom(roomId.value)
})
</script>

<style scoped lang="less">
.im-room {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);
  min-height: 480px;
}
.im-room-loading {
  padding: 40px;
  text-align: center;
  color: @color-text-placeholder;
}
.im-room-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid @color-bg-divider;
  h2 {
    margin: 0;
    font-size: 18px;
  }
}
.im-room-meta {
  font-size: 12px;
  color: @color-text-placeholder;
  display: flex;
  gap: 10px;
  margin-top: 4px;
}
.im-room-notice {
  padding: 8px 16px;
  background: fade(@color-important, 12%);
  color: @color-important;
  font-size: 13px;
}
.im-room-tags {
  padding: 6px 16px;
  font-size: 12px;
  color: @color-text-secondary;
  display: flex;
  gap: 6px;
  align-items: center;
}
.im-room-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
