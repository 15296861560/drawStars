<template>
  <div class="personal-center">
    <ul class="menu-list">
      <li
        class="menu"
        :class="{ menu__active: curMenu === menu.path }"
        v-for="menu in menus"
        :key="menu.path"
        @click="toggleMenu(menu.path)"
      >
        {{ menu.name }}
      </li>
    </ul>
    <div class="container-right">
      <router-view v-slot="{ Component }">
        <keep-alive v-if="$route.meta.keepAlive">
          <component :is="Component" />
        </keep-alive>
        <component v-else :is="Component" />
      </router-view>
    </div>
  </div>
</template>
<script>
import { i18nLabelMixin } from '@/views/mixin/i18nLabelMixin'

const PERSONAL_PREFIX = '/home/personalCenter/'
export default {
  mixins: [i18nLabelMixin],
  data() {
    return {
      curMenu: 'basicInfo'
    }
  },
  computed: {
    menus() {
      return [
        { name: this.$t('basicInfo'), path: 'basicInfo' },
        { name: this.$t('credentials'), path: 'credentials' },
        { name: this.$t('oauthBind'), path: 'oauthBind' },
        { name: this.$t('notifySettings'), path: 'notifySettings' },
        { name: this.$t('lifecycle'), path: 'lifecycle' }
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
.personal-center {
  display: flex;
  justify-content: center;
  .menu-list {
    display: flex;
    flex-direction: column;
    width: 12.5rem;
    list-style: none;
    font-size: 0.875rem;
    padding: 0.5rem 0;
    background-color: @color-bg;
    border-radius: 4px;
    margin-right: 1.25rem;
    .menu {
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      height: 3rem;
      line-height: 3rem;
      text-align: center;
      color: @color-text-secondary;
      cursor: pointer;
      &:hover {
        background-color: @color-icon-hover;
      }
      &:active {
        background-color: @color-icon-active;
      }
    }
    .menu__active {
      background-color: @color-icon-active;
      color: @color-text-inverse;
    }
  }

  .container-right {
    min-width: 62.5rem;
    min-height: 50rem;
    background-color: @color-bg;
  }
}
</style>
<i18n>
{
  "en": {
    "basicInfo": "Basic Info",
    "credentials": "Login Credentials",
    "oauthBind": "Linked Accounts",
    "notifySettings": "Notifications",
    "lifecycle": "Account Security"
  },
  "zh": {
    "basicInfo": "基础信息",
    "credentials": "登录凭证",
    "oauthBind": "第三方关联",
    "notifySettings": "通知设置",
    "lifecycle": "账号安全"
  }
}
</i18n>
