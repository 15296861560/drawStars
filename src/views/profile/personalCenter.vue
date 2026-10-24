<template>
  <div class="pc-shell">
    <!-- 页头卡片：用户横幅 + 水平标签导航 -->
    <header class="pc-hero">
      <div class="pc-user">
        <div class="pc-user-ring">
          <el-avatar
            :size="56"
            :src="getAvatar || undefined"
            class="pc-user-avatar"
          >
            {{ avatarText }}
          </el-avatar>
        </div>
        <div class="pc-user-meta">
          <div class="pc-user-name" :title="getUserName">{{ getUserName }}</div>
          <div class="pc-user-id">ID {{ getUserInfo.userId || '-' }}</div>
        </div>
        <span class="pc-user-level">Lv.{{ getUserInfo.level }}</span>
      </div>
      <nav class="pc-nav">
        <div v-for="group in menuGroups" :key="group.key" class="pc-nav-group">
          <div
            v-for="menu in group.items"
            :key="menu.path"
            class="pc-nav-item"
            :class="{ 'pc-nav-item--active': curMenu === menu.path }"
            @click="toggleMenu(menu.path)"
          >
            <component :is="menu.icon" class="pc-nav-icon" />
            <span class="pc-nav-text">{{ menu.name }}</span>
          </div>
        </div>
      </nav>
    </header>

    <!-- 内容卡片 -->
    <main class="pc-content">
      <router-view v-slot="{ Component }">
        <keep-alive v-if="$route.meta.keepAlive">
          <component :is="Component" />
        </keep-alive>
        <component v-else :is="Component" />
      </router-view>
    </main>
  </div>
</template>
<script>
import { mapState } from 'pinia'
import { i18nLabelMixin } from '@/views/mixin/i18nLabelMixin'
import { userInfoStore } from '@/stores/user-info'

const PERSONAL_PREFIX = '/home/personalCenter/'
export default {
  mixins: [i18nLabelMixin],
  data() {
    return {
      curMenu: 'basicInfo'
    }
  },
  computed: {
    ...mapState(userInfoStore, ['getUserName', 'getAvatar', 'getUserInfo']),
    avatarText() {
      const name = (this.getUserName || '').trim()
      return name.charAt(0) || '★'
    },
    menuGroups() {
      return [
        {
          key: 'overview',
          items: [
            { name: this.$t('basicInfo'), path: 'basicInfo', icon: 'User' },
            { name: this.$t('points'), path: 'points', icon: 'Coin' }
          ]
        },
        {
          key: 'tasks',
          items: [
            { name: this.$t('taskHall'), path: 'taskHall', icon: 'Tickets' },
            { name: this.$t('myTasks'), path: 'myTasks', icon: 'List' },
            {
              name: this.$t('taskAchievements'),
              path: 'taskAchievements',
              icon: 'TrophyBase'
            }
          ]
        },
        {
          key: 'security',
          items: [
            { name: this.$t('credentials'), path: 'credentials', icon: 'Key' },
            { name: this.$t('oauthBind'), path: 'oauthBind', icon: 'Link' },
            {
              name: this.$t('notifySettings'),
              path: 'notifySettings',
              icon: 'Bell'
            },
            { name: this.$t('lifecycle'), path: 'lifecycle', icon: 'Warning' }
          ]
        }
      ]
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.initData()
      }
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      const fullPath = this.$route.fullPath.split('?')[0]
      this.curMenu = fullPath.slice(PERSONAL_PREFIX.length) || 'basicInfo'
    },
    toggleMenu(menu) {
      this.curMenu = menu
      const nextPath = PERSONAL_PREFIX + menu
      if (nextPath === this.$route.path) {
        return
      }
      this.$router.push({ path: nextPath })
    }
  }
}
</script>
<style lang="less" scoped>
.pc-shell {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 87.5rem;
  margin: 0 auto;
  text-align: left; // 重置 Index.vue el-main 的整页居中
}

/* ========== 页头卡片：用户横幅 + 水平导航 ========== */
.pc-hero {
  display: flex;
  flex-direction: column;
  background: var(--ds-bg);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-sm);
  overflow: hidden;
}

.pc-user {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.75rem;
}

.pc-user-ring {
  padding: 3px;
  border-radius: var(--ds-radius-round);
  background: linear-gradient(
    135deg,
    var(--ds-primary),
    var(--ds-primary-active)
  );
}

.pc-user-avatar {
  background: var(--ds-primary-light);
  color: var(--ds-primary);
  font-weight: 600;
}

.pc-user-meta {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.pc-user-name {
  max-width: 100%;
  font-size: var(--ds-font-size-lg);
  font-weight: 600;
  color: @color-text-normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pc-user-id {
  font-size: var(--ds-font-size-xs);
  color: @color-text-secondary;
}

.pc-user-level {
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  font-size: var(--ds-font-size-xs);
  font-weight: 500;
  color: var(--ds-primary);
  background: var(--ds-primary-light);
  border-radius: var(--ds-radius-round);
}

/* ========== 水平标签导航 ========== */
.pc-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 1.75rem 1rem;
  border-top: 1px solid @color-bg-divider;
}

.pc-nav-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;

  + .pc-nav-group {
    margin-left: 0.5rem;
    padding-left: 0.5rem;
    border-left: 1px solid @color-bg-divider;
  }
}

.pc-nav-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: var(--ds-radius-round);
  font-size: var(--ds-font-size-sm);
  color: @color-text-normal;
  cursor: pointer;
  transition:
    background-color var(--ds-duration-fast) var(--ds-ease-out),
    color var(--ds-duration-fast) var(--ds-ease-out);

  .pc-nav-icon {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }

  .pc-nav-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    background: var(--ds-fill-hover);
    color: var(--ds-primary);
  }

  &--active {
    background: var(--ds-primary-light);
    color: var(--ds-primary);
    font-weight: 500;
  }
}

/* ========== 内容卡片 ========== */
.pc-content {
  width: 100%;
  min-height: calc(100vh - 26rem);
  background: var(--ds-bg);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-sm);
  overflow: hidden;
}

/* ========== 响应式：收紧页头内边距，导航天然换行 ========== */
@media (max-width: 48rem) {
  .pc-user {
    padding: 1rem 1.25rem;
  }

  .pc-nav {
    padding: 0.625rem 1.25rem 0.875rem;
  }
}
</style>
<i18n>
{
  "en": {
    "basicInfo": "Basic Info",
    "points": "My Points",
    "taskHall": "Task Hall",
    "myTasks": "My Tasks",
    "taskAchievements": "Achievements",
    "credentials": "Login Credentials",
    "oauthBind": "Linked Accounts",
    "notifySettings": "Notifications",
    "lifecycle": "Account Security"
  },
  "zh": {
    "basicInfo": "基础信息",
    "points": "我的积分",
    "taskHall": "任务大厅",
    "myTasks": "我的任务",
    "taskAchievements": "成就墙",
    "credentials": "登录凭证",
    "oauthBind": "第三方关联",
    "notifySettings": "通知设置",
    "lifecycle": "账号安全"
  }
}
</i18n>
