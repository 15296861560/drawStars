/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 21:55:05
 * @LastEditors: lgy
 * @LastEditTime: 2023-07-22 23:08:29
 */
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vueI18n from '@intlify/vite-plugin-vue-i18n'

import requireTransform from "vite-plugin-require-transform";

import path from "node:path";


// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8010",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    requireTransform({
      fileRegex: /.ts$|.tsx$|js$|.jsx$|.vue$/,
    }),
    vueI18n({
      // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
      // compositionOnly: false,

      // you need to set i18n resource including paths !
      include: path.resolve(__dirname, './src/lang/languange/**')
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import (reference) "${path.resolve(
            "src/assets/styles/global.less"
          )}";`,
        },
        javascriptEnabled: true,
      },
    },
  },
});
