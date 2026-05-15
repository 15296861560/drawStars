import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { RouteLocationNormalized } from "vue-router";
import {
  LAYOUT_SETTING_STORAGE_KEY,
  layoutDefaults,
} from "@/config/layout-defaults";
import { handleThemeStyle } from "@/utils/theme-style";

export type SideTheme = "theme-dark" | "theme-light";

export type VisitedView = {
  path: string;
  fullPath: string;
  name?: string | symbol | null;
  title: string;
};

function readStoredLayout(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(LAYOUT_SETTING_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const stored = readStoredLayout();

const BASE_TITLE = "Draw Stars";

export const layoutSettingsStore = defineStore("layoutSettings", () => {
  const theme = ref(
    typeof stored?.theme === "string" ? stored.theme : "#409EFF",
  );
  const sideTheme = ref<SideTheme>(
    stored?.sideTheme === "theme-light" ? "theme-light" : layoutDefaults.sideTheme,
  );
  const navType = ref(
    typeof stored?.navType === "number" ? stored.navType : layoutDefaults.navType,
  );
  const tagsView = ref(
    typeof stored?.tagsView === "boolean" ? stored.tagsView : layoutDefaults.tagsView,
  );
  const tagsIcon = ref(
    typeof stored?.tagsIcon === "boolean" ? stored.tagsIcon : layoutDefaults.tagsIcon,
  );
  const fixedHeader = ref(
    typeof stored?.fixedHeader === "boolean"
      ? stored.fixedHeader
      : layoutDefaults.fixedHeader,
  );
  const sidebarLogo = ref(
    typeof stored?.sidebarLogo === "boolean"
      ? stored.sidebarLogo
      : layoutDefaults.sidebarLogo,
  );
  const dynamicTitle = ref(
    typeof stored?.dynamicTitle === "boolean"
      ? stored.dynamicTitle
      : layoutDefaults.dynamicTitle,
  );
  const footerVisible = ref(
    typeof stored?.footerVisible === "boolean"
      ? stored.footerVisible
      : layoutDefaults.footerVisible,
  );

  const visitedViews = ref<VisitedView[]>([]);

  const drawerVisible = ref(false);

  function routeTitle(route: RouteLocationNormalized): string {
    const t = route.meta?.title;
    if (Array.isArray(t)) {
      return t.join(" / ");
    }
    if (typeof t === "string") {
      return t;
    }
    return (route.name && String(route.name)) || route.path;
  }

  function addVisitedView(route: RouteLocationNormalized) {
    if (!tagsView.value) {
      return;
    }
    if (!route.path || route.path === "/login" || route.path === "/") {
      return;
    }
    const title = routeTitle(route);
    const exists = visitedViews.value.some((v) => v.fullPath === route.fullPath);
    if (exists) {
      return;
    }
    visitedViews.value.push({
      path: route.path,
      fullPath: route.fullPath,
      name: route.name,
      title,
    });
    if (visitedViews.value.length > 12) {
      visitedViews.value.shift();
    }
  }

  function removeVisitedView(fullPath: string) {
    const i = visitedViews.value.findIndex((v) => v.fullPath === fullPath);
    if (i !== -1) {
      visitedViews.value.splice(i, 1);
    }
  }

  function applyThemeFromState() {
    handleThemeStyle(theme.value);
  }

  function applyDocumentTitle(route: RouteLocationNormalized | null) {
    if (!dynamicTitle.value || !route) {
      document.title = BASE_TITLE;
      return;
    }
    const piece = routeTitle(route);
    document.title = piece ? `${piece} - ${BASE_TITLE}` : BASE_TITLE;
  }

  function openDrawer() {
    drawerVisible.value = true;
  }

  function closeDrawer() {
    drawerVisible.value = false;
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
      theme: theme.value,
    };
    localStorage.setItem(LAYOUT_SETTING_STORAGE_KEY, JSON.stringify(payload));
  }

  function resetLocalStorageAndReload() {
    localStorage.removeItem(LAYOUT_SETTING_STORAGE_KEY);
    window.location.reload();
  }

  const isDarkAside = computed(() => sideTheme.value === "theme-dark");

  function clearVisitedViews() {
    visitedViews.value = [];
  }

  return {
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
    applyThemeFromState,
    applyDocumentTitle,
    openDrawer,
    closeDrawer,
    persistToLocalStorage,
    resetLocalStorageAndReload,
    routeTitle,
    clearVisitedViews,
  };
});
