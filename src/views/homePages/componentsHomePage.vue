<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        to="/home/componentsHomePage/dragAndDropComponents"
        imgSrc="myComponents/"
        imgName="drag"
        :text="$t('homePage.componentsHomePage.dragAndDropComponents')"
      ></router-link-normal>
      <router-link-normal
        to="/home/componentsHomePage/commonComponents"
        imgSrc="myComponents/"
        imgName="common"
        :text="$t('homePage.componentsHomePage.commonComponents')"
      ></router-link-normal>
    </div>
  </div>
</template>
<script>
import { homePageMixin } from "../mixin/homePageMixin";
export default {
  mixins: [homePageMixin],
};
</script>
