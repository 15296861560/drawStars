<template>
  <div class="im-hall">
    <div class="im-hall-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索房间号/名称（倾诉房需精确房号）"
        size="small"
        clearable
        @keydown.enter="onSearch"
      />
      <el-button size="small" type="primary" @click="onSearch">搜索</el-button>
      <el-button size="small" @click="createDialog = true">创建房间</el-button>
    </div>

    <el-scrollbar class="im-hall-scroll">
      <ImListRow
        v-for="r in hallList"
        :key="r.roomId"
        :name="r.title"
        :avatar="r.coverUrl"
        :sub="r.notice"
        @click="enter(r)"
      >
        <template #tag>
          <el-tag v-if="r.official" size="small" type="warning">官方</el-tag>
          <el-tag v-if="r.onlineCount" size="small" type="success">{{ r.onlineCount }}在线</el-tag>
        </template>
        <template #sub>
          <div class="im-hall-tags">
            <span v-for="t in r.tags" :key="t" class="im-hall-tag">#{{ t }}</span>
            <span v-if="r.notice">{{ r.notice }}</span>
          </div>
        </template>
      </ImListRow>
      <div v-if="hallLoading" class="im-hall-more">加载中…</div>
      <el-empty v-if="!hallList.length && !hallLoading" description="暂无房间" :image-size="60" />
    </el-scrollbar>

    <el-dialog v-model="createDialog" title="创建房间" width="420px">
      <el-form label-width="80px" size="small">
        <el-form-item label="标题"><el-input v-model="createForm.title" /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="createForm.categoryId" placeholder="选择分类" style="width:100%">
            <el-option label="普通房间" value="" />
            <el-option label="倾诉房" value="CONFIDE" />
          </el-select>
        </el-form-item>
        <el-form-item label="公告"><el-input v-model="createForm.notice" type="textarea" /></el-form-item>
        <el-form-item label="加入方式">
          <el-select v-model="createForm.joinMode" style="width:100%">
            <el-option label="自由加入" value="FREE" />
            <el-option label="审批加入" value="APPROVE" />
          </el-select>
        </el-form-item>
        <el-form-item label="匿名发言"><el-switch v-model="createForm.anonymousSpeak" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialog = false">取消</el-button>
        <el-button type="primary" @click="onCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { imRoomStore } from '@/stores/im/im-room'
import type { ImRoom } from '@/api/im/types'

const ImListRow = defineAsyncComponent(() => import('@/components/im/ImListRow.vue'))

const store = imRoomStore()
const router = useRouter()

const keyword = ref('')
const createDialog = ref(false)
const createForm = ref({ title: '', categoryId: '', notice: '', joinMode: 'FREE', anonymousSpeak: false })

const hallList = ref<ImRoom[]>([])
const hallLoading = ref(false)

async function refresh(reset = true) {
  await store.fetchHall({ keyword: keyword.value, reset })
  hallList.value = store.hallList
  hallLoading.value = store.hallLoading
}

onMounted(() => refresh(true))

function onSearch() {
  refresh(true)
}

async function enter(r: ImRoom) {
  router.push(`/home/im/room/${r.roomId}`)
}

async function onCreate() {
  if (!createForm.value.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  const res = await store.createRoom(createForm.value)
  if (res.status && res.data) {
    ElMessage.success('创建成功')
    createDialog.value = false
    refresh(true)
    if (res.data.roomId) router.push(`/home/im/room/${res.data.roomId}`)
  }
}
</script>

<style scoped lang="less">
.im-hall {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.im-hall-bar {
  display: flex;
  gap: 6px;
  padding: 8px;
  align-items: center;
}
.im-hall-scroll {
  flex: 1;
}
.im-hall-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.im-hall-tag {
  font-size: 11px;
  color: @color-primary;
}
.im-hall-more {
  text-align: center;
  padding: 8px;
  font-size: 12px;
  color: @color-text-placeholder;
}
</style>
