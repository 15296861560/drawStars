/**
 * 运行时主题切换
 * ------------------------------------------------
 * 将主题取值以内联 style 写入 :root 的 CSS 变量（优先级高于
 * element-theme.less 基线），实现不刷新页面的整体换肤：
 *
 *   - 品牌主色：--ds-primary 系列 + Element Plus --el-color-primary 色阶
 *   - 夜色侧栏：--ds-night / --ds-night-deep / --ds-night-text
 *
 * 入口：
 *   applyThemePreset(preset)  应用主题预设（主色取精调值 + 配套夜色）
 *   handleThemeStyle(hex)     应用自定义主色（色阶由算法派生，夜色回退星夜靛蓝）
 */

import type { ThemePreset } from '@/config/theme-presets'

export function hexToRgb(str: string): number[] {
  const s = str.replace('#', '')
  const hexs = s.match(/../g)
  if (!hexs || hexs.length < 3) {
    return [0, 0, 0]
  }
  return hexs.slice(0, 3).map(h => parseInt(h, 16))
}

export function rgbToHex(r: number, g: number, b: number): string {
  const hexs = [r, g, b].map(n => {
    const h = n.toString(16)
    return h.length === 1 ? `0${h}` : h
  })
  return `#${hexs.join('')}`
}

/** 提亮：level 0~1，向白色混合（与 Element mix(#fff, primary, level) 规则一致） */
export function getLightColor(color: string, level: number): string {
  const rgb = hexToRgb(color)
  for (let i = 0; i < 3; i++) {
    rgb[i] = Math.floor((255 - rgb[i]) * level + rgb[i])
  }
  return rgbToHex(rgb[0], rgb[1], rgb[2])
}

/** 压暗：level 0~1，向黑色混合 */
export function getDarkColor(color: string, level: number): string {
  const rgb = hexToRgb(color)
  for (let i = 0; i < 3; i++) {
    rgb[i] = Math.floor(rgb[i] * (1 - level))
  }
  return rgbToHex(rgb[0], rgb[1], rgb[2])
}

/** 自定义主色时，夜色侧栏回退为默认「星夜靛蓝」的夜色 */
const DEFAULT_NIGHT = {
  night: '#1E2438',
  nightDeep: '#171C2B',
  nightText: '#A6ACC8'
}

function setPrimaryVars(
  primary: string,
  precise?: Pick<
    ThemePreset,
    'primaryHover' | 'primaryActive' | 'primaryLight'
  >
): void {
  const style = document.documentElement.style
  style.setProperty('--el-color-primary', primary)
  for (let i = 1; i <= 9; i++) {
    style.setProperty(
      `--el-color-primary-light-${i}`,
      getLightColor(primary, i / 10)
    )
  }
  for (let i = 1; i <= 9; i++) {
    style.setProperty(
      `--el-color-primary-dark-${i}`,
      getDarkColor(primary, i / 10)
    )
  }
  style.setProperty('--current-color', primary)
  // 设计系统主色阶：预设用精调值，自定义色按算法派生
  style.setProperty('--ds-primary', primary)
  style.setProperty(
    '--ds-primary-hover',
    precise?.primaryHover ?? getLightColor(primary, 0.18)
  )
  style.setProperty(
    '--ds-primary-active',
    precise?.primaryActive ?? getDarkColor(primary, 0.22)
  )
  style.setProperty(
    '--ds-primary-light',
    precise?.primaryLight ?? getLightColor(primary, 0.9)
  )
}

function setNightVars(night: {
  night: string
  nightDeep: string
  nightText: string
}): void {
  const style = document.documentElement.style
  style.setProperty('--ds-night', night.night)
  style.setProperty('--ds-night-deep', night.nightDeep)
  style.setProperty('--ds-night-text', night.nightText)
}

/** 自定义主色：单一色值派生整套色阶，夜色侧栏回退默认 */
export function handleThemeStyle(theme: string): void {
  setPrimaryVars(theme)
  setNightVars(DEFAULT_NIGHT)
}

/** 应用主题预设：主色取精调色阶 + 配套夜色侧栏 */
export function applyThemePreset(preset: ThemePreset): void {
  setPrimaryVars(preset.primary, preset)
  setNightVars(preset)
}
