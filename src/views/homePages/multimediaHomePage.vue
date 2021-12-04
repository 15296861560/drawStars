<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        to="/home/multimediaHomePage/simpleUse"
        imgSrc="multimedia/"
        imgName="simple"
        :text="$t('homePage.multimediaHomePage.simpleUse')"
      ></router-link-normal>
      <router-link-normal
        to="/home/multimediaHomePage/camera"
        imgSrc="multimedia/"
        imgName="camera"
        :text="$t('homePage.multimediaHomePage.camera')"
      ></router-link-normal>
      <router-link-normal
        to="/home/multimediaHomePage/pictureEditing"
        imgSrc="multimedia/"
        imgName="crop"
        :text="$t('homePage.multimediaHomePage.pictureEditing')"
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
