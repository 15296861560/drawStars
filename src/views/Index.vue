<template>
  <div
    class="index-root"
    :class="{ 'layout-fixed-header': layout.fixedHeader }"
  >
    <el-container>
      <el-aside class="g-aside" :style="width" v-if="showAside"
        ><asideList ref="asideList"></asideList
      ></el-aside>
      <el-container>
        <el-header class="site-header" height="auto">
          <navigation
            :titleData="$route.meta.title"
            ref="navigation"
          ></navigation>
          <layout-tags-view v-if="layout.tagsView" />
        </el-header>
        <el-main class="g-main">
          <div style="min-height: calc(100vh - 180px)">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <keep-alive v-if="$route.meta.keepAlive">
                  <component :is="Component" />
                </keep-alive>
                <component v-else :is="Component" />
              </transition>
            </router-view>
          </div>

          <el-footer v-show="layout.footerVisible" class="g-footer">
            <myfooter></myfooter>
          </el-footer>
        </el-main>
      </el-container>
    </el-container>
    <layout-settings-drawer />
  </div>
</template>

<script>
import AsideList from '@/components/AsideList.vue'
import Navigation from '@/components/Navigation.vue'
import Myfooter from '@/components/Myfooter.vue'
import LayoutTagsView from '@/components/layout/LayoutTagsView.vue'
import LayoutSettingsDrawer from '@/components/layout/LayoutSettingsDrawer.vue'
import { layoutSettingsStore } from '@/stores/layout-settings'
import { useRoute } from 'vue-router'
import {
  NOTIFY_URL,
  WEBSITE_CHANNEL
} from '@/assets/js/notify/notify-config.js'
import { EVENT } from 'drawstarts-notify'
import { userInfoStore } from '@/stores/user-info'
import { notifyStore } from '@/stores/notify'
import { pointsStore } from '@/stores/points'
import { isSkipLoginMode } from '@/config/skip-login'

const userInfo = userInfoStore()
const SITE_NOTIFY_TYPES = ['site', 'system', 'notice', 'message']

