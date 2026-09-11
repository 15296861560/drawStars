<template>
  <div class="directive-lab">
    <h3 class="section-title">{{ $t('section.basic') }}</h3>
    <div class="g-flex-normal flex-wrap">
      <div class="m-card-normal mr10 mb10" v-copy="copyText">
        {{ $t('copy') }}
      </div>
      <div class="m-card-normal mr10 mb10" v-longpress:1500="longpress">
        {{ $t('longpress') }}
      </div>
      <div class="m-card-normal mr10 mb10" v-debounce:1000="debounceClick">
        {{ $t('debounce') }}
      </div>
      <div class="m-card-normal mr10 mb10" v-throttle:1000="throttleClick">
        {{ $t('throttle') }} ({{ throttleCount }})
      </div>
      <div
        class="m-card-normal mr10 mb10"
        v-waterMarker="{
          text: 'DrawStars',
          textColor: 'rgba(180, 180, 180, 0.4)'
        }"
      >
        {{ $t('waterMarker') }}
      </div>
    </div>

    <div class="draggable-area mb20">
      <div class="m-card-normal draggable-el" v-draggable>
        {{ $t('draggable') }}
      </div>
    </div>

    <h3 class="section-title">{{ $t('section.form') }}</h3>
    <el-input
      v-model="inputText"
      class="mb10 demo-input"
      :placeholder="$t('tips.emojiTip')"
      v-emoji
    />
    <el-input
      v-model="trimText"
      class="mb10 demo-input"
      :placeholder="$t('tips.trimTip')"
      v-trim
    />
    <div class="focus-row mb20">
      <el-button type="primary" @click="showFocusInput = true">
        {{ $t('focusBtn') }}
      </el-button>
      <el-input
        v-if="showFocusInput"
        v-model="focusText"
        class="demo-input ml10"
        v-focus
        :placeholder="$t('tips.focusTip')"
      />
    </div>

    <h3 class="section-title">{{ $t('section.overlay') }}</h3>
    <el-radio-group v-model="demoRole" class="mb10">
      <el-radio label="admin">{{ $t('role.admin') }}</el-radio>
      <el-radio label="user">{{ $t('role.user') }}</el-radio>
    </el-radio-group>
    <div
      class="m-card-normal permission-card mb10"
      v-permission="{ role: demoRole, allowed: ['admin'] }"
    >
      {{ $t('permissionAdminOnly') }}
    </div>

    <div class="loading-box mb10" v-loading="loadingActive">
      <p>{{ $t('loadingContent') }}</p>
      <el-button size="small" @click="toggleLoading">
        {{ loadingActive ? $t('loadingStop') : $t('loadingStart') }}
      </el-button>
    </div>

    <div class="click-outside-demo mb20">
      <el-button @click="panelVisible = true">{{
        $t('clickOutsideOpen')
      }}</el-button>
      <div
        v-show="panelVisible"
        class="outside-panel"
        v-click-outside="closePanel"
      >
        {{ $t('clickOutsidePanel') }}
      </div>
    </div>

    <h3 class="section-title">{{ $t('section.lazyload') }}</h3>
    <div class="lazy-scroll">
      <p class="lazy-hint">{{ $t('tips.lazyScroll') }}</p>
      <img
        v-for="(src, index) in lazyImages"
        :key="index"
        class="lazy-img"
        v-lazyload="src"
        alt=""
      />
    </div>
  </div>
</template>

<script>
import { i18nLabelMixin } from '@/views/mixin/i18nLabelMixin'
import labSvg from '@/assets/img/svg/lab.svg'

export default {
  mixins: [i18nLabelMixin],
  data() {
    return {
      copyText: '复制内容 Copy Text',
      inputText: '',
      trimText: '  首尾空格  ',
      focusText: '',
      showFocusInput: false,
      demoRole: 'user',
      panelVisible: false,
      loadingActive: false,
      throttleCount: 0,
      lazyImages: Array.from({ length: 6 }, () => labSvg)
    }
  },
  methods: {
    longpress() {
      this.$message({
        type: 'success',
        message: this.$t('tips.longPressSuccess')
      })
    },
    debounceClick() {
      this.$message({
        type: 'success',
        message: this.$t('tips.cancelClick')
      })
    },
    throttleClick() {
      this.throttleCount += 1
      this.$message({
        type: 'success',
        message: this.$t('tips.throttleFired', { n: this.throttleCount })
      })
    },
    closePanel() {
      this.panelVisible = false
    },
    toggleLoading() {
      this.loadingActive = !this.loadingActive
    }
  }
}
</script>

