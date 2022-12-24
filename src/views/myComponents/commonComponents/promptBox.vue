<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-05-23 23:24:08
 * @LastEditors: lgy
 * @LastEditTime: 2022-10-18 22:26:49
-->
<template>
  <div>
    <el-button type="primary" @click="showTip = true">开启</el-button>
    <HardTip
      title="提示标题"
      content="提示内容~"
      confirm="关闭"
      :isShow.sync="showTip"
    ></HardTip>
  </div>
</template>
<script>
export default {
  data() {
    return {
      showTip: true,
    };
  },
  methods: {},
};
</script>
