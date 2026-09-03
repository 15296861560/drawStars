<template>
  <div class="im-index">
    <!-- 降级/互踢横幅 -->
    <div v-if="auth.degraded" class="im-index-banner warn">
      实时连接已降级，消息将通过接口拉取（{{ auth.wsState }}）
    </div>

    <div class="im-index-body">
      <!-- 左侧：导航 Tab + 会话列表 / 通讯录 / 大厅入口 -->
      <div class="im-index-left">
        <div class="im-index-nav">
          <div
            v-for="t in tabs"
            :key="t.key"
            class="im-index-nav-item"
            :class="{ active: tab === t.key }"
            @click="onTab(t.key)"
          >
            <el-badge :value="t.badge" :hidden="!t.badge" :max="99">
              <span class="im-index-nav-ico">{{ t.icon }}</span>
            </el-badge>
            <span class="im-index-nav-label">{{ t.label }}</span>
          </div>
        </div>

        <div class="im-index-panel">
          <ConversationList v-show="tab === 'message'" ref="convListRef" />
          <Contacts v-show="tab === 'contacts'" />
          <Hall v-show="tab === 'hall'" />
        </div>
      </div>

      <!-- 右侧：聊天窗 / 空态 -->
      <div class="im-index-right">
        <ChatWindow v-if="activeId" :key="activeId" :conversation-id="activeId" />
        <div v-else class="im-index-empty">
          <el-empty description="选择一个会话开始聊天" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import ConversationList from './ConversationList.vue'
import Contacts from './contacts/Contacts.vue'
import Hall from './hall/Hall.vue'
import ChatWindow from './chat/ChatWindow.vue'
import { imStore } from '@/stores/im/im-im'
import { imAuthStore } from '@/stores/im/im-auth'
import { imConversationStore } from '@/stores/im/im-conversation'
import { imRelationStore } from '@/stores/im/im-relation'

const im = imStore()
const auth = imAuthStore()
const convStore = imConversationStore()
const relation = imRelationStore()
const route = useRoute()

const tab = ref<'message' | 'contacts' | 'hall'>('message')
const convListRef = ref<InstanceType<typeof ConversationList> | null>(null)

const activeId = computed(() => convStore.activeId)

const tabs = computed(() => [
  { key: 'message' as const, label: '消息', icon: '💬', badge: convStore.totalUnread },
  { key: 'contacts' as const, label: '通讯录', icon: '👥', badge: relation.pendingReceived.length },
  { key: 'hall' as const, label: '大厅', icon: '🌐', badge: 0 }
])

/** 路由 path → tab，与 RBAC 菜单 path 对齐（仅菜单进入时定位，单向） */
function tabFromPath(path: string): 'message' | 'contacts' | 'hall' {
  if (path.endsWith('/hall')) return 'hall'
  if (path.endsWith('/contacts')) return 'contacts'
  return 'message'
}

/** tab 切换：纯前端状态，不走路由，避免整页重挂 */
function onTab(key: 'message' | 'contacts' | 'hall') {
  tab.value = key
}

onMounted(async () => {
  tab.value = tabFromPath(route.path)
  im.init()
  await Promise.all([convStore.fetchList(), relation.fetchPending().catch(() => [])])
})

watch(
  () => route.path,
  p => {
    tab.value = tabFromPath(p)
  }
)

onBeforeUnmount(() => {
  // 保留全局 WS 连接（用户可能切到其他页面）；仅清理会话订阅在 ChatWindow onUnmounted 处理
})
</script>

<style scoped lang="less">
.im-index {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);
  min-height: 520px;
  background: @color-bg;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid @color-bg-divider;
}
.im-index-banner {
  padding: 6px 16px;
  font-size: 12px;
  &.warn {
    background: fade(@color-important, 12%);
    color: @color-important;
  }
}
.im-index-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.im-index-left {
  width: 320px;
  display: flex;
  border-right: 1px solid @color-bg-divider;
}
.im-index-nav {
  width: 64px;
  background: @color-base-bg;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 12px;
  gap: 4px;
}
.im-index-nav-item {
  width: 56px;
  padding: 8px 0;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  margin: 2px;
  color: @color-text-secondary;
  transition: background-color 0.15s, color 0.15s;
  &:hover {
    background: @color-fill-hover;
  }
  &.active {
    background: fade(@color-primary, 10%);
    color: @color-primary;
  }
}
.im-index-nav-ico {
  font-size: 22px;
}
.im-index-nav-label {
  display: block;
  font-size: 11px;
  margin-top: 2px;
}
.im-index-panel {
  flex: 1;
  overflow: hidden;
  padding: 8px;
  box-sizing: border-box;
}
.im-index-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.im-index-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
