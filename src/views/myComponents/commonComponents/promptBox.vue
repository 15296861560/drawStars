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
    <HardTip
      title="提示标题"
      content="提示内容~"
      confirm="关闭"
      :isShow.sync="showHardTip"
    ></HardTip>
  </div>
</template>
<script>
export default {
  data() {
    return {
      isShow: false,
    };
  },
  methods: {},
};
</script>
