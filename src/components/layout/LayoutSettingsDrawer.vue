<template>
  <el-drawer
    v-model="layout.drawerVisible"
    :with-header="false"
    :lock-scroll="false"
    direction="rtl"
    size="300px"
  >
    <div class="setting-drawer-title">
      <h3 class="drawer-title">{{ $t('layoutSettings.navTitle') }}</h3>
    </div>
    <div class="nav-wrap">
      <el-tooltip :content="$t('layoutSettings.navLeft')" placement="bottom">
        <div
          class="item left"
          :class="{ activeItem: layout.navType === 1 }"
          @click="setNavType(1)"
        >
          <b></b><b></b>
        </div>
      </el-tooltip>
      <el-tooltip :content="$t('layoutSettings.navMix')" placement="bottom">
        <div
          class="item mix"
          :class="{ activeItem: layout.navType === 2 }"
          @click="setNavType(2)"
        >
          <b></b><b></b>
        </div>
      </el-tooltip>
      <el-tooltip :content="$t('layoutSettings.navTop')" placement="bottom">
        <div
          class="item top"
          :class="{ activeItem: layout.navType === 3 }"
          @click="setNavType(3)"
        >
          <b></b><b></b>
        </div>
      </el-tooltip>
    </div>

    <div class="setting-drawer-title">
      <h3 class="drawer-title">{{ $t('layoutSettings.themeStyle') }}</h3>
    </div>
    <div class="setting-drawer-block-checbox">
      <div
        class="setting-drawer-block-checbox-item"
        @click="layout.sideTheme = 'theme-dark'"
      >
        <span class="thumb thumb-dark" aria-hidden="true" />
        <div
          v-if="layout.sideTheme === 'theme-dark'"
          class="setting-drawer-block-checbox-selectIcon"
        >
          <el-icon :color="layout.theme"><Select /></el-icon>
        </div>
      </div>
      <div
        class="setting-drawer-block-checbox-item"
        @click="layout.sideTheme = 'theme-light'"
      >
        <span class="thumb thumb-light" aria-hidden="true" />
        <div
          v-if="layout.sideTheme === 'theme-light'"
          class="setting-drawer-block-checbox-selectIcon"
        >
          <el-icon :color="layout.theme"><Select /></el-icon>
        </div>
      </div>
    </div>

    <div class="setting-drawer-title">
      <h3 class="drawer-title">{{ $t('layoutSettings.themePreset') }}</h3>
    </div>
    <div v-for="group in themeGroups" :key="group.key" class="preset-group">
      <div class="preset-group-title">{{ $t(group.nameKey) }}</div>
      <div class="theme-preset-grid">
        <div
          v-for="preset in groupedPresets[group.key]"
          :key="preset.key"
          class="theme-preset-item"
          :class="{ active: layout.themeName === preset.key }"
          @click="layout.setThemePreset(preset.key)"
        >
          <div class="preview">
            <span class="preview-side" :style="{ background: preset.night }" />
            <span class="preview-main">
              <span
                class="preview-bar"
                :style="{ background: preset.primary }"
              />
            </span>
          </div>
          <div class="name">{{ $t(preset.nameKey) }}</div>
          <el-icon v-if="layout.themeName === preset.key" class="select-mark">
            <Select />
          </el-icon>
        </div>
        <div
          v-if="group.key === 'morandi'"
          class="theme-preset-item custom"
          :class="{ active: layout.themeName === 'custom' }"
          @click="applyCustomTheme"
        >
          <div class="preview">
            <span class="preview-side night-var" />
            <span class="preview-main">
              <span class="preview-bar" :style="{ background: layout.theme }" />
            </span>
          </div>
          <div class="name custom-name">
            <span class="custom-label">{{ $t('themePresets.custom') }}</span>
            <el-color-picker
              v-model="layout.theme"
              :predefine="predefineColors"
              size="small"
              @change="onThemePick"
              @click.stop
            />
          </div>
          <el-icon v-if="layout.themeName === 'custom'" class="select-mark">
            <Select />
          </el-icon>
        </div>
      </div>
    </div>
    <el-divider />

    <h3 class="drawer-title">{{ $t('layoutSettings.systemLayout') }}</h3>
    <div class="drawer-item">
      <span>{{ $t('layoutSettings.tagsView') }}</span>
      <span class="comp-style">
        <el-switch v-model="layout.tagsView" class="drawer-switch" />
      </span>
    </div>
    <div class="drawer-item">
      <span>{{ $t('layoutSettings.tagsIcon') }}</span>
      <span class="comp-style">
        <el-switch
          v-model="layout.tagsIcon"
          :disabled="!layout.tagsView"
          class="drawer-switch"
        />
      </span>
    </div>
    <div class="drawer-item">
      <span>{{ $t('layoutSettings.fixedHeader') }}</span>
      <span class="comp-style">
        <el-switch v-model="layout.fixedHeader" class="drawer-switch" />
      </span>
    </div>
    <div class="drawer-item">
      <span>{{ $t('layoutSettings.sidebarLogo') }}</span>
      <span class="comp-style">
        <el-switch v-model="layout.sidebarLogo" class="drawer-switch" />
      </span>
    </div>
    <div class="drawer-item">
      <span>{{ $t('layoutSettings.dynamicTitle') }}</span>
      <span class="comp-style">
        <el-switch v-model="layout.dynamicTitle" class="drawer-switch" />
      </span>
    </div>
    <div class="drawer-item">
      <span>{{ $t('layoutSettings.footer') }}</span>
      <span class="comp-style">
        <el-switch v-model="layout.footerVisible" class="drawer-switch" />
      </span>
    </div>

    <el-divider />
    <el-button type="primary" plain @click="saveSetting">
      <el-icon class="mr4"><DocumentAdd /></el-icon
      >{{ $t('layoutSettings.save') }}
    </el-button>
    <el-button plain @click="resetSetting">
      <el-icon class="mr4"><Refresh /></el-icon>{{ $t('layoutSettings.reset') }}
    </el-button>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { ElLoading } from 'element-plus'
