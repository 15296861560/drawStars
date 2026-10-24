<template>
  <div class="notify-settings pc-page">
    <div class="section-head pc-page-title">{{ $t('title') }}</div>
    <div class="section-body pc-page-body">
      <h3 class="group-title">{{ $t('sections.channel') }}</h3>
      <div class="card-grid">
        <div v-for="item in channelItems" :key="item.id" class="notify-card">
          <span class="card-tile" aria-hidden="true">
            <component :is="item.icon" />
          </span>
          <div class="card-text">
            <div class="card-title">{{ item.title }}</div>
            <div class="card-desc">{{ item.desc }}</div>
          </div>
          <el-switch v-model="prefs[item.pref]" @change="onChange" />
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
const getNotifyPrefs = findReq('profileController', 'getNotifyPrefs')
const updateNotifyPrefs = findReq('profileController', 'updateNotifyPrefs')

export default {
  mixins: [i18nLabelMixin],
  data() {
    return {
      prefs: {
        inApp: true,
        sms: false,
        email: false,
        websocket: true
      },
      saveTimer: null
    }
  },
  computed: {
    channelItems() {
      return [
        {
          id: 'inApp',
          pref: 'inApp',
          icon: 'Bell',
          title: this.$t('items.inApp.title'),
          desc: this.$t('items.inApp.desc')
        },
        {
          id: 'websocket',
          pref: 'websocket',
          icon: 'Lightning',
          title: this.$t('items.websocket.title'),
          desc: this.$t('items.websocket.desc')
        },
        {
          id: 'email',
          pref: 'email',
          icon: 'Message',
          title: this.$t('items.email.title'),
          desc: this.$t('items.email.desc')
        },
        {
          id: 'sms',
          pref: 'sms',
          icon: 'Iphone',
          title: this.$t('items.sms.title'),
          desc: this.$t('items.sms.desc')
        }
      ]
    }
  },
  created() {
    this.load()
  },
  beforeUnmount() {
    clearTimeout(this.saveTimer)
  },
  methods: {
    async load() {
      const res = await getNotifyPrefs(userInfo.getUserId)
      const data = (res && res.data) || res
      if (data) {
        this.prefs = {
          inApp: data.inApp !== false,
          sms: !!data.sms,
          email: !!data.email,
          websocket: data.websocket !== false
        }
      }
    },
    onChange() {
      clearTimeout(this.saveTimer)
      this.saveTimer = setTimeout(() => {
        this.save()
      }, 300)
    },
    async save() {
      const res = await updateNotifyPrefs({
        id: userInfo.getUserId,
        inApp: this.prefs.inApp,
        sms: this.prefs.sms,
        email: this.prefs.email,
        websocket: this.prefs.websocket
      })
      if (res.status) this.$message.success(this.$t('ok'))
      else this.$message.error(res.msg || this.$t('fail'))
    }
  }
}
</script>

<style lang="less" scoped>
.notify-settings {
  .group-title {
    margin: 0 0 1rem;
    font-size: @ds-font-sm;
    font-weight: 600;
    color: @color-text-secondary;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 1rem;
    max-width: 56rem;
  }

  .notify-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    background: var(--ds-bg);
    border: 1px solid @color-bg-divider;
    border-radius: var(--ds-radius-lg);
    box-sizing: border-box;
    transition:
      border-color var(--ds-duration-fast) var(--ds-ease-out),
      box-shadow var(--ds-duration-fast) var(--ds-ease-out);

    &:hover {
      border-color: var(--ds-primary);
      box-shadow: var(--ds-shadow-sm);
    }
  }

  .card-tile {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
    font-size: 1.125rem;
    color: var(--ds-primary);
    background: var(--ds-primary-light);
    border-radius: var(--ds-radius-md);
  }

  .card-text {
    flex: 1;
    min-width: 0;
  }

  .card-title {
    font-size: @ds-font-md;
    font-weight: 600;
    color: @color-text-normal;
    line-height: 1.4;
    text-align: left;
  }

  .card-desc {
    margin-top: 0.375rem;
    font-size: @ds-font-sm;
    color: @color-text-secondary;
    line-height: 1.5;
    text-align: left;
  }

  :deep(.el-switch) {
    flex-shrink: 0;
  }
}
</style>

<i18n>
{
  "en": {
    "title": "Notification Settings",
    "sections": {
      "channel": "Notification Channels"
    },
    "items": {
      "inApp": {
        "title": "In-app Messages",
        "desc": "Receive interaction and system alerts inside the app"
      },
      "websocket": {
        "title": "Realtime Push",
        "desc": "Receive realtime updates via websocket when online"
      },
      "email": {
        "title": "Email Notifications",
        "desc": "Receive important alerts via email"
      },
      "sms": {
        "title": "SMS Notifications",
        "desc": "Receive security and critical alerts via SMS"
      }
    },
    "ok": "Saved",
    "fail": "Save failed"
  },
  "zh": {
    "title": "通知设置",
    "sections": {
      "channel": "通知渠道"
    },
    "items": {
      "inApp": {
        "title": "站内消息",
        "desc": "在应用内接收互动与系统消息提醒"
      },
      "websocket": {
        "title": "实时推送",
        "desc": "在线时通过 WebSocket 接收实时更新"
      },
      "email": {
        "title": "邮件通知",
        "desc": "通过邮箱接收重要提醒"
      },
      "sms": {
        "title": "短信通知",
        "desc": "通过短信接收安全与重要提醒"
      }
    },
    "ok": "已保存",
    "fail": "保存失败"
  }
}
</i18n>
