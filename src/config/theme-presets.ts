/**
 * 多主题预设 ——「星与夜」系列 + 莫兰迪系列
 * ------------------------------------------------
 * 每套主题 = 品牌主色色阶 + 配套夜色侧栏（暗侧栏随主题带同色系倾向）。
 *
 * 运行时由 utils/theme-style.ts 将取值写入 :root 的 CSS 变量：
 *   --ds-primary / --ds-primary-hover / --ds-primary-active / --ds-primary-light
 *   --ds-night / --ds-night-deep / --ds-night-text
 * 以及 Element Plus 的 --el-color-primary 及其色阶。
 *
 * 新增主题：在本数组登记即可，布局设置抽屉会按 group 自动分组渲染。
 * 注意：莫兰迪系低饱和色必须全手工精调色阶（算法混白/黑会丢失灰调特征），
 * 新增莫兰迪主题时 hover/active/light 请逐个校色，不可依赖算法派生。
 */

/** 主题分组（抽屉渲染分组用） */
export type ThemeGroupKey = 'classic' | 'morandi'

export interface ThemeGroup {
  key: ThemeGroupKey
  /** i18n 名称键（lang/*.js 的 layoutSettings 命名空间） */
  nameKey: string
}

/** 预设分组（渲染顺序即数组顺序） */
export const themeGroups: ThemeGroup[] = [
  { key: 'classic', nameKey: 'layoutSettings.themeGroupClassic' },
  { key: 'morandi', nameKey: 'layoutSettings.themeGroupMorandi' }
]

export interface ThemePreset {
  /** 唯一标识（持久化存储用） */
  key: string
  /** i18n 名称键（lang/*.js 顶层 themePresets 命名空间） */
  nameKey: string
  /** 分组（缺省 classic） */
  group?: ThemeGroupKey
  /** 品牌主色 */
  primary: string
  /** 主色 · 悬浮 */
  primaryHover: string
  /** 主色 · 按下 */
  primaryActive: string
  /** 主色 · 浅底（选中底 / 标签底） */
  primaryLight: string
  /** 夜色侧栏底色（与主色同色系倾向的深色） */
  night: string
  /** 夜色深层（Logo 区 / 悬浮） */
  nightDeep: string
  /** 暗底二级文本 */
  nightText: string
}

export const themePresets: ThemePreset[] = [
  {
    key: 'starry-indigo',
    nameKey: 'themePresets.starryIndigo',
    primary: '#4C5EDB',
    primaryHover: '#6C7CE8',
    primaryActive: '#3A4AC2',
    primaryLight: '#EDEFFB',
    night: '#1E2438',
    nightDeep: '#171C2B',
    nightText: '#A6ACC8'
  },
  {
    key: 'sky-blue',
    nameKey: 'themePresets.skyBlue',
    primary: '#409EFF',
    primaryHover: '#66B1FF',
    primaryActive: '#3A8EE6',
    primaryLight: '#ECF5FF',
    night: '#1A2B4A',
    nightDeep: '#13203A',
    nightText: '#A3B0CE'
  },
  {
    key: 'obsidian-violet',
    nameKey: 'themePresets.obsidianViolet',
    primary: '#7C3AED',
    primaryHover: '#9558F0',
    primaryActive: '#6428C4',
    primaryLight: '#F1EBFD',
    night: '#241D3A',
    nightDeep: '#1B162C',
    nightText: '#ACA6CE'
  },
  {
    key: 'lake-cyan',
    nameKey: 'themePresets.lakeCyan',
    primary: '#0891B2',
    primaryHover: '#23A8C9',
    primaryActive: '#06768F',
    primaryLight: '#E3F4F9',
    night: '#17262E',
    nightDeep: '#111D24',
    nightText: '#A0B4C4'
  },
  {
    key: 'jade-green',
    nameKey: 'themePresets.jadeGreen',
    primary: '#2BA471',
    primaryHover: '#4CB98A',
    primaryActive: '#21865C',
    primaryLight: '#E7F6EF',
    night: '#1B2721',
    nightDeep: '#141D18',
    nightText: '#A2BDAE'
  },
  {
    key: 'amber-glow',
    nameKey: 'themePresets.amberGlow',
    primary: '#D97706',
    primaryHover: '#EA8F2B',
    primaryActive: '#B4620A',
    primaryLight: '#FCF0DF',
    night: '#2A2119',
    nightDeep: '#201912',
    nightText: '#C4B39E'
  },
  {
    key: 'crimson',
    nameKey: 'themePresets.crimson',
    primary: '#DC2626',
    primaryHover: '#E8504F',
    primaryActive: '#B71E1E',
    primaryLight: '#FDEAEA',
    night: '#2B1B1E',
    nightDeep: '#211417',
    nightText: '#C4A4AA'
  },
  {
    key: 'graphite',
    nameKey: 'themePresets.graphite',
    primary: '#475569',
    primaryHover: '#5D6C83',
    primaryActive: '#384456',
    primaryLight: '#EDEFF3',
    night: '#1F2530',
    nightDeep: '#181D26',
    nightText: '#A6AEC2'
  },
  // —— 莫兰迪系列（低饱和灰调，全手工精调）——
  {
    key: 'morandi-mist',
    nameKey: 'themePresets.morandiMist',
    group: 'morandi',
    primary: '#6E8B9E',
    primaryHover: '#87A2B2',
    primaryActive: '#597687',
    primaryLight: '#EDF1F4',
    night: '#2B343B',
    nightDeep: '#22292F',
    nightText: '#9FAEB8'
  },
  {
    key: 'morandi-sage',
    nameKey: 'themePresets.morandiSage',
    group: 'morandi',
    primary: '#90A47E',
    primaryHover: '#A6B995',
    primaryActive: '#75886A',
    primaryLight: '#F0F3EB',
    night: '#2A3027',
    nightDeep: '#212620',
    nightText: '#A9B6A2'
  },
  {
    key: 'morandi-rose',
    nameKey: 'themePresets.morandiRose',
    group: 'morandi',
    primary: '#B5838D',
    primaryHover: '#C79BA3',
    primaryActive: '#9D6C76',
    primaryLight: '#F8F0F2',
    night: '#342C2E',
    nightDeep: '#2A2325',
    nightText: '#C0AFB3'
  }
]

/** 默认主题 */
export const DEFAULT_THEME_KEY = 'starry-indigo'

/** 自定义主题标识（用户通过取色器自选主色时使用） */
export const CUSTOM_THEME_KEY = 'custom'

export function findThemePreset(key: string): ThemePreset | null {
  return themePresets.find(p => p.key === key) || null
}
