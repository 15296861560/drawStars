<template>
  <div class="lifecycle pc-page">
    <div class="section-head pc-page-title">{{ $t('title') }}</div>
    <div class="section-body pc-page-body">
      <el-alert :title="$t('warning')" type="warning" show-icon :closable="false" class="mb16" />
      <el-form label-width="7rem" style="max-width: 28rem">
        <el-form-item :label="$t('password')">
          <el-input v-model="password" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="deactivate">{{ $t('deactivate') }}</el-button>
          <el-button type="danger" @click="remove">{{ $t('delete') }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { i18nLabelMixin } from '@/views/mixin/i18nLabelMixin'
import { findReq } from '@/assets/js/api'
import { userInfoStore } from '@/stores/user-info'
import { ElMessageBox } from 'element-plus'

const userInfo = userInfoStore()
const deactivateAccount = findReq('profileController', 'deactivateAccount')
const deleteAccount = findReq('profileController', 'deleteAccount')

export default {
  mixins: [i18nLabelMixin],
  data() {
    return { password: '' }
  },
  methods: {
    async deactivate() {
      try {
        await ElMessageBox.confirm(this.$t('confirmDeactivate'), this.$t('title'), { type: 'warning' })
      } catch {
        return
      }
      const res = await deactivateAccount({
        id: userInfo.getUserId,
        password: this.password
      })
      if (res.status) {
        this.$message.success(this.$t('ok'))
        this.logout()
      } else {
        this.$message.error(res.msg || this.$t('fail'))
      }
    },
    async remove() {
      try {
        await ElMessageBox.confirm(this.$t('confirmDelete'), this.$t('title'), { type: 'error' })
      } catch {
        return
      }
      const res = await deleteAccount({
        id: userInfo.getUserId,
        password: this.password
      })
      if (res.status) {
        this.$message.success(this.$t('ok'))
        this.logout()
      } else {
        this.$message.error(res.msg || this.$t('fail'))
      }
    },
    logout() {
      if (userInfo.clearUserInfo) userInfo.clearUserInfo()
      else {
        userInfo.changeUserInfo({})
        userInfo.updateToken('')
      }
      import('@/stores/permission').then(({ permissionStore }) => {
        permissionStore().clearPermission()
      })
      this.$router.push('/login')
    }
  }
}
</script>
<style lang="less" scoped>
.lifecycle {
  .mb16 {
    margin-bottom: 1rem;
  }
}
</style>
<i18n>
{
  "en": {
    "title": "Account Security",
    "warning": "Deactivate or delete is irreversible for login. Please confirm carefully.",
    "password": "Password",
    "deactivate": "Deactivate account",
    "delete": "Delete account",
    "confirmDeactivate": "Deactivate this account?",
    "confirmDelete": "Permanently delete this account?",
    "ok": "Done",
    "fail": "Failed"
  },
  "zh": {
    "title": "账号生命周期",
    "warning": "停用或注销后将无法继续登录，请谨慎操作。",
    "password": "登录密码",
    "deactivate": "停用账号",
    "delete": "注销账号",
    "confirmDeactivate": "确认停用当前账号？",
    "confirmDelete": "确认注销并删除当前账号？此操作不可恢复。",
    "ok": "操作成功",
    "fail": "操作失败"
  }
}
</i18n>
