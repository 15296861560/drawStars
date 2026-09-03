<template>
  <div class="pc-page im-profile">
    <el-card shadow="never">
      <template #header><span>IM 资料与隐私</span></template>

      <!-- 基础身份信息：数据源为个人中心 / User 表，此处只读展示 -->
      <div class="im-profile-base">
        <div class="im-profile-base-title">
          基础信息
          <el-link type="primary" :underline="false" class="im-profile-base-link" @click="goPersonalCenter">
            去个人中心修改 ›
          </el-link>
        </div>
        <el-form label-width="120px" size="default" class="im-profile-readonly">
          <el-form-item label="昵称">
            <el-input :model-value="form.nick || '-'" readonly />
          </el-form-item>
          <el-form-item label="头像">
            <div class="im-profile-avatar">
              <el-avatar :size="56" :src="form.avatar || undefined">
                {{ (form.nick || 'U').slice(0, 1) }}
              </el-avatar>
            </div>
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group :model-value="form.gender" disabled>
              <el-radio value="MALE">男</el-radio>
              <el-radio value="FEMALE">女</el-radio>
              <el-radio value="UNKNOWN">保密</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="个性签名">
            <el-input :model-value="form.signature || ''" type="textarea" :rows="2" readonly />
          </el-form-item>
        </el-form>
      </div>

      <el-divider />

      <!-- IM 专属设置：可在本页编辑 -->
      <div class="im-profile-base-title">IM 专属设置</div>
      <el-form :model="form" label-width="120px" size="default" style="max-width: 540px">
        <el-form-item label="兴趣标签">
          <el-select v-model="form.tags" multiple filterable allow-create placeholder="回车添加" style="width:100%">
            <el-option v-for="t in form.tags" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="允许陌生人私信"><el-switch v-model="form.allowStrangerMsg" /></el-form-item>
        <el-form-item label="展示在线状态"><el-switch v-model="form.showOnline" /></el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/im'

const router = useRouter()

const form = ref<Record<string, any>>({
  // 基础身份（只读，来自 User 表）
  nick: '',
  avatar: '',
  gender: 'UNKNOWN',
  signature: '',
  // IM 专属（可编辑）
  tags: [],
  allowStrangerMsg: true,
  showOnline: true
})
const saving = ref(false)

function goPersonalCenter() {
  router.push('/home/personalCenter/basicInfo')
}

onMounted(async () => {
  const res = await authApi.getProfile()
  if (res.status && res.data) {
    Object.assign(form.value, res.data)
  }
})

async function onSave() {
  saving.value = true
  try {
    // 仅提交 IM 专属字段；基础身份由个人中心维护
    const res = await authApi.updateProfile({
      tags: form.value.tags,
      allowStrangerMsg: form.value.allowStrangerMsg,
      showOnline: form.value.showOnline
    })
    if (res.status) ElMessage.success('已保存')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="less">
.im-profile {
  max-width: 720px;
}
.im-profile-base {
  margin-bottom: 4px;
}
.im-profile-base-title {
  font-size: 14px;
  font-weight: 600;
  color: @color-text-normal;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.im-profile-base-link {
  font-size: 12px;
  font-weight: normal;
}
.im-profile-readonly {
  max-width: 540px;
  :deep(.el-input.is-disabled .el-input__inner),
  :deep(.el-textarea.is-disabled .el-textarea__inner) {
    color: @color-text-normal;
    background: @color-base-bg;
    cursor: default;
  }
}
.im-profile-avatar {
  display: flex;
  align-items: center;
}
</style>