<style scoped>
.directive-lab {
  padding: 8px 4px 24px;
}

.section-title {
  margin: 16px 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.flex-wrap {
  flex-wrap: wrap;
}

.demo-input {
  max-width: 360px;
}

.focus-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.ml10 {
  margin-left: 10px;
}

.draggable-area {
  position: relative;
  width: min(50vw, 480px);
  height: 240px;
  border: 1px solid var(--el-color-primary);
  border-radius: 4px;
}

.draggable-el {
  position: relative;
  user-select: none;
  width: fit-content;
}

.permission-card {
  max-width: 320px;
}

.loading-box {
  position: relative;
  min-height: 100px;
  max-width: 360px;
  padding: 16px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
}

.click-outside-demo {
  position: relative;
}

.outside-panel {
  position: absolute;
  top: 44px;
  left: 0;
  z-index: 5;
  min-width: 200px;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  box-shadow: var(--el-box-shadow-light);
}

.lazy-scroll {
  max-height: 320px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}

.lazy-hint {
  margin: 0 0 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.lazy-img {
  display: block;
  width: 120px;
  height: 120px;
  margin: 0 auto 80vh;
  object-fit: contain;
}

.lazy-img:last-child {
  margin-bottom: 12px;
}
</style>

<i18n>
{
  "zh": {
    "section": {
      "basic": "基础交互",
      "form": "表单相关",
      "overlay": "显隐与遮罩",
      "lazyload": "图片懒加载"
    },
    "copy": "点击复制",
    "longpress": "长按 1.5s",
    "debounce": "防抖点击",
    "throttle": "节流点击",
    "draggable": "拖拽我",
    "waterMarker": "水印区域",
    "focusBtn": "显示并自动聚焦输入框",
    "role": { "admin": "管理员", "user": "普通用户" },
    "permissionAdminOnly": "仅 admin 可见",
    "loadingContent": "v-loading 遮罩示例",
    "loadingStart": "显示加载",
    "loadingStop": "关闭加载",
    "clickOutsideOpen": "打开面板",
    "clickOutsidePanel": "点击外部区域关闭",
    "tips": {
      "emojiTip": "禁止输入表情",
      "trimTip": "失焦时自动去除首尾空格",
      "focusTip": "挂载后自动 focus",
      "longPressSuccess": "长按成功",
      "cancelClick": "1s 内多次点击只触发一次",
      "throttleFired": "节流触发第 {n} 次",
      "lazyScroll": "向下滚动，图片进入视口后加载"
    }
  },
  "en": {
    "section": {
      "basic": "Basic interaction",
      "form": "Form",
      "overlay": "Visibility & overlay",
      "lazyload": "Lazy load"
    },
    "copy": "Click to copy",
    "longpress": "Long press 1.5s",
    "debounce": "Debounce click",
    "throttle": "Throttle click",
    "draggable": "Drag me",
    "waterMarker": "Watermark",
    "focusBtn": "Show & focus input",
    "role": { "admin": "Admin", "user": "User" },
    "permissionAdminOnly": "Admin only",
    "loadingContent": "v-loading demo",
    "loadingStart": "Show loading",
    "loadingStop": "Hide loading",
    "clickOutsideOpen": "Open panel",
    "clickOutsidePanel": "Click outside to close",
    "tips": {
      "emojiTip": "Emoji blocked",
      "trimTip": "Trim on blur",
      "focusTip": "Auto focus on mount",
      "longPressSuccess": "Long press succeeded",
      "cancelClick": "Only one fire within 1s",
      "throttleFired": "Throttled fire #{n}",
      "lazyScroll": "Scroll down to load images in view"
    }
  }
}
</i18n>
