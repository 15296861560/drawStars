<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        :to="page.path"
        :imgName="page.imgName"
        :text="$t(`homePage.surveyHomePage.${page.name}`)"
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
      routes: [
        { name: 'list', path: '/home/survey', imgName: 'app' },
        { name: 'create', path: '/home/survey/create', imgName: 'notice' },
        { name: 'template', path: '/home/survey/template', imgName: 'menu' },
        {
          name: 'questionBank',
          path: '/home/survey/question-bank',
          imgName: 'log'
        }
      ]
    }
  }
}
</script>
