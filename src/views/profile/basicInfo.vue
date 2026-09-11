<template>
  <div class="personal-profile pc-page">
    <div class="base-info">
      <div class="base-info-head pc-page-title">{{ $t('baseInfo') }}</div>

      <div class="base-info-content pc-page-body">
        <div class="avatar-block">
          <el-avatar
            class="avatar-img"
            :size="80"
            :src="personalData.avatar || undefined"
          >
            {{ (personalData.nickname || 'U').slice(0, 1) }}
          </el-avatar>
          <div class="avatar-meta">
            <div class="avatar-name">
              {{ personalData.nickname || $t('personalData.nickname') }}
            </div>
            <div class="avatar-id">
              {{ $t('personalData.userID') }}：{{ personalData.userID || '-' }}
            </div>
            <div class="avatar-actions">
              <el-upload
                class="avatar-upload"
                :show-file-list="false"
                :auto-upload="false"
                accept="image/jpg,image/jpeg,image/png"
                :on-change="onAvatarChange"
              >
                <el-button link type="primary">{{
                  $t('btn.uploadAvatar')
                }}</el-button>
              </el-upload>
              <el-button
                v-if="personalData.avatar"
                link
                type="danger"
                @click="removeAvatar"
              >
                {{ $t('btn.deleteAvatar') }}
              </el-button>
            </div>
          </div>
        </div>

        <el-form
          ref="form"
          class="base-form"
          :model="personalData"
          label-width="7rem"
          label-position="right"
        >
          <el-form-item :label="$t('personalData.accountAlias')">
            <el-input
              v-model="personalData.accountAlias"
              :placeholder="$t('placeholder.accountAlias')"
              clearable
            />
          </el-form-item>

          <el-form-item :label="$t('personalData.roleName')">
            <span class="readonly-text">{{ roleInfo.roleName || '-' }}</span>
          </el-form-item>

          <el-form-item :label="$t('personalData.level')">
            <span class="readonly-text">{{ roleInfo.level || '-' }}</span>
          </el-form-item>

          <el-form-item :label="$t('personalData.nickname')" required>
            <el-input
              v-model="personalData.nickname"
              :placeholder="$t('placeholder.nickname')"
              clearable
            />
          </el-form-item>

          <el-form-item :label="$t('personalData.introduction')">
            <el-input
              type="textarea"
              v-model="personalData.introduction"
              :placeholder="$t('placeholder.introduction')"
              :rows="3"
              maxlength="255"
              show-word-limit
            />
          </el-form-item>

          <el-form-item :label="$t('personalData.birthday')">
            <el-date-picker
              type="date"
              :placeholder="$t('placeholder.birthday')"
              v-model="personalData.birthday"
              class="full-width"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-form-item :label="$t('personalData.gender')">
            <el-radio-group v-model="personalData.gender">
              <el-radio :label="$t('genderGroup.secrecy')" border />
              <el-radio :label="$t('genderGroup.male')" border />
              <el-radio :label="$t('genderGroup.female')" border />
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="$t('personalData.region')">
            <el-cascader
              :placeholder="$t('placeholder.region')"
              v-model="personalData.region"
              :props="cascaderProps"
              class="region"
              clearable
            />
          </el-form-item>

          <el-form-item class="form-actions">
            <el-button type="primary" @click="updateUserInfo">{{
              $t('btn.save')
            }}</el-button>
            <el-button @click="cancel">{{ $t('btn.cancel') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
import { debounce } from 'lodash'
import { i18nLabelMixin } from '@/views/mixin/i18nLabelMixin'
import { findReq } from '@/assets/js/api'
import { userInfoStore } from '@/stores/user-info'

const userInfo = userInfoStore()
const queryPovinceList = findReq('resourceController', 'queryPovinceList')
const queryCityList = findReq('resourceController', 'queryCityList')
const queryAreaList = findReq('resourceController', 'queryAreaList')
const queryTownList = findReq('resourceController', 'queryTownList')
const queryUserInfo = findReq('profileController', 'queryUserInfo')
const updateUserInfoApi = findReq('profileController', 'updateUserInfo')
const uploadAvatar = findReq('profileController', 'uploadAvatar')
const deleteAvatar = findReq('profileController', 'deleteAvatar')
const myRoles = findReq('profileController', 'myRoles')
const DEBOUNCE_TIME = 1000

export default {
  mixins: [i18nLabelMixin],
  data() {
    return {
      userData: {},
      roleInfo: {
        level: '',
        roleName: ''
      },
      personalData: {
        nickname: '',
        userID: '',
        accountAlias: '',
        gender: '',
        introduction: '',
        region: [],
        birthday: '',
        avatar: ''
      },
      cascaderProps: {
        lazy: true,
        lazyLoad(node, resolve) {
          const level = node.level
          const run = async () => {
            if (level === 0) {
              const result = await queryPovinceList()
              return result.map(r => ({
                value: r.province,
                label: r.name,
                leaf: false
              }))
            }
            if (level === 1) {
              const result = await queryCityList({ province: node.value })
              let nodes = result.map(r => ({
                value: r.city,
                label: r.name,
                leaf: false
              }))
              if (!nodes.length)
                nodes = [{ value: '01', label: node.label, leaf: false }]
              return nodes
            }
            if (level === 2) {
              const result = await queryAreaList({
                province: node.parent.value,
                city: node.value
              })
              return result.map(r => ({
                value: r.area,
                label: r.name,
                leaf: false
              }))
            }
            const result = await queryTownList({
              province: node.parent.parent.value,
              city: node.parent.value,
              area: node.value
            })
            return result.map(r => ({
              value: r.town,
              label: r.name,
              leaf: true
            }))
          }
          run()
            .then(resolve)
            .catch(() => resolve([]))
        }
      }
    }
  },
  created() {
    this.initUserInfo()
  },
  methods: {
    async initUserInfo() {
      const [res, roleRes] = await Promise.all([
        queryUserInfo(userInfo.getUserId),
        myRoles(userInfo.getUserId)
      ])
      const data = (res && res.data) || res
      if (!data || !data.id) return
      this.userData = data
      this.personalData = {
        nickname: data.name || '',
        userID: data.id,
        accountAlias: data.accountAlias || '',
        gender: data.gender || this.$t('genderGroup.secrecy'),
        introduction: data.introduction || '',
        region: data.region ? String(data.region).split(',') : [],
        birthday: data.birthday || '',
        avatar: data.avatar || ''
      }
      const roleData = (roleRes && roleRes.data) || roleRes
      if (roleData) {
        this.roleInfo = {
          level: roleData.level ?? '',
          roleName: roleData.roleName || ''
        }
      }
      userInfo.changeUserInfo({
        name: data.name,
        userId: data.id,
        phone: data.phone,
        email: data.email,
        avatar: data.avatar,
        accountAlias: data.accountAlias,
        level: data.level
      })
    },
    updateUserInfo: debounce(
      async function () {
        const params = {
          id: userInfo.getUserId,
          name: this.personalData.nickname,
          accountAlias: this.personalData.accountAlias,
          introduction: this.personalData.introduction,
          birthday: this.personalData.birthday,
          region: Array.isArray(this.personalData.region)
            ? this.personalData.region.toString()
            : this.personalData.region,
          gender: this.personalData.gender
        }
        const res = await updateUserInfoApi(params)
        if (res.status) {
          this.userData = { ...this.userData, ...params }
          userInfo.changeUserInfo({
            name: params.name,
            accountAlias: params.accountAlias
          })
          this.$message.success(this.$t('tip.updateSuccess'))
        } else {
          this.$message.error(res.msg || this.$t('tip.updateFail'))
        }
      },
      DEBOUNCE_TIME,
      { leading: true, trailing: false }
    ),
    cancel() {
      this.initUserInfo()
    },
    async onAvatarChange(file) {
      if (!file || !file.raw) return
      const formData = new FormData()
      formData.append('file', file.raw)
      formData.append('filename', file.name)
      formData.append('id', String(userInfo.getUserId))
      const res = await uploadAvatar(formData)
      if (res.status) {
        this.personalData.avatar = (res.data && res.data.url) || ''
        userInfo.changeUserInfo({ avatar: this.personalData.avatar })
        this.$message.success(this.$t('tip.avatarOk'))
      } else {
        this.$message.error(res.msg || this.$t('tip.updateFail'))
      }
    },
    async removeAvatar() {
      const res = await deleteAvatar({ id: userInfo.getUserId })
      if (res.status) {
        this.personalData.avatar = ''
        userInfo.changeUserInfo({ avatar: '' })
        this.$message.success(this.$t('tip.avatarRemoved'))
      } else {
        this.$message.error(res.msg || this.$t('tip.updateFail'))
      }
    }
  }
}
</script>
<style lang="less" scoped>
.personal-profile {
  .base-info {
    display: flex;
    flex-direction: column;

    .base-info-content {
      max-width: 36rem;

      .avatar-block {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        margin: 0 0 1.5rem 7rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid @color-bg-divider;
      }

      .avatar-img {
        flex-shrink: 0;
        background: @color-fill-hover;
        color: @color-text-secondary;
        border: 1px solid @color-liner-border;
        font-size: 1.5rem;
        font-weight: 600;
      }

      .avatar-meta {
        min-width: 0;
      }

      .avatar-name {
        font-size: 1rem;
        font-weight: 600;
        color: @color-text-normal;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .avatar-id {
        margin-top: 0.25rem;
        font-size: 0.8125rem;
        color: @color-text-placeholder;
        line-height: 1.4;
      }

      .avatar-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }

      .avatar-upload {
        display: inline-flex;
        line-height: 1;
      }

      .base-form {
        :deep(.el-form-item) {
          margin-bottom: 1.25rem;
        }

        :deep(.el-form-item__label) {
          color: @color-text-secondary;
        }

        :deep(.el-input),
        :deep(.el-textarea) {
          width: 100%;
        }

        :deep(.el-radio) {
          margin-right: 0.75rem;
        }
      }

      .readonly-text {
        color: @color-text-normal;
        line-height: 1.5;
      }

      .region,
      .full-width {
        width: 100%;
      }

      .form-actions {
        margin-top: 0.5rem;
        margin-bottom: 0;

        :deep(.el-form-item__content) {
          gap: 0.75rem;
        }
      }
    }
  }
}
</style>
<i18n>
{
  "en": {
    "baseInfo": "Basic Info",
    "personalData": {
      "avatar": "Avatar",
      "nickname": "Nickname",
      "userID": "User ID",
      "accountAlias": "Account Alias",
      "gender": "Gender",
      "introduction": "Bio",
      "region": "Region",
      "birthday": "Birthday",
      "roleName": "Role",
      "level": "Level"
    },
    "genderGroup": { "male": "Male", "female": "Female", "secrecy": "Private" },
    "placeholder": {
      "nickname": "Please enter a nickname",
      "introduction": "Please enter your profile",
      "accountAlias": "Public display account",
      "birthday": "Select birthday",
      "region": "Select region"
    },
    "btn": { "save": "Save", "cancel": "Cancel", "uploadAvatar": "Change avatar", "deleteAvatar": "Remove" },
    "tip": {
      "updateSuccess": "Updated",
      "updateFail": "Update failed",
      "avatarOk": "Avatar updated",
      "avatarRemoved": "Avatar removed"
    }
  },
  "zh": {
    "baseInfo": "基础信息",
    "personalData": {
      "avatar": "头像",
      "nickname": "昵称",
      "userID": "用户 ID",
      "accountAlias": "账号别名",
      "gender": "性别",
      "introduction": "个人简介",
      "region": "所在地区",
      "birthday": "出生日期",
      "roleName": "角色",
      "level": "等级"
    },
    "genderGroup": { "male": "男", "female": "女", "secrecy": "保密" },
    "placeholder": {
      "nickname": "请输入昵称",
      "introduction": "请输入个人简介",
      "accountAlias": "对外显示的账号名",
      "birthday": "请选择出生日期",
      "region": "请选择所在区域"
    },
    "btn": { "save": "保存", "cancel": "取消", "uploadAvatar": "更换头像", "deleteAvatar": "删除" },
    "tip": {
      "updateSuccess": "更新成功",
      "updateFail": "更新失败",
      "avatarOk": "头像已更新",
      "avatarRemoved": "头像已删除"
    }
  }
}
</i18n>
