<template>
  <div class="lifecycle pc-page">
    <div class="section-head pc-page-title">{{ $t('title') }}</div>
    <div class="section-body pc-page-body">
      <el-alert
        :title="$t('warning')"
        type="warning"
        show-icon
        :closable="false"
        class="life-alert"
      />
      <div class="password-block">
        <div class="block-label">{{ $t('password') }}</div>
        <el-input
          v-model="password"
          type="password"
          show-password
          class="password-input"
        />
      </div>
      <div class="danger-grid">
        <div class="danger-card danger-card--warning">
          <div class="card-head">
            <span class="card-tile is-warning" aria-hidden="true">
              <component :is="'Warning'" />
            </span>
            <div class="card-title">{{ $t('deactivate') }}</div>
          </div>
          <div class="card-foot">
            <el-button type="warning" plain @click="deactivate">{{
              $t('deactivate')
            }}</el-button>
          </div>
        </div>
        <div class="danger-card danger-card--danger">
          <div class="card-head">
            <span class="card-tile is-danger" aria-hidden="true">
              <component :is="'CircleClose'" />
            </span>
            <div class="card-title">{{ $t('delete') }}</div>
          </div>
          <div class="card-foot">
            <el-button type="danger" plain @click="remove">{{
              $t('delete')
            }}</el-button>
          </div>
        </div>
      </div>
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
        await ElMessageBox.confirm(
          this.$t('confirmDeactivate'),
          this.$t('title'),
          { type: 'warning' }
        )
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
        await ElMessageBox.confirm(this.$t('confirmDelete'), this.$t('title'), {
          type: 'error'
        })
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
  .life-alert {
    max-width: 40rem;
    margin-bottom: 2rem;
  }

  .password-block {
    max-width: 24rem;
    margin-bottom: 2.5rem;
  }

  .block-label {
    margin-bottom: 0.375rem;
    font-size: @ds-font-sm;
    font-weight: 500;
    color: @color-text-secondary;
    text-align: left;
  }

  .password-input {
    width: 100%;
  }

  .danger-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    gap: 1rem;
    max-width: 40rem;
  }

  .danger-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--ds-bg);
    border: 1px solid @color-bg-divider;
    border-radius: var(--ds-radius-lg);
    transition:
      border-color var(--ds-duration-fast) var(--ds-ease-out),
      box-shadow var(--ds-duration-fast) var(--ds-ease-out);
  }

  .danger-card--warning:hover {
    border-color: var(--el-color-warning);
    box-shadow: var(--ds-shadow-sm);
  }

  .danger-card--danger:hover {
    border-color: var(--el-color-danger);
    box-shadow: var(--ds-shadow-sm);
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    min-width: 0;
  }

  .card-tile {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
    font-size: 1.125rem;
    border-radius: var(--ds-radius-md);

    &.is-warning {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }

    &.is-danger {
      color: var(--el-color-danger);
      background: var(--el-color-danger-light-9);
    }
  }

  .card-title {
    font-size: @ds-font-md;
    font-weight: 600;
    color: @color-text-normal;
    text-align: left;
  }

  .card-foot {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.875rem;
    border-top: 1px solid @color-bg-divider;
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
