<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        :to="`/home/${homepage}/${page.name}`"
        :imgName="page.imgName"
        :text="$t(`homePage.${homepage}.${page.name}`)"
        v-for="page in routes"
        :key="page.name"
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
      homepage: 'manageHomePage',
      routes: [
        { name: 'user', imgName: 'app' },
        { name: 'role', imgName: 'app' },
        { name: 'menu', imgName: 'app' },
        { name: 'points', imgName: 'app' },
        { name: 'task', imgName: 'app' },
        { name: 'notice', imgName: 'notice' },
        { name: 'logs', imgName: 'log' },
        { name: 'app', imgName: 'app' }
      ]
    }
  }
}
</script>
