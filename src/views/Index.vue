<template>
  <div>
    <el-container>
      <el-aside width="200px" style="background-color: #282c34; overflow: hidden"
        ><asideList></asideList
      ></el-aside>
      <el-container>
        <el-header>
          <!-- 导航栏 -->
          <navigation :titleData="$route.meta.title"></navigation
        ></el-header>
        <el-main>
        <keep-alive class="f-flexvscroll">
           <router-view v-if="$route.meta.keepAlive" ></router-view>
        </keep-alive>
           <router-view v-if="!$route.meta.keepAlive"></router-view>
        </el-main>
        <el-footer style="padding: 0px">
          <myfooter></myfooter>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script>
// import Interface from "@/views/interface.vue";
import AsideList from "@/components/AsideList.vue";
import Test1 from "@/views/pages/test1.vue";
export default {
  components: {
    AsideList,
    Test1,
  },
  data() {
    return {
      userData: {
        userName: "AAA",
      },
      userName: "Main",
    };
  },
  methods: {
    synResult() {
      this.userData = this.$refs.test1.userData;
    },
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
