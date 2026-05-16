/** 与参考项目 tnai-vue3-sky-command 的 settings.js 对齐的默认布局配置 */
export const LAYOUT_SETTING_STORAGE_KEY = 'layout-setting'

export const layoutDefaults = {
  sideTheme: 'theme-dark' as 'theme-dark' | 'theme-light',
  showSettings: true,
  /** 1 左侧菜单 2 紧凑侧栏 3 顶部菜单 */
  navType: 1,
  tagsView: true,
  tagsIcon: false,
  fixedHeader: true,
  sidebarLogo: true,
  dynamicTitle: false,
  footerVisible: true
}