export default {
  components: {
    AsideList,
    Navigation,
    Myfooter,
    LayoutTagsView,
    LayoutSettingsDrawer
  },
  provide() {
    return {
      websiteInfo: this.websiteInfo
    }
  },
  data() {
    return {
      width: 'width:200px;',
      screenHeight: document.documentElement.clientHeight, // 获取浏览器高度
      screenWidth: document.documentElement.clientWidth, // 获取浏览器宽度
      websiteInfo: {
        isPC: true, // 判断是否是电脑
        isCollapse: false // 侧边栏是否收缩
      },
      _notifyPushHandler: null
    }
  },
  computed: {
    $route() {
      let route = useRoute()

      return route
    },
    layout() {
      return layoutSettingsStore()
    },
    showAside() {
      return this.websiteInfo.isPC && this.layout.navType !== 3
    }
  },
  methods: {
    isComputer() {
      let userAgent = navigator.userAgent
      let phoneList = ['Android', 'iPhone', 'SymbianOS']
      this.websiteInfo.isPC = phoneList.every(
        item => userAgent.indexOf(item) == -1
      ) // 不包含手机型号则视为PC
    },
    onNotifyPush(payload) {
      const store = notifyStore()
      // 兼容 notifyMsg 解析结果 / 完整 Notify / SYS 消息 data 包裹
      const body =
        payload && typeof payload === 'object'
          ? payload.data && typeof payload.data === 'object'
            ? {
                ...payload.data,
                notifyType: payload.notifyType || payload.data.notifyType
              }
            : payload
          : null
      if (body && typeof body === 'object') {
        const content =
          body.content ||
          body.msg ||
          body.title ||
          (typeof body.notifyMsg === 'string' ? body.notifyMsg : '')
        if (!content && body.id == null) {
          store.fetchUnreadCount()
          return
        }
        store.prependFromPush({
          id: body.id || body.messageId || `ws_${Date.now()}`,
          content,
          tag: body.tag || body.notifyType || '系统',
          notifyType: body.notifyType,
          createTime: body.createTime || Date.now(),
          isRead: false
        })
      } else {
        store.fetchUnreadCount()
      }
    },
    bindNotifyListeners() {
      if (!this.$notify || this._notifyPushHandler) return
      this._notifyPushHandler = data => this.onNotifyPush(data)

      const sysEvents = [
        EVENT.SYS_PLATFORM,
        EVENT.SYS_CHANNEL,
        EVENT.SYS_SINGLE
      ]
      sysEvents.forEach(evt => {
        this.$notify.on(evt, this._notifyPushHandler)
      })

      SITE_NOTIFY_TYPES.forEach(type => {
        this.$notify.addNotifyCallback(
          type,
          WEBSITE_CHANNEL,
          this._notifyPushHandler
        )
      })
    },
    unbindNotifyListeners() {
      if (!this.$notify || !this._notifyPushHandler) return
      ;[EVENT.SYS_PLATFORM, EVENT.SYS_CHANNEL, EVENT.SYS_SINGLE].forEach(
        evt => {
          this.$notify.off?.(evt, this._notifyPushHandler)
        }
      )
      SITE_NOTIFY_TYPES.forEach(type => {
        try {
          this.$notify.deleteCallback?.(
            type,
            WEBSITE_CHANNEL,
            this._notifyPushHandler
          )
        } catch (_) {
          /* ignore */
        }
      })
      this._notifyPushHandler = null
    },
    async initNotify() {
      try {
        await this.$notify.createInstance(NOTIFY_URL, {
          autoReconnect: true,
          autoAck: true
        })
        const token =
          userInfo.getToken?.value != null
            ? userInfo.getToken.value
            : userInfo.getToken
        const loginRes = await this.$notify.login(token)
        if (loginRes && loginRes.status === false) {
          throw new Error(loginRes.message || 'notify login failed')
        }
        await this.$notify.joinChannel(WEBSITE_CHANNEL)
        this.bindNotifyListeners()
        notifyStore().fetchUnreadCount()
      } catch (e) {
        console.warn('[notify] init failed', e)
      }
    },
    async initPoints() {
      try {
        const uid = Number(userInfo.getUserId) || 0
        if (!uid && !isSkipLoginMode()) return
        await pointsStore().init(uid || 1)
      } catch (e) {
        console.warn('[points] init failed', e)
      }
    }
  },
  watch: {
    'websiteInfo.isCollapse'(val) {
      if (val) {
        this.width = 'width:50px;'
      } else {
        this.width = 'width:200px;'
      }
    },
    'layout.navType'(n) {
      if (n === 2) {
        this.websiteInfo.isCollapse = true
      } else if (n === 1) {
        this.websiteInfo.isCollapse = false
      }
    },
    'layout.tagsView'(on) {
      if (!on) {
        this.layout.clearVisitedViews()
      }
    },
    'layout.dynamicTitle'() {
      this.layout.applyDocumentTitle(this.$route)
    }
  },
  mounted() {
    this.isComputer()
    window.addEventListener('resize', this.isComputer)
    if (this.websiteInfo.isCollapse) {
      this.width = 'width:50px;'
    }

    this.layout.applyThemeFromState()
    this._layoutAfterEach = this.$router.afterEach(to => {
      this.layout.addVisitedView(to)
      this.layout.applyDocumentTitle(to)
    })

    if (!isSkipLoginMode()) {
      this.initNotify()
    } else {
      notifyStore().fetchUnreadCount()
    }
    this.initPoints()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.isComputer)
    if (this._layoutAfterEach) {
      this._layoutAfterEach()
    }
    this.unbindNotifyListeners()
  }
}
</script>

<style>
.el-main {
  background-color: var(--ds-bg-base);
  color: var(--ds-text-normal);
  text-align: center;
}

/* 组件过渡 · 轻量淡入上移（200ms 缓出） */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity var(--ds-duration-base) var(--ds-ease-out),
    transform var(--ds-duration-base) var(--ds-ease-out);
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 滚动条 · 中性细滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: var(--el-border-color-dark);
}
::-webkit-scrollbar-thumb:hover {
  background-color: var(--el-text-color-secondary);
}
::-webkit-scrollbar-corner {
  background: transparent;
}

.index-root.layout-fixed-header .site-header {
  position: sticky;
  top: 0;
  z-index: 99;
  background: var(--ds-bg);
  box-shadow: 0 1px 4px rgba(23, 32, 74, 0.06);
}

.site-header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>
