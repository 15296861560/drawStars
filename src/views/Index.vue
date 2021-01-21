<template>
  <div>
    <el-container>
      <el-aside  class="g-aside" :style="width"
        ><asideList></asideList
      ></el-aside>
      <el-container>
        <el-header>
          <!-- 导航栏 -->
          <navigation :titleData="$route.meta.title"></navigation
        >
        <!-- 历史浏览模块 -->
        <!-- <history></history> -->
        </el-header>
        <el-main class="g-main">
        <keep-alive>
           <router-view v-if="$route.meta.keepAlive" ></router-view>
        </keep-alive>
           <router-view v-if="!$route.meta.keepAlive"></router-view>
        </el-main>
        <el-footer class="g-footer">
          <myfooter></myfooter>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script>
// import Interface from "@/views/interface.vue";
import AsideList from "@/components/AsideList.vue";
import History from "@/components/History.vue";
export default {
  components: {
    AsideList,
    History,
  },
  data() {
    return {
      userData: {
        userName: "AAA",
      },
      userName: "Main",
      width:"width:200px;",
    };
  },
  methods: {
    synResult() {
      this.userData = this.$refs.test1.userData;
    },
    textClick(){
      this.width="width:50px;";
      
    }
  },
  mounted() {
    // this.$store.dispatch("changeUserInfo", { attr: "userName", val: "pie" });
    // this.userName=this.$store.getters.getUserName;
    // this.userName=this.$store.getters.getUserName;
    console.log(this.$store);
  },
};
</script>

<style>
.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
  line-height: 70vh;
}
</style>
