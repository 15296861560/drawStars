<template>
  <div class="oauth-bind pc-page">
    <div class="section-head pc-page-title">{{ $t('title') }}</div>
    <div class="section-body pc-page-body">
      <div v-for="item in list" :key="item.platform" class="oauth-item">
        <div class="left">
          <span
            class="platform-icon"
            :class="'platform-icon--' + item.platform"
            aria-hidden="true"
          >
            <i
              v-if="item.platform === 'github'"
              class="drawstars-icon-gitHub"
            ></i>
            <svg
              v-else
              class="platform-svg"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path :d="iconPathOf(item.platform)" fill="currentColor" />
            </svg>
          </span>
          <div class="info">
            <div class="name">{{ labelOf(item.platform) }}</div>
            <div class="status">
              {{ item.bound ? $t('bound') : $t('unbound') }}
              <span v-if="!item.available" class="muted"
                >（{{ $t('unavailable') }}）</span
              >
            </div>
          </div>
        </div>
        <div class="right">
          <el-button v-if="!item.bound" type="primary" @click="bind(item)">{{
            $t('bind')
          }}</el-button>
          <el-button v-else type="danger" plain @click="unbind(item)">{{
            $t('unbind')
          }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { i18nLabelMixin } from '@/views/mixin/i18nLabelMixin'
import { findReq } from '@/assets/js/api'
import { userInfoStore } from '@/stores/user-info'

const userInfo = userInfoStore()
const listOauthBinds = findReq('profileController', 'listOauthBinds')
const oauthBind = findReq('profileController', 'oauthBind')
const oauthUnbind = findReq('profileController', 'oauthUnbind')

const LABELS = {
  wechat: '微信',
  wecom: '企业微信',
  qq: 'QQ',
  github: 'GitHub',
  google: 'Google',
  apple: 'Apple'
}

const ICON_PATHS = {
  wechat:
    'M9.5 4C5.36 4 2 6.91 2 10.5c0 2.08 1.14 3.93 2.93 5.16l-.75 2.25 2.61-1.31c.92.32 1.9.5 2.91.5.27 0 .54-.01.8-.04A5.87 5.87 0 0 1 10 15.5c0-3.37 3.13-6.1 7-6.1.18 0 .36.01.54.02C16.78 6.37 13.45 4 9.5 4zm-2.75 3.75a.88.88 0 1 1 0 1.75.88.88 0 0 1 0-1.75zm5.5 0a.88.88 0 1 1 0 1.75.88.88 0 0 1 0-1.75zM17 10.4c-3.31 0-6 2.24-6 5s2.69 5 6 5c.72 0 1.41-.12 2.05-.33l1.95.98-.56-1.68C21.55 18.3 22.5 16.95 22.5 15.4c0-2.76-2.69-5-5.5-5zm-1.75 3.1a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zm3.5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z',
  wecom:
    'M12 2C6.48 2 2 6.04 2 11c0 2.7 1.3 5.1 3.35 6.8L4.5 21.2l3.55-1.78c1.2.45 2.52.7 3.95.7 5.52 0 10-4.04 10-9S17.52 2 12 2zm-3.2 7.6c.77 0 1.4.63 1.4 1.4s-.63 1.4-1.4 1.4-1.4-.63-1.4-1.4.63-1.4 1.4-1.4zm6.4 0c.77 0 1.4.63 1.4 1.4s-.63 1.4-1.4 1.4-1.4-.63-1.4-1.4.63-1.4 1.4-1.4z',
  qq: 'M12.05 2.1c-2.2 0-4.05 1.98-4.05 5.05 0 .2.01.4.03.6C5.7 9.1 4.2 11.3 4.2 13.5c0 1.35.7 2.35 1.75 2.85-.2.7-.55 1.45-.95 2.05-.15.25-.05.45.25.4 1.25-.2 2.15-.65 2.75-1.1.7.2 1.5.35 2.35.35.2 0 .4 0 .6-.02.55.55 1.55 1.15 3.05 1.35.35.05.45-.2.3-.45-.4-.7-.8-1.55-1-2.3 1.15-.5 1.95-1.55 1.95-3.05 0-2.15-1.5-4.3-3.85-5.65.02-.2.05-.4.05-.6 0-3.07-1.85-5.05-4.05-5.05z',
  google:
    'M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.42zM12 22c2.7 0 4.96-.9 6.62-2.42l-3.23-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.81-1.76-5.6-4.12H3.07v2.58A9.99 9.99 0 0 0 12 22zm-5.6-7.08A6.01 6.01 0 0 1 6 12c0-.73.13-1.43.4-2.08V7.34H3.07A9.99 9.99 0 0 0 2 12c0 1.61.39 3.14 1.07 4.48l3.33-2.56zM12 5.96c1.47 0 2.79.5 3.82 1.5l2.86-2.86C16.95 2.97 14.7 2 12 2 8.09 2 4.71 4.24 3.07 7.34l3.33 2.58C7.19 7.72 9.4 5.96 12 5.96z',
  apple:
    'M16.37 12.64c.03 3.23 2.83 4.31 2.86 4.32-.02.07-.45 1.53-1.47 3.03-.89 1.3-1.81 2.59-3.26 2.62-1.43.03-1.89-.85-3.53-.85-1.63 0-2.14.82-3.49.87-1.4.05-2.47-1.4-3.37-2.69-1.84-2.65-3.25-7.49-1.36-10.75 1.05-1.8 2.83-2.94 4.8-2.97 1.39-.03 2.7.93 3.53.93.84 0 2.4-1.15 4.05-.98.69.03 2.62.28 3.86 2.1-.1.06-2.3 1.35-2.28 4.02zM13.9 4.56c.7-.85 1.24-2.03 1.1-3.21-1.07.04-2.36.71-3.12 1.61-.69.79-1.29 2.05-1.13 3.25 1.19.09 2.41-.61 3.15-1.65z'
}

export default {
  mixins: [i18nLabelMixin],
  data() {
    return { list: [] }
  },
  created() {
    this.load()
    if (this.$route.query.result === 'ok') {
      this.$message.success(this.$t('bindOk'))
    }
  },
  methods: {
    labelOf(platform) {
      return LABELS[platform] || platform
    },
    iconPathOf(platform) {
      return ICON_PATHS[platform] || ICON_PATHS.google
    },
    async load() {
      const res = await listOauthBinds(userInfo.getUserId)
      this.list = (res && res.data) || res || []
      if (!Array.isArray(this.list)) this.list = []
    },
    async bind(item) {
      if (!item.available) {
        this.$message.warning(this.$t('unavailableTip'))
        return
      }
      const res = await oauthBind(item.platform, userInfo.getUserId)
      if (res.status && res.data && res.data.authorizeUrl) {
        window.location.href = res.data.authorizeUrl
      } else {
        this.$message.warning(res.msg || this.$t('unavailableTip'))
      }
    },
    async unbind(item) {
      const res = await oauthUnbind({
        id: userInfo.getUserId,
        platform: item.platform
      })
      if (res.status) {
        this.$message.success(this.$t('unbindOk'))
        this.load()
      } else {
        this.$message.error(res.msg || this.$t('fail'))
      }
    }
  }
}
</script>
<style lang="less" scoped>
.oauth-bind {
  .oauth-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0.25rem;
    border-bottom: 1px solid @color-bg-divider;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    min-width: 0;
  }

  .platform-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    flex-shrink: 0;
    font-size: 1.25rem;
    color: #fff;
    background: @color-text-secondary;
  }

  .platform-svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .platform-icon--wechat {
    background: #07c160;
  }
  .platform-icon--wecom {
    background: #2b7de9;
  }
  .platform-icon--qq {
    background: #12b7f5;
  }
  .platform-icon--github {
    background: #24292f;
  }
  .platform-icon--google {
    background: #fff;
    color: #4285f4;
    border: 1px solid @color-liner-border;
  }
  .platform-icon--apple {
    background: #111;
  }

  .info {
    min-width: 0;
  }

  .name {
    font-weight: 600;
    margin-bottom: 4px;
    color: @color-text-normal;
    text-align: left;
  }

  .status {
    color: @color-text-secondary;
    font-size: 0.875rem;
  }

  .muted {
    color: @color-text-placeholder;
  }
}
</style>
<i18n>
{
  "en": {
    "title": "Linked Accounts",
    "bound": "Bound",
    "unbound": "Not bound",
    "unavailable": "Unavailable",
    "bind": "Bind",
    "unbind": "Unbind",
    "unavailableTip": "This provider is not configured yet",
    "bindOk": "Bound successfully",
    "unbindOk": "Unbound successfully",
    "fail": "Operation failed"
  },
  "zh": {
    "title": "第三方账号关联",
    "bound": "已绑定",
    "unbound": "未绑定",
    "unavailable": "暂不可用",
    "bind": "绑定",
    "unbind": "解除绑定",
    "unavailableTip": "该第三方登录暂未配置，暂不可用",
    "bindOk": "绑定成功",
    "unbindOk": "解绑成功",
    "fail": "操作失败"
  }
}
</i18n>
