<template>
  <div class="navigation">
    <el-breadcrumb>
      <!-- 路由导航 -->
      <el-breadcrumb-item
        v-show="websiteInfo.isPC"
        v-for="(item, index) in titleData"
        :key="index"
      >
        <span @click="toFirstPage" v-if="index === 0" class="firstPage"
          ><el-icon class="mr4"><Menu /></el-icon>{{ item }}</span
        >
        <span v-if="index !== 0" @click="goPage(index)" class="title">{{ item }}</span>
      </el-breadcrumb-item>

      <el-breadcrumb-item v-show="!websiteInfo.isPC">
        <span @click="toFirstPage" class="firstPage"
          ><el-icon><Menu /></el-icon>{{ titleData[0] }}</span
        >
      </el-breadcrumb-item>
    </el-breadcrumb>

    <div class="right-part">
      <!-- 全屏 -->
      <el-icon
        class="full-screen u-icon"
        :title="$t('navigation.fullScreen')"
        @click="fullScreen"
        ><FullScreen
      /></el-icon>
      <!-- 选择语言 -->
      <el-dropdown
        class="selectLang"
        :title="$t('navigation.selectLang')"
        @command="handleSetLanguage"
      >
        <img style="height: 3vh" src="@/assets/img/nav/translate.svg" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :disabled="language === 'zh'" command="zh">
              中文
            </el-dropdown-item>
            <el-dropdown-item :disabled="language === 'en'" command="en">
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-dropdown class="profile">
        <span class="el-dropdown-link">
          {{ userName }}
          <el-icon class="el-icon--right">
            <ArrowDown />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click.native="toPersonalCenter">{{
              $t("navigation.profile")
            }}</el-dropdown-item>
            <el-dropdown-item>{{ $t("navigation.setting") }}</el-dropdown-item>
            <el-dropdown-item @click.native="toChangePasswork">{{
              $t("navigation.changePasswork")
            }}</el-dropdown-item>
            <el-dropdown-item divided @click.native="logout">{{
              $t("navigation.logOut")
            }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import storage from "@/utils/commom/storage";
import { userInfoStore } from "@/stores/user-info";
import { settingInfoStore } from "@/stores/setting-info";

const settingInfo = settingInfoStore();

export default {
  name: "Navigation",
  props: {
    titleData: Array,
    default: [],
  },
  inject: ["websiteInfo"],
  data() {
    return {
      activeIndex: "1",
      activeIndex2: "1",
      search: "",
      screenHeight: document.documentElement.clientHeight, //获取浏览器高度
      screenWidth: document.documentElement.clientWidth, //获取浏览器宽度
      isFullscreen: false, //是否全屏显示
    };
  },
  computed: {
    language() {
      return settingInfo.getLanguage;
    },
    userName() {
      const userInfo = userInfoStore();
      return userInfo.getUserName;
    },
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
      console.log(key);
      // if(key=='1-3')this.$router.push('https://cn.bing.com/');
      // if(key=='1-3')window.localtion.href = 'https://cn.bing.com/';
    },
    goPage(index) {
      let path = this.$route.path;
      let paths = path.split("/");
      let toPath = "";
      for (let i = 1; i <= index + 1; i++) {
        toPath += "/" + paths[i];
      }
      //当前路径不跳转
      if (toPath == path) return;
      this.$router.push({
        path: toPath,
      });
    },
    toPersonalCenter() {
      let toPath = "/home/personalCenter/personalProfile";
      this.toNewPath(toPath);
    },
    toChangePasswork() {
      let toPath = "/home/personalCenter/changePassword";
      this.toNewPath(toPath);
    },
    toNewPath(toPath) {
      let path = this.$route.path;

      if (path === toPath) return;

      this.$router.push({
        path: toPath,
      });
    },
    logout() {
      const userInfo = userInfoStore();
      userInfo.changeUserInfo({});

      this.$router.push({
        path: "/login",
      });
    },
    toFirstPage() {
      this.$router
        .push({
          path: "/home/homepage",
        })
        .catch(() => {});
    },
    handleSetLanguage(lang) {
      this.$i18n.locale = lang;
      storage.local.save("LANGUAGE", lang);
      settingInfo.changeSettingInfo(lang);
      this.$message({
        message: this.$t("tips.switchLanguageSuccess"),
        type: "success",
      });
    },
    //全屏
    fullScreen() {
      //该方法进入全屏的方式与f11有差异
      if (this.isFullscreen) {
        this.isFullscreen = false;
        document.webkitCancelFullScreen();
      } else {
        this.isFullscreen = true;
        document.documentElement.webkitRequestFullScreen();
      }
    },
  },
  watch: {},
  mounted() {},
};
</script>

<style lang="less" scoped>
.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;

  .right-part {
    display: flex;
    align-items: center;
    .full-screen {
      margin-left: 1vw;
      cursor: pointer;
    }
    .selectLang {
      margin-left: 1vw;
    }

    .profile {
      margin-left: 2vw;
    }
  }
}

.title:hover {
  color: #4395ff;
}
.title:active {
  color: aqua;
}
.firstPage {
  display: flex;
  color: black;
  font-weight: bold;
  cursor: pointer;
}
.firstPage:hover {
  color: #4395ff;
  font-weight: bold;
}
.firstPage:active {
  color: aqua;
  font-weight: bold;
}

.el-breadcrumb__item {
  cursor: pointer;
}
</style>
