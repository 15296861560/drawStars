<template>
  <div class="im-mg-shell">
    <el-tabs v-model="tab" type="border-card">
      <el-tab-pane v-if="can('system:chat:analytics')" label="数据分析" name="analytics">
        <Analytics v-if="tab === 'analytics'" />
      </el-tab-pane>
      <el-tab-pane v-if="can('chat:moderation:operate')" label="举报审核" name="reports">
        <Reports v-if="tab === 'reports'" />
      </el-tab-pane>
      <el-tab-pane v-if="can('system:chat:list')" label="消息记录" name="messages">
        <Messages v-if="tab === 'messages'" />
      </el-tab-pane>
      <el-tab-pane v-if="can('system:chat:operate')" label="房间管理" name="rooms">
        <Rooms v-if="tab === 'rooms'" />
      </el-tab-pane>
      <el-tab-pane v-if="can('system:chat:operate')" label="系统配置" name="settings">
        <Settings v-if="tab === 'settings'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { permissionStore } from '@/stores/permission'
import Analytics from './Analytics.vue'
import Reports from './Reports.vue'
import Messages from './Messages.vue'
import Rooms from './Rooms.vue'
import Settings from './Settings.vue'

const tab = ref('analytics')
const store = permissionStore()

function can(code: string): boolean {
  return store.hasPermission(code)
}

onMounted(() => {
  // 切到第一个有权限的 tab
  const order = ['analytics', 'reports', 'messages', 'rooms', 'settings']
  const perms: Record<string, string> = {
    analytics: 'system:chat:analytics',
    reports: 'chat:moderation:operate',
    messages: 'system:chat:list',
    rooms: 'system:chat:operate',
    settings: 'system:chat:operate'
  }
  const first = order.find(o => can(perms[o]))
  if (first) tab.value = first
})
</script>

<style scoped lang="less">
.im-mg-shell {
  padding: 12px;
}
</style>
