<template>
  <el-icon v-if="shouldRender" class="menu-icon">
    <img v-if="isUrl" class="menu-icon-img" :src="imgSrc" alt="" />
    <component :is="resolvedComp" v-else />
  </el-icon>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    /** Element Plus 图标名，或上传图片 URL；未配置则不渲染 */
    name?: string | null
  }>(),
  {
    name: ''
  }
)

const iconsMap = ElementPlusIcons as Record<string, any>

const iconName = computed(() => String(props.name || '').trim())

const isUrl = computed(() => {
  const v = iconName.value
  if (!v) return false
  return (
    v.startsWith('http://') ||
    v.startsWith('https://') ||
    v.startsWith('data:image') ||
    v.includes('uploadImg') ||
    /\.(png|jpe?g|gif|svg|webp)(\?|$)/i.test(v)
  )
})

const imgSrc = computed(() => {
  const v = iconName.value
  if (!v) return ''
  if (
    v.startsWith('http') ||
    v.startsWith('data:') ||
    v.startsWith('/uploadImg') ||
    v.startsWith('/')
  ) {
    return v
  }
  return `/uploadImg/${v}`
})

const resolvedComp = computed(() => {
  const v = iconName.value
  if (v && !isUrl.value && iconsMap[v]) return iconsMap[v]
  return null
})

const shouldRender = computed(
  () => !!iconName.value && (isUrl.value || !!resolvedComp.value)
)
</script>

<style scoped>
.menu-icon-img {
  width: 1em;
  height: 1em;
  object-fit: contain;
}
</style>
