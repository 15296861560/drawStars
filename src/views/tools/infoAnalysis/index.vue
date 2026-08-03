<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        v-for="tool in analysisTools"
        :key="tool.key"
        :to="tool.path"
        :imgName="tool.icon"
        :text="$t(`tool.${tool.i18nKey}`)"
      />
    </div>
    <div class="g-home-module mt10">
      <router-view />
    </div>
  </div>
</template>

<script>
import { homePageMixin } from '../../mixin/homePageMixin'
import { i18nLabelMixin } from '@/views/mixin/i18nLabelMixin'
import { analysisTools } from './registry'

export default {
  mixins: [homePageMixin, i18nLabelMixin],
  data() {
    return {
      analysisTools
    }
  }
}
</script>

<style lang="less" scoped></style>

<i18n>
{
  "en": {
    "tool": {
      "idCard": "ID Card Analysis",
      "phoneLocation": "Phone Location"
    }
  },
  "zh": {
    "tool": {
      "idCard": "身份证信息分析",
      "phoneLocation": "手机号码归属地"
    }
  }
}
</i18n>
