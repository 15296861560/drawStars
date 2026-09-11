import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as _VueRouter from 'vue-router'
import {
  LAYOUT_SETTING_STORAGE_KEY,
  layoutDefaults
} from '@/config/layout-defaults'
import {
  CUSTOM_THEME_KEY,
  DEFAULT_THEME_KEY,
  findThemePreset,
  themePresets
} from '@/config/theme-presets'
import { applyThemePreset, handleThemeStyle } from '@/utils/theme-style'

export type SideTheme = 'theme-dark' | 'theme-light'

export type VisitedView = {
  path: string
  fullPath: string
  name?: string | symbol | null
  title: string
}

function readStoredLayout(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(LAYOUT_SETTING_STORAGE_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

const stored = readStoredLayout()

/**
 * 解析持久化中的主题标识：
 * - 合法预设 key 或 'custom' 直接采用
 * - 旧数据兼容：仅存有色值时，匹配预设主色则回填对应 key，否则视为自定义
 */
function resolveThemeName(source: Record<string, unknown> | null): string {
  if (
    typeof source?.themeName === 'string' &&
    (source.themeName === CUSTOM_THEME_KEY ||
      themePresets.some(p => p.key === source.themeName))
  ) {
    return source.themeName
  }
  if (typeof source?.theme === 'string') {
    const matched = themePresets.find(p => p.primary.toLowerCase() === (source.theme as string).toLowerCase())
    if (matched) {
      return matched.key
    }
    return CUSTOM_THEME_KEY
  }
  return DEFAULT_THEME_KEY
}

const BASE_TITLE = 'Draw Stars'

export const layoutSettingsStore = defineStore('layoutSettings', () => {
  const themeName = ref(resolveThemeName(stored))
  const theme = ref(
    typeof stored?.theme === 'string' ? stored.theme : '#4C5EDB'
  )
  const sideTheme = ref<SideTheme>(
    stored?.sideTheme === 'theme-light'
      ? 'theme-light'
      : layoutDefaults.sideTheme
  )
  const navType = ref(
    typeof stored?.navType === 'number'
      ? stored.navType
      : layoutDefaults.navType
  )
  const tagsView = ref(
    typeof stored?.tagsView === 'boolean'
      ? stored.tagsView
      : layoutDefaults.tagsView
  )
  const tagsIcon = ref(
    typeof stored?.tagsIcon === 'boolean'
      ? stored.tagsIcon
      : layoutDefaults.tagsIcon
  )
  const fixedHeader = ref(
    typeof stored?.fixedHeader === 'boolean'
      ? stored.fixedHeader
      : layoutDefaults.fixedHeader
  )
  const sidebarLogo = ref(
    typeof stored?.sidebarLogo === 'boolean'
      ? stored.sidebarLogo
      : layoutDefaults.sidebarLogo
  )
  const dynamicTitle = ref(
    typeof stored?.dynamicTitle === 'boolean'
      ? stored.dynamicTitle
      : layoutDefaults.dynamicTitle
  )
  const footerVisible = ref(
    typeof stored?.footerVisible === 'boolean'
      ? stored.footerVisible
      : layoutDefaults.footerVisible
  )

  const visitedViews = ref<VisitedView[]>([])

  const drawerVisible = ref(false)

  function routeTitle(route: _VueRouter.RouteLocationNormalized): string {
    const t = route.meta?.title
    if (Array.isArray(t)) {
      return t.join(' / ')
    }
    if (typeof t === 'string') {
      return t
    }
    return (route.name && String(route.name)) || route.path
  }

  function addVisitedView(route: _VueRouter.RouteLocationNormalized) {
    if (!tagsView.value) {
      return
    }
    if (!route.path || route.path === '/login' || route.path === '/') {
      return
    }
    const title = routeTitle(route)
    const exists = visitedViews.value.some(v => v.fullPath === route.fullPath)
    if (exists) {
      return
    }
    visitedViews.value.push({
      path: route.path,
      fullPath: route.fullPath,
      name: route.name,
      title
    })
    if (visitedViews.value.length > 12) {
      visitedViews.value.shift()
    }
  }

  function removeVisitedView(fullPath: string) {
    const i = visitedViews.value.findIndex(v => v.fullPath === fullPath)
    if (i !== -1) {
      visitedViews.value.splice(i, 1)
    }
  }

  /** 切换主题预设：应用精调色阶与配套夜色侧栏 */
  function setThemePreset(key: string) {
    const preset = findThemePreset(key)
    if (!preset) {
      return
    }
    themeName.value = preset.key
    theme.value = preset.primary
    applyThemePreset(preset)
  }

  /** 自定义主色：单一色值算法派生色阶，夜色侧栏回退默认 */
  function setThemeColor(hex: string) {
    themeName.value = CUSTOM_THEME_KEY
    theme.value = hex
    handleThemeStyle(hex)
  }

  function applyThemeFromState() {
    if (themeName.value === CUSTOM_THEME_KEY) {
      handleThemeStyle(theme.value)
      return
    }
    const preset = findThemePreset(themeName.value)
    if (preset) {
      applyThemePreset(preset)
    } else {
      handleThemeStyle(theme.value)
    }
  }

  function applyDocumentTitle(
    route: _VueRouter.RouteLocationNormalized | null
  ) {
    if (!dynamicTitle.value || !route) {
      document.title = BASE_TITLE
      return
    }
    const piece = routeTitle(route)
    document.title = piece ? `${piece} - ${BASE_TITLE}` : BASE_TITLE
  }

  function openDrawer() {
    drawerVisible.value = true
  }

  function closeDrawer() {
    drawerVisible.value = false
  }

  function persistToLocalStorage() {
    const payload = {
      navType: navType.value,
      tagsView: tagsView.value,
      tagsIcon: tagsIcon.value,
      fixedHeader: fixedHeader.value,
      sidebarLogo: sidebarLogo.value,
      dynamicTitle: dynamicTitle.value,
      footerVisible: footerVisible.value,
      sideTheme: sideTheme.value,
      themeName: themeName.value,
      theme: theme.value
    }
    localStorage.setItem(LAYOUT_SETTING_STORAGE_KEY, JSON.stringify(payload))
  }

  function resetLocalStorageAndReload() {
    localStorage.removeItem(LAYOUT_SETTING_STORAGE_KEY)
    window.location.reload()
  }

  const isDarkAside = computed(() => sideTheme.value === 'theme-dark')

  function clearVisitedViews() {
    visitedViews.value = []
  }

  return {
    themeName,
    theme,
    sideTheme,
    navType,
    tagsView,
    tagsIcon,
    fixedHeader,
    sidebarLogo,
    dynamicTitle,
    footerVisible,
    visitedViews,
    drawerVisible,
    isDarkAside,
    BASE_TITLE,
    addVisitedView,
    removeVisitedView,
    setThemePreset,
    setThemeColor,
    applyThemeFromState,
    applyDocumentTitle,
    openDrawer,
    closeDrawer,
    persistToLocalStorage,
    resetLocalStorageAndReload,
    routeTitle,
    clearVisitedViews
  }
})
