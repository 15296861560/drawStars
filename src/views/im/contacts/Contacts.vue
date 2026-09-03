<template>
  <div class="im-contacts">
    <el-tabs v-model="tab" class="im-contacts-tabs">
      <el-tab-pane label="好友" name="friends">
        <el-scrollbar height="100%">
          <ImListRow
            v-for="f in friends"
            :key="f.id"
            :name="f.profile?.nick || `用户${f.friendId}`"
            :sub="f.remark || '好友'"
          >
            <template #extra>
              <el-button text @click="remove(f)">删除</el-button>
            </template>
          </ImListRow>
          <el-empty v-if="!friends.length" description="暂无好友" :image-size="60" />
        </el-scrollbar>
      </el-tab-pane>

      <el-tab-pane :label="`申请(${pendingReceived.length})`" name="pending">
        <ImListRow
          v-for="p in pendingReceived"
          :key="p.id"
          :name="`用户${p.friendId}`"
          :sub="p.remark || '请求加为好友'"
        >
          <template #extra>
            <el-button type="primary" size="small" @click="respond(p, true)">同意</el-button>
            <el-button size="small" @click="respond(p, false)">拒绝</el-button>
          </template>
        </ImListRow>
        <el-empty v-if="!pendingReceived.length" description="暂无好友申请" :image-size="60" />
      </el-tab-pane>

      <el-tab-pane label="黑名单" name="blacklist">
        <ImListRow
          v-for="b in blacklist"
          :key="b.id"
          :name="`用户${b.targetId}`"
        >
          <template #extra>
            <el-button text @click="unblock(b)">移出</el-button>
          </template>
        </ImListRow>
        <el-empty v-if="!blacklist.length" description="黑名单为空" :image-size="60" />
      </el-tab-pane>
    </el-tabs>

    <div class="im-contacts-add">
      <el-button type="primary" plain size="small" @click="addDialog = true">+ 添加好友</el-button>
    </div>

    <el-dialog v-model="addDialog" title="添加好友" width="360px">
      <el-input v-model="addId" placeholder="输入用户 ID" />
      <template #footer>
        <el-button @click="addDialog = false">取消</el-button>
        <el-button type="primary" @click="onAdd">发送申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { imRelationStore } from '@/stores/im/im-relation'
import type { ImFriendship, ImBlacklistItem } from '@/api/im/types'

const ImListRow = defineAsyncComponent(() => import('@/components/im/ImListRow.vue'))

const store = imRelationStore()
const tab = ref('friends')
const friends = ref<ImFriendship[]>([])
const pendingReceived = ref<ImFriendship[]>([])
const blacklist = ref<ImBlacklistItem[]>([])

const addDialog = ref(false)
const addId = ref('')

async function refresh() {
  friends.value = await store.fetchFriends()
  pendingReceived.value = await store.fetchPending()
  blacklist.value = await store.fetchBlacklist()
}

onMounted(refresh)

async function respond(p: ImFriendship, accept: boolean) {
  const res = await store.respondFriend(String(p.friendId), accept)
  if (res.status) {
    ElMessage.success(accept ? '已同意' : '已拒绝')
    refresh()
  }
}

async function remove(f: ImFriendship) {
  await store.removeFriend(String(f.friendId))
  refresh()
}

async function unblock(b: ImBlacklistItem) {
  await store.removeBlacklist(String(b.targetId))
  refresh()
}

async function onAdd() {
  if (!addId.value.trim()) return
  const res = await store.requestFriend(addId.value.trim())
  if (res.status) ElMessage.success('申请已发送')
  addDialog.value = false
  addId.value = ''
}
</script>

<style scoped lang="less">
.im-contacts {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.im-contacts-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  :deep(.el-tabs__content) {
    flex: 1;
    overflow: auto;
  }
}
.im-contacts-add {
  padding: 8px;
  border-top: 1px solid @color-bg-divider;
  text-align: center;
}
</style>
