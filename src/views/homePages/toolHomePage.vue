<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/toolHomePage/Lodash" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/tools/lodash.png" />
          </div>
          <div>
            <p class="m-p">{{ $t("homePage.toolHomePage.Lodash") }}</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/toolHomePage/agora" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/tools/agora.png" />
          </div>
          <div>
            <p class="m-p">{{ $t("homePage.toolHomePage.agora") }}</p>
          </div>
        </div>
      </router-link>

      <router-link-normal
        to="/home/toolHomePage/utilities"
        imgSrc="tools/"
        imgName="utilities"
        :text="$t('homePage.toolHomePage.utilities')"
      ></router-link-normal>
      <router-link-normal
        to="/home/toolHomePage/practice"
        imgSrc="tools/"
        imgName="practice"
        :text="$t('homePage.toolHomePage.practice')"
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
