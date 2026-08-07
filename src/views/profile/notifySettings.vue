<template>
  <div class="notify-settings pc-page">
    <section class="notify-section">
      <h3 class="section-title">{{ $t('sections.channel') }}</h3>
      <div class="card-grid">
        <div
          v-for="item in channelItems"
          :key="item.id"
          class="notify-card"
        >
          <div class="card-text">
            <div class="card-title">{{ item.title }}</div>
            <div class="card-desc">{{ item.desc }}</div>
          </div>
          <el-select
            v-model="prefs[item.pref]"
            class="card-select"
            @change="onChange"
          >
            <el-option
              :label="$t('options.receive')"
              :value="true"
            />
            <el-option
              :label="$t('options.reject')"
              :value="false"
            />
          </el-select>
        </div>
      </div>
    </section>
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
          title: this.$t('items.inApp.title'),
          desc: this.$t('items.inApp.desc')
        },
        {
          id: 'websocket',
          pref: 'websocket',
          title: this.$t('items.websocket.title'),
          desc: this.$t('items.websocket.desc')
        },
        {
          id: 'email',
          pref: 'email',
          title: this.$t('items.email.title'),
          desc: this.$t('items.email.desc')
        },
        {
          id: 'sms',
          pref: 'sms',
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
.section-title {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 600;
  color: @color-text-normal;
  line-height: 1.4;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
}

.notify-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 84px;
  padding: 18px 20px;
  background: @color-bg;
  border: 1px solid @color-bg-divider;
  box-sizing: border-box;
}

.card-text {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: @color-text-normal;
  line-height: 1.4;
}

.card-desc {
  margin-top: 6px;
  font-size: 12px;
  color: @color-text-placeholder;
  line-height: 1.5;
}

.card-select {
  width: 168px;
  flex-shrink: 0;

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px @color-liner-border inset;
  }
}

@media (max-width: 960px) {
  .card-grid {
    grid-template-columns: 1fr;
  }

  .card-select {
    width: 148px;
  }
}
</style>

<i18n>
{
  "en": {
    "sections": {
      "channel": "Notification Channels"
    },
    "options": {
      "receive": "Receive these messages",
      "reject": "Do not receive"
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
    "sections": {
      "channel": "通知渠道"
    },
    "options": {
      "receive": "接收此类消息",
      "reject": "不接收此类消息"
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
