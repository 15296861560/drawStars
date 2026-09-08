<!--
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 14:38:16
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-18 03:28:39
-->
<template>
  <div>
    <router-link :to="to" class="m-router-link">
      <div class="m-home-button">
        <div class="m-img">
          <span
            v-if="imgName.startsWith('z')"
            class="m-home-img inline-svg"
            v-html="svgContent"
          ></span>
          <span
            v-else
            class="m-home-img"
            :class="`drawstars-icon-${imgName}`"
          ></span>
        </div>
        <div>
          <p class="m-p">{{ text }}</p>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'RouterLinkNormal',
  props: {
    to: {
      type: String,
      default: '#'
    },
    imgName: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    format: {
      type: String,
      default: 'svg'
    }
  },
  data() {
    return {
      svgContent: ''
    }
  },
  async created() {
    if (this.imgName.startsWith('z')) {
      try {
        const svgModule = await import(
          `../../assets/img/svg/${this.imgName}.svg?raw`
        )
        this.svgContent = svgModule.default
      } catch (e) {
        console.error('Failed to load SVG:', e)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.inline-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  :deep(svg) {
    width: 64px;
    height: 64px;
    fill: currentColor;
  }
}
</style>
