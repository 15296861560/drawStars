<template>
  <div class="roles pc-page">
    <div class="section-head pc-page-title">{{ $t('title') }}</div>
    <div class="section-body pc-page-body">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('level')">{{
          info.level
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('roleName')">{{
          info.roleName
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('status')">{{
          info.status
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('alias')">{{
          info.accountAlias || '-'
        }}</el-descriptions-item>
      </el-descriptions>
      <div class="perm-title">{{ $t('permissions') }}</div>
      <ul class="perm-list">
        <li v-for="(p, i) in info.permissions || []" :key="i">{{ p }}</li>
      </ul>
    </div>
  </div>
</template>
<script>
import { i18nLabelMixin } from '@/views/mixin/i18nLabelMixin'
import { findReq } from '@/assets/js/api'
import { userInfoStore } from '@/stores/user-info'

const userInfo = userInfoStore()
const myRoles = findReq('profileController', 'myRoles')

export default {
  mixins: [i18nLabelMixin],
  data() {
    return {
      info: {
        level: 1,
        roleName: '',
        permissions: [],
        status: '',
        accountAlias: ''
      }
    }
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      const res = await myRoles(userInfo.getUserId)
      const data = (res && res.data) || res
      if (data) this.info = data
    }
  }
}
</script>
<style lang="less" scoped>
.roles {
  .perm-title {
    margin: 1.25rem 0 0.5rem;
    font-weight: 600;
  }
  .perm-list {
    padding-left: 1.25rem;
    color: @color-text-secondary;
    line-height: 1.8;
  }
}
</style>
<i18n>
{
  "en": {
    "title": "Roles & Permissions",
    "level": "Level",
    "roleName": "Role",
    "status": "Status",
    "alias": "Account Alias",
    "permissions": "Permissions"
  },
  "zh": {
    "title": "权限与角色",
    "level": "等级",
    "roleName": "角色",
    "status": "状态",
    "alias": "账号别名",
    "permissions": "权限说明"
  }
}
</i18n>
