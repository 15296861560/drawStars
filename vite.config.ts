/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 21:55:05
 * @LastEditors: lgy
 * @LastEditTime: 2024-03-04 23:53:12
 */
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueI18n from '@intlify/vite-plugin-vue-i18n'

import commonjs from '@rollup/plugin-commonjs' // 引入commojs
import requireTransform from 'vite-plugin-require-transform' // 引入require

import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        // target: "http://127.0.0.1:8010",
        // dev：drawStars-serve-node 非生产模式 REST 端口为 8011（8031 是 notify WS端口，HTTP 请求会报 426）
        target: 'http://127.0.0.1:8011',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      },
      '/uploadImg': {
        // target: "http://127.0.0.1:8010",
        target: 'http://127.0.0.1:8011',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/uploadImg/, '')
      },
      '/phoneAreaApi': {
        target: 'https://cx.shouji.360.cn',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/phoneAreaApi/, '')
      },
      // IM WebSocket 网关（开发期代理到后端 IM WS 端口 8041）
      '/im/ws': {
        target: 'ws://127.0.0.1:8041',
        ws: true,
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    // 这些依赖只被懒加载路由引用，dev 下首次进入对应页面时才被 Vite 发现，
    // 会触发依赖二次预构建并强制整页刷新（体感：第一次点菜单先卡几秒）。
    // 这里随服务启动一次性预构建完，并开启常用的转换缓存。
    include: [
      'xlsx',
      'quill',
      'sortablejs',
      'video.js',
      'agora-rtc-sdk-ng',
      'agora-rtm-sdk',
      'tsparticles',
      'mockjs',
      'baidu-map-vue3',
      'leaflet.wmts',
      '@geoman-io/leaflet-geoman-free'
    ]
  },
  plugins: [
    vue(),
    vueJsx(),
    commonjs(),
    requireTransform({
      fileRegex: /.ts$|.tsx$|js$|.jsx$|.vue$/
    }),
    vueI18n({
      // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
      // compositionOnly: false,

      // Locale message modules (avoid scanning index.js / non-locale files)
      include: [
        path.resolve(__dirname, './src/lang/en.js'),
        path.resolve(__dirname, './src/lang/zh.js')
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import (reference) "${path.resolve(
            'src/assets/styles/global.less'
          )}";`
        },
        javascriptEnabled: true
      }
    }
  }
})
