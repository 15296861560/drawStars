<template>
  <div>
    <div class="g-home-module" style="justify-content: flex-start;">
      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
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
    </div>
    <div class="g-home-module m-mt10">
      <router-view />
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      activeIndex: "1",
      //标题列表
      titleArray: [
        {
          title: "数据模板定义",
          index: "1",
          titleData: [
            { title: "String", index: "1-1" },
            { title: "Number", index: "1-2" },
            { title: "Boolean", index: "1-3" },
            { title: "Object", index: "1-4" },
            { title: "Array", index: "1-5" },
            { title: "Function", index: "1-6" },
            { title: "RegExp", index: "1-7" },
            { title: "Path", index: "1-8" },
          ],
        },
        {
          title: "数据占位符定义",
          index: "2",
          titleData: [
            {
              title: "Basic",
              index: "2-1",
              titleData: [
                { title: "boolean", index: "2-1-1" },
                { title: "natural", index: "2-1-2" },
                { title: "integer", index: "2-1-3" },
                { title: "float", index: "2-1-4" },
                { title: "character", index: "2-1-5" },
                { title: "string", index: "2-1-6" },
                { title: "range", index: "2-1-7" },
              ],
            },
            {
              title: "Date",
              index: "2-2",
              titleData: [
                { title: "date", index: "2-2-1" },
                { title: "time", index: "2-2-2" },
                { title: "datetime", index: "2-2-3" },
                { title: "now", index: "2-2-4" },
              ],
            },
            {
              title: "Image",
              index: "2-3",
              titleData: [
                { title: "image", index: "2-3-1" },
                { title: "dataImage", index: "2-3-2" },
              ],
            },
            {
              title: "Color",
              index: "2-4",
              titleData: [
                { title: "color", index: "2-4-1" },
                { title: "hex", index: "2-4-2" },
                { title: "rgb", index: "2-4-3" },
                { title: "rgba", index: "2-4-4" },
                { title: "hsl", index: "2-4-5" },
              ],
            },
            {
              title: "Text",
              index: "2-5",
              titleData: [
                { title: "paragraph", index: "2-5-1" },
                { title: "sentence", index: "2-5-2" },
                { title: "word", index: "2-5-3" },
                { title: "title", index: "2-5-4" },
                { title: "cparagraph", index: "2-5-5" },
                { title: "csentence", index: "2-5-6" },
                { title: "cword", index: "2-5-7" },
                { title: "ctitle", index: "2-5-8" },
              ],
            },
            {
              title: "Name",
              index: "2-6",
              titleData: [
                { title: "first", index: "2-6-1" },
                { title: "last", index: "2-6-2" },
                { title: "name", index: "2-6-3" },
                { title: "cfirst", index: "2-6-4" },
                { title: "clast", index: "2-6-5" },
                { title: "cname", index: "2-6-6" },
              ],
            },
            {
              title: "Web",
              index: "2-7",
              titleData: [
                { title: "url", index: "2-7-1" },
                { title: "domain", index: "2-7-2" },
                { title: "protocol", index: "2-7-3" },
                { title: "tld", index: "2-7-4" },
                { title: "email", index: "2-7-5" },
                { title: "ip", index: "2-7-6" },
              ],
            },
            {
              title: "Address",
              index: "2-8",
              titleData: [
                { title: "region", index: "2-8-1" },
                { title: "province", index: "2-8-2" },
                { title: "city", index: "2-8-3" },
                { title: "county", index: "2-8-4" },
                { title: "zip", index: "2-8-5" },
              ],
            },
            {
              title: "Helper",
              index: "2-9",
              titleData: [
                { title: "capitalize", index: "2-9-1" },
                { title: "upper", index: "2-9-2" },
                { title: "lower", index: "2-9-3" },
                { title: "pick", index: "2-9-4" },
                { title: "shuffle", index: "2-9-5" },
              ],
            },
            {
              title: "Helper",
              index: "2-10",
              titleData: [
                { title: "guid", index: "2-10-1" },
                { title: "id", index: "2-10-2" },
                { title: "increment", index: "2-10-3" },
              ],
            },
          ],
        },
      ],
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
      if (key.startsWith("1")) {
        this.$router.push({ path: "/home/dataHomePage/Mock/dataTemplate", query: {} });
      }
    },
  },
};
</script>
<style></style>
