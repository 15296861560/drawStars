<template>
  <div>
    <div class="g-list-normal">
      <el-menu
        default-active="1"
        class="el-menu-vertical-demo m-list-normal"
        mode="vertical"
        @select="handleSelect"
      >
        <el-submenu :index="item.index" v-for="(item, index) in titleArray" :key="index">
          <!-- 一级标题 -->
          <template slot="title">{{ item.title }}</template>
          <!-- 二级标题（无三级标题） -->
            <el-menu-item
              v-if="!secondItem.titleData"
              v-for="(secondItem, secondIndex) in item.titleData"
              :key="secondIndex"
              :index="secondItem.index"
              >{{ secondItem.title }}
            </el-menu-item>
          <!-- 二级标题（有三级标题） -->
          <el-submenu
            v-if="secondItem.titleData"
            v-for="(secondItem, secondIndex) in item.titleData"
            :key="secondIndex"
            :index="secondItem.index"
          >
            <template slot="title">{{ secondItem.title }}</template>
            <!-- 三级标题 -->
            <el-menu-item
              v-for="(thirdItem, thirdIndex) in secondItem.titleData"
              :key="thirdIndex"
              :index="thirdItem.index"
              >{{ thirdItem.title }}</el-menu-item
            >
          </el-submenu>

        </el-submenu>
      </el-menu>

      <div class="ml10 w-per80">
        <router-view />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      titleArray: [
        {
          title: "时间",
          index: "1",
          titleData: [{ title: "获取时间", index: "/home/toolHomePage/utilities/time" }],
        },
        {
          title: "数据",
          index: "2",
          titleData: [{ title: "正则表达式", index: "/home/toolHomePage/utilities/regex" }],
        },
      ],
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      this.toPage(key);
    },
    toPage(path) {
      this.$router.push(path).catch((error) => error);
    },
  },
};
</script>
<style></style>