import { Select, DocumentAdd, Refresh } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { layoutSettingsStore } from '@/stores/layout-settings'
import {
  themePresets,
  themeGroups,
  type ThemeGroupKey,
  type ThemePreset
} from '@/config/theme-presets'

const { t } = useI18n()
const layout = layoutSettingsStore()

/** 预设按分组归类（组顺序见 themeGroups） */
const groupedPresets = computed<Record<ThemeGroupKey, ThemePreset[]>>(() => {
  const map = { classic: [], morandi: [] } as Record<
    ThemeGroupKey,
    ThemePreset[]
  >
  for (const preset of themePresets) {
    map[preset.group ?? 'classic'].push(preset)
  }
  return map
})

const predefineColors = [
  '#4C5EDB',
  '#409EFF',
  '#7C3AED',
  '#0891B2',
  '#2BA471',
  '#D97706',
  '#DC2626',
  '#C71585',
  '#475569',
  '#6E8B9E',
  '#90A47E',
  '#B5838D'
]

function setNavType(n: number) {
  layout.navType = n
}

function onThemePick(val: string | null) {
  if (val) {
    layout.setThemeColor(val)
  }
}

/** 点击自定义卡：按取色器当前色应用 */
function applyCustomTheme() {
  layout.setThemeColor(layout.theme)
}

watch(
  () => layout.dynamicTitle,
  () => {
    layout.applyDocumentTitle(
      // 由父级路由同步；此处仅恢复默认或保持
      null
    )
  }
)

function saveSetting() {
  const loading = ElLoading.service({
    lock: true,
    text: t('layoutSettings.saving'),
    background: 'rgba(15,22,48,0.4)'
  })
  layout.persistToLocalStorage()
  setTimeout(() => {
    loading.close()
  }, 400)
}

