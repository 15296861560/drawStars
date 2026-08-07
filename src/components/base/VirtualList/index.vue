<!--
 * @Description: 通用固定行高虚拟列表
 -->
<template>
  <div
    ref="containerRef"
    class="virtual-list"
    :class="customClass"
    :style="containerStyle"
    @scroll.passive="onScroll"
  >
    <div
      class="virtual-list__spacer"
      :style="{ height: `${totalHeight}px` }"
      aria-hidden="true"
    />
    <div
      class="virtual-list__viewport"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="entry in visibleEntries"
        :key="resolveKey(entry.item, entry.index)"
        class="virtual-list__item"
        :style="itemStyle"
      >
        <slot name="default" :item="entry.item" :index="entry.index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties
} from 'vue'

const props = withDefaults(
  defineProps<{
    /** 数据源 */
    items: any[]
    /** 单行高度（px），固定行高虚拟滚动 */
    itemHeight?: number
    /** 视口上下额外渲染行数 */
    buffer?: number
    /** 容器高度，数字视为 px；也可传 CSS 高度如 '100%' */
    height?: number | string
    /** 取唯一 key；也可传字段名 */
    itemKey?: string | ((item: any, index: number) => string | number)
    /** 自定义 class */
    customClass?: string | string[] | Record<string, boolean>
  }>(),
  {
    itemHeight: 72,
    buffer: 5,
    height: '100%',
    itemKey: 'id'
  }
)

const emit = defineEmits<{
  scroll: [payload: { scrollTop: number; clientHeight: number }]
  /** 接近底部时触发，可用于加载更多 */
  reachBottom: []
}>()

const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const clientHeight = ref(0)
const reachBottomEmitted = ref(false)

const totalHeight = computed(() => props.items.length * props.itemHeight)

const containerStyle = computed<CSSProperties>(() => {
  const h = props.height
  return {
    height: typeof h === 'number' ? `${h}px` : h
  }
})

const itemStyle = computed<CSSProperties>(() => ({
  height: `${props.itemHeight}px`,
  boxSizing: 'border-box'
}))

const startIndex = computed(() => {
  const raw = Math.floor(scrollTop.value / props.itemHeight) - props.buffer
  return Math.max(0, raw)
})

const endIndex = computed(() => {
  const visibleCount = Math.ceil(clientHeight.value / props.itemHeight)
  const raw = startIndex.value + visibleCount + props.buffer * 2
  return Math.min(props.items.length, Math.max(startIndex.value, raw))
})

const offsetY = computed(() => startIndex.value * props.itemHeight)

const visibleEntries = computed(() => {
  const list: Array<{ item: any; index: number }> = []
  for (let i = startIndex.value; i < endIndex.value; i++) {
    list.push({ item: props.items[i], index: i })
  }
  return list
})

function resolveKey(item: any, index: number): string | number {
  const key = props.itemKey
  if (typeof key === 'function') return key(item, index)
  if (item && typeof item === 'object' && key in item) {
    const val = item[key]
    if (val != null && val !== '') return val as string | number
  }
  return index
}

function measure() {
  const el = containerRef.value
  if (!el) return
  clientHeight.value = el.clientHeight
}

function onScroll() {
  const el = containerRef.value
  if (!el) return
  scrollTop.value = el.scrollTop
  clientHeight.value = el.clientHeight
  emit('scroll', {
    scrollTop: el.scrollTop,
    clientHeight: el.clientHeight
  })

  const distance = el.scrollHeight - el.scrollTop - el.clientHeight
  if (distance <= props.itemHeight * 2) {
    if (!reachBottomEmitted.value) {
      reachBottomEmitted.value = true
      emit('reachBottom')
    }
  } else {
    reachBottomEmitted.value = false
  }
}

function scrollToIndex(index: number, behavior: ScrollBehavior = 'auto') {
  const el = containerRef.value
  if (!el) return
  const top = Math.max(0, Math.min(index, props.items.length - 1)) * props.itemHeight
  el.scrollTo({ top, behavior })
}

function scrollToTop(behavior: ScrollBehavior = 'auto') {
  containerRef.value?.scrollTo({ top: 0, behavior })
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  measure()
  const el = containerRef.value
  if (el && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(el)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => props.items.length,
  async (len, prev) => {
    await nextTick()
    measure()
    // 首次追加数据时保持滚动位置可用；筛切换变短时回到顶部
    if (len < (prev || 0)) {
      scrollToTop()
      reachBottomEmitted.value = false
    }
  }
)

defineExpose({
  scrollToIndex,
  scrollToTop,
  measure,
  getScrollEl: () => containerRef.value
})
</script>

<style lang="less" scoped>
.virtual-list {
  position: relative;
  width: 100%;
  overflow: auto;
  overscroll-behavior: contain;
}

.virtual-list__spacer {
  width: 100%;
  pointer-events: none;
}

.virtual-list__viewport {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
}

.virtual-list__item {
  width: 100%;
  overflow: hidden;
}
</style>
