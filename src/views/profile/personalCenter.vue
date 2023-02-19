<template>
  <div class="personal-center">
    <ul class="menu-list">
      <li
        class="menu"
        :class="{ menu__active: curMenu === menu.path }"
        v-for="(menu, index) in menus"
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
import { useI18n } from "vue-i18n";

const PERSONAL_PREFIX = "/home/personalCenter/";
export default {
  data() {
    return {
      curMenu: "personalProfile",
    };
  },
  computed: {
    menus() {
      return [
        { name: this.$t("personalProfile"), path: "personalProfile" },
        { name: this.$t("accountSettings"), path: "accountSettings" },
        { name: this.$t("changePassword"), path: "changePassword" },
        { name: this.$t("changePhone"), path: "bindPhone" },
      ];
    },
  },

  created() {
    this.init();
  },
  activated() {},
  methods: {
    init() {
      this.initLocalLang();
      this.initData();
    },
    initData() {
      let fullPath = this.$route.fullPath;
      this.curMenu = fullPath.slice(PERSONAL_PREFIX.length, fullPath.length);
    },
    initLocalLang() {
      const { t } = useI18n({
        inheritLocale: true,
      });
      this.$t = t;
    },
    toggleMenu(menu) {
      this.curMenu = menu;
      let nextPath = PERSONAL_PREFIX + menu;
      if (nextPath === this.$route.path) {
        return;
      }
      this.$router.push({
        path: nextPath,
      });
    },
  },
};
</script>
<style lang="less" scoped>
.personal-center {
  display: flex;
  justify-content: center;
  .menu-list {
    display: flex;
    flex-direction: column;
    width: 12.5rem /* 200/16 */;
    list-style: none;
    font-size: 0.875rem /* 14/16 */;
    padding: 0.5rem /* 8/16 */ 0;
    background-color: @color-bg;
    border-radius: 4px;
    margin-right: 1.25rem /* 20/16 */;
    .menu {
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      height: 3rem /* 48/16 */;
      line-height: 3rem /* 48/16 */;
      text-align: center;
      color: @color-text-secondary;
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
    min-width: 62.5rem /* 1000/16 */;
    min-height: 50rem /* 800/16 */;
    background-color: @color-bg;
  }
}
</style>
<i18n>
{
  "en": {
    "personalProfile": "Personal Profile",
    "accountSettings": "Account Settings",
    "changePassword": "Change Password",
    "changePhone":"Phone Settings"
  },
  "zh": {
     "personalProfile": "个人资料",
    "accountSettings": "账号设置",
    "changePassword": "修改密码",
    "changePhone":"手机设置"
  }
}
</i18n>
