/**
 * Shim: @intlify/vite-plugin-vue-i18n ships types under lib/index.d.ts but its
 * package.json "exports" lacks a "types" condition, so TS (bundler resolution)
 * may not resolve typings. This module keeps options accurate and returns
 * Vite's PluginOption so `enforce` stays compatible with defineConfig.plugins.
 */
declare module "@intlify/vite-plugin-vue-i18n" {
  import type { PluginOption } from "vite";

  export interface VitePluginVueI18nOptions {
    forceStringify?: boolean;
    runtimeOnly?: boolean;
    compositionOnly?: boolean;
    fullInstall?: boolean;
    include?: string | string[];
    defaultSFCLang?: "json" | "json5" | "yml" | "yaml";
    globalSFCScope?: boolean;
    useVueI18nImportName?: boolean;
  }

  export default function vueI18n(
    options?: VitePluginVueI18nOptions,
  ): PluginOption;
}