function resetSetting() {
  const loading = ElLoading.service({
    lock: true,
    text: t('layoutSettings.resetting'),
    background: 'rgba(15,22,48,0.4)'
  })
  setTimeout(() => {
    loading.close()
    layout.resetLocalStorageAndReload()
  }, 600)
}
</script>

<style scoped lang="less">
.mr4 {
  margin-right: 4px;
  vertical-align: middle;
}

.setting-drawer-title {
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  line-height: 22px;
  font-weight: bold;
  .drawer-title {
    font-size: 14px;
  }
}

.setting-drawer-block-checbox {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 20px;
  .setting-drawer-block-checbox-item {
    position: relative;
    margin-right: 16px;
    border-radius: 2px;
    cursor: pointer;
    .thumb {
      display: block;
      width: 48px;
      height: 48px;
      border-radius: 2px;
      border: 1px solid var(--el-border-color);
    }
    .thumb-dark {
      background: linear-gradient(90deg, var(--ds-night) 30%, #f6f8fa 30%);
    }
    .thumb-light {
      background: linear-gradient(90deg, #fff 30%, #f6f8fa 30%);
    }
    .setting-drawer-block-checbox-selectIcon {
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }
  }
}

.preset-group {
  & + .preset-group .preset-group-title {
    margin-top: 14px;
  }
  .preset-group-title {
    margin: 2px 0 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    letter-spacing: 0.02em;
  }
}

.theme-preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 0 0 16px;
}

.theme-preset-item {
  position: relative;
  border: 2px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
  }
  &.active {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 1px var(--el-color-primary-light-8);
  }
  .preview {
    display: flex;
    height: 36px;
    border-radius: 4px;
    overflow: hidden;
    .preview-side {
      width: 30%;
    }
    .preview-main {
      position: relative;
      flex: 1;
      background: #f6f8fa;
      .preview-bar {
        position: absolute;
        top: 7px;
        left: 7px;
        right: 7px;
        height: 8px;
        border-radius: 2px;
      }
    }
  }
  .night-var {
    background: var(--ds-night);
  }
  .name {
    margin-top: 6px;
    font-size: 12px;
    line-height: 24px;
    color: var(--el-text-color-regular);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .custom-name {
    display: flex;
    align-items: center;
    justify-content: space-between;
    :deep(.el-color-picker) {
      flex-shrink: 0;
    }
    .custom-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .select-mark {
    position: absolute;
    top: -7px;
    right: -7px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--el-color-primary);
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 2px var(--el-bg-color);
  }
}

.drawer-item {
  color: var(--el-text-color-regular);
  padding: 12px 0;
  font-size: 14px;
  overflow: hidden;
  .comp-style {
    float: right;
    margin: -3px 8px 0 0;
  }
}

.nav-wrap {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 20px;
  .activeItem {
    border: 2px solid var(--el-color-primary) !important;
  }
  .item {
    position: relative;
    margin-right: 16px;
    cursor: pointer;
    width: 56px;
    height: 48px;
    border-radius: 4px;
    background: #f6f8fa;
    border: 2px solid transparent;
  }
  .left {
    b:first-child {
      display: block;
      height: 30%;
      background: #fff;
    }
    b:last-child {
      width: 30%;
      background: var(--ds-night);
      position: absolute;
      height: 100%;
      top: 0;
      border-radius: 4px 0 0 4px;
    }
  }
  .mix {
    b:first-child {
      border-radius: 4px 4px 0 0;
      display: block;
      height: 30%;
      background: var(--ds-night);
    }
    b:last-child {
      width: 30%;
      background: var(--ds-night);
      position: absolute;
      height: 70%;
      border-radius: 0 0 0 4px;
    }
  }
  .top {
    b:first-child {
      display: block;
      height: 30%;
      background: var(--ds-night);
      border-radius: 4px 4px 0 0;
    }
  }
}
</style>
