<!--
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-05-23 23:28:07
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-22 17:22:21
-->
<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/toolHomePage/Lodash" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/png/lodash.png" />
          </div>
          <div>
            <p class="m-p">{{ $t('homePage.toolHomePage.Lodash') }}</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/toolHomePage/agora" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/png/agora.png" />
          </div>
          <div>
            <p class="m-p">{{ $t('homePage.toolHomePage.agora') }}</p>
          </div>
        </div>
      </router-link>

      <router-link-normal
        :to="`/home/toolHomePage/${item.name}`"
        :imgName="item.icon || item.name"
        :text="$t(`homePage.toolHomePage.${item.name}`)"
        v-for="(item, index) in routes"
        :key="item.name"
      ></router-link-normal>
    </div>
  </div>
</template>
<script>
import { homePageMixin } from '../mixin/homePageMixin'
export default {
  mixins: [homePageMixin],
  data() {
    return {
      routes: [
        { name: 'chat' },
        { name: 'utilities' },
        { name: 'practice' },
        { name: 'translate' },
        { name: 'pay' },
        { name: 'compress' },
        { name: 'networkStrength' },
        { name: 'infoAnalysis' },
        { name: 'shortLink', icon: 'zshortLink' },
        { name: 'watermark', icon: 'zwatermark' }
      ]
    }
  }
}
</script>
