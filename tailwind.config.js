/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,vue,less,css}'],
  theme: {
    extend: {
      /* 与 src/assets/styles/theme/theme.less 保持同一来源（星夜靛蓝设计系统） */
      colors: {
        ds: {
          /* 品牌色 */
          primary: '#4c5edb',
          'primary-hover': '#6c7ce8',
          'primary-active': '#3a4ac2',
          'primary-light': '#edeffb',
          /* 星夜暗色 */
          night: '#1e2438',
          'night-deep': '#171c2b',
          'night-text': '#a6acc8',
          /* 功能色 */
          success: '#2ba471',
          warning: '#d97706',
          important: '#ea580c',
          danger: '#dc2626',
          info: '#86909c',
          /* 文本 */
          'text-normal': '#191919',
          'text-secondary': '#626364',
          'text-placeholder': '#939496',
          /* 背景 / 描边 */
          'bg-base': '#f6f8fa',
          bg: '#ffffff',
          divider: '#e5e7e9',
          'fill-hover': '#eff1f3'
        }
      },
      borderRadius: {
        ds: '6px',
        'ds-sm': '4px',
        'ds-lg': '10px'
      },
      boxShadow: {
        'ds-sm': '0 1px 2px rgba(23, 32, 74, 0.06)',
        'ds-md': '0 4px 12px rgba(23, 32, 74, 0.08)',
        'ds-lg': '0 8px 24px rgba(23, 32, 74, 0.12)'
      },
      fontFamily: {
        ds: [
          'HarmonyOS Sans SC',
          'PingFang SC',
          'Microsoft YaHei',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ]
      },
      transitionDuration: {
        ds: '200ms'
      }
    }
  },
  plugins: []
}
