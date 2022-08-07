<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-08-07 21:19:26
 * @LastEditors: lgy
 * @LastEditTime: 2022-08-07 21:55:50
-->
<template>
  <div class="not-found">
    <h1 class="not-found-title">404</h1>
    <h2 class="not-found-content">{{ $t("notFoundContent") }}</h2>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
};
</script>
<style scoped lang="less">
@-webkit-keyframes com-linear {
  from {
    -webkit-filter: hue-rotate(0deg);
  }

  to {
    -webkit-filter: hue-rotate(-360deg);
  }
}
.not-found {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 80vh;
  .not-found-title {
    font-size: 30rem;
    margin: 0;
    background-image: -webkit-linear-gradient(45deg, red, yellow, aqua, green);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    -webkit-animation: com-linear 6s infinite linear;
  }

  .not-found-content {
    font-size: 3rem;
  }
}
</style>
<i18n>
{
  "en": {
    "notFoundContent": "The page you visited is still under development. Please find it later."
  },
  "zh": {
    "notFoundContent": "您访问的页面还在开发中，过段时间再找来吧"
  }
}
</i18n>
