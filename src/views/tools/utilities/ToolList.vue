<template>
  <div>
    <div class="g-list-normal">
      <el-menu
        default-active="1"
        class="el-menu-demo m-list-horizontal"
        mode="horizontal"
        @select="handleSelect"
      >
        <el-submenu :index="item.index" v-for="(item, index) in titleArray" :key="index">
          <!-- 一级标题 -->
          <template slot="title">{{ item.title }}</template>
          <!-- 二级标题（无三级标题） -->
          <el-menu-item
            v-show="!secondItem.titleData"
            v-for="secondItem in item.titleData"
            :key="secondItem.index"
            :index="secondItem.index"
            >{{ secondItem.title }}
          </el-menu-item>
          <!-- 二级标题（有三级标题） -->
          <el-submenu
            v-show="secondItem.titleData"
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

      <div class="mt10 w-per100">
        <router-view />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  computed: {
    titleArray() {
      return [
        {
          title: this.$t("time"),
          index: "1",
          titleData: [
            {
              title: this.$t("timeList.getTime"),
              index: "/home/toolHomePage/utilities/time",
            },
          ],
        },
        {
          title: this.$t("data"),
          index: "2",
          titleData: [
            {
              title: this.$t("dataList.regex"),
              index: "/home/toolHomePage/utilities/regex",
            },
            {
              title: this.$t("dataList.importAndExport"),
              index: "/home/toolHomePage/utilities/importAndExport",
            },
          ],
        },
      ];
    },
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
<i18n>
{
  "en": {
    "time": "Time",
    "data":"Data",
    "timeList":{
      "getTime":"Get Time"
    },
    "dataList":{
      "regex":"Regex",
      "importAndExport":"Import And Export"
    }
  },
  "zh": {
    "time": "时间",
    "data":"数据",
    "timeList":{
      "getTime":"获取时间"
    },
    "dataList":{
      "regex":"正则表达式",
      "importAndExport":"导入与导出"
    }
  }
}
</i18n>
