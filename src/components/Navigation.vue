<template>
  <div class="navigation">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- 路由导航 -->
      <el-breadcrumb-item
        v-show="websiteInfo.isPC"
        v-for="(item, index) in titleData"
        :key="index"
      >
        <span @click="toFirstPage" v-if="index == 0" class="firstPage"
          ><i class="el-icon-menu"></i>{{ item }}</span
        >
        <span v-if="index != 0" @click="goPage(index)" class="title">{{ item }}</span>
      </el-breadcrumb-item>

      <el-breadcrumb-item v-show="!websiteInfo.isPC">
        <span @click="toFirstPage" class="firstPage"
          ><i class="el-icon-menu"></i>{{ titleData[0] }}</span
        >
      </el-breadcrumb-item>
    </el-breadcrumb>

    <div class="right-part">
      <!-- 全屏 -->
      <i class="el-icon-full-screen full-screen u-icon" @click="fullScreen"></i>
      <!-- 选择语言 -->
      <el-dropdown class="selectLang" @command="handleSetLanguage">
        <img style="height: 3vh" src="@/assets/img/nav/translate.svg" />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :disabled="language === 'zh'" command="zh">
            中文
          </el-dropdown-item>
          <el-dropdown-item :disabled="language === 'en'" command="en">
            English
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <el-dropdown class="profile">
        <span class="el-dropdown-link">
          {{ $store.getters.getUserName
          }}<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="toPersonalCenter">{{
            $t("navigation.profile")
          }}</el-dropdown-item>
          <el-dropdown-item>{{ $t("navigation.setting") }}</el-dropdown-item>
          <el-dropdown-item>{{ $t("navigation.changePasswork") }}</el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">{{
            $t("navigation.logOut")
          }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import storage from "@/utils/commom/storage";

export default {
  name: "Navigation",
  props: {
    titleData: Array,
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
      return this.$store.getters.getLanguage;
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
      this.$router.push({
        path: "/home/profile/personalCenter",
      });
    },
    logout() {
      this.$store.dispatch("changeUserInfo", {
        attr: "userInfo",
        val: {},
      });

      this.$router.push({
        path: "/login",
      });
    },
    toFirstPage() {
      this.$router
        .push({
          path: "/",
        })
        .catch(() => {});
    },
    handleSetLanguage(lang) {
      this.$i18n.locale = lang;
      storage.local.save("LANGUAGE", lang);
      this.$store.dispatch("changeSettingInfo", {
        attr: "language",
        val: lang,
      });
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.navigation {
  padding: 20px;
  display: flex;
  justify-content: space-between;

  .right-part {
    display: flex;
    align-items: center;
    .full-screen {
      margin-left: 1vw;
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
  color: black;
  font-weight: bold;
}
.firstPage:hover {
  color: #4395ff;
  font-weight: bold;
}
.firstPage:active {
  color: aqua;
  font-weight: bold;
}
</style>
