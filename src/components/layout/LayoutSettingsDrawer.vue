<template>
  <el-drawer
    v-model="layout.drawerVisible"
    :with-header="false"
    :lock-scroll="false"
    direction="rtl"
    size="300px"
  >
    <div class="setting-drawer-title">
      <h3 class="drawer-title">{{ $t("layoutSettings.navTitle") }}</h3>
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
      <h3 class="drawer-title">{{ $t("layoutSettings.themeStyle") }}</h3>
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
    <div class="drawer-item">
      <span>{{ $t("layoutSettings.themeColor") }}</span>
      <span class="comp-style">
        <el-color-picker
          v-model="layout.theme"
          :predefine="predefineColors"
          @change="onThemePick"
        />
      </span>
    </div>
    <el-divider />

    <h3 class="drawer-title">{{ $t("layoutSettings.systemLayout") }}</h3>
    <div class="drawer-item">
      <span>{{ $t("layoutSettings.tagsView") }}</span>
      <span class="comp-style">
        <el-switch v-model="layout.tagsView" class="drawer-switch" />
      </span>
    </div>
    <div class="drawer-item">
      <span>{{ $t("layoutSettings.tagsIcon") }}</span>
      <span class="comp-style">
        <el-switch
          v-model="layout.tagsIcon"
          :disabled="!layout.tagsView"
          class="drawer-switch"
        />
      </span>
    </div>
    <div class="drawer-item">
      <span>{{ $t("layoutSettings.fixedHeader") }}</span>
      <span class="comp-style">
        <el-switch v-model="layout.fixedHeader" class="drawer-switch" />
      </span>
    </div>
    <div class="drawer-item">
      <span>{{ $t("layoutSettings.sidebarLogo") }}</span>
      <span class="comp-style">
        <el-switch v-model="layout.sidebarLogo" class="drawer-switch" />
      </span>
    </div>
    <div class="drawer-item">
      <span>{{ $t("layoutSettings.dynamicTitle") }}</span>
      <span class="comp-style">
        <el-switch v-model="layout.dynamicTitle" class="drawer-switch" />
      </span>
    </div>
    <div class="drawer-item">
      <span>{{ $t("layoutSettings.footer") }}</span>
      <span class="comp-style">
        <el-switch v-model="layout.footerVisible" class="drawer-switch" />
      </span>
    </div>

    <el-divider />
    <el-button type="primary" plain @click="saveSetting">
      <el-icon class="mr4"><DocumentAdd /></el-icon
      >{{ $t("layoutSettings.save") }}
    </el-button>
    <el-button plain @click="resetSetting">
      <el-icon class="mr4"><Refresh /></el-icon>{{ $t("layoutSettings.reset") }}
    </el-button>
  </el-drawer>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { ElLoading } from "element-plus";
import { Select, DocumentAdd, Refresh } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { layoutSettingsStore } from "@/stores/layout-settings";
import { handleThemeStyle } from "@/utils/theme-style";

const { t } = useI18n();
const layout = layoutSettingsStore();

const predefineColors = [
  "#409EFF",
  "#ff4500",
  "#ff8c00",
  "#ffd700",
  "#90ee90",
  "#00ced1",
  "#1e90ff",
  "#c71585",
];

function setNavType(n: number) {
  layout.navType = n;
}

function onThemePick(val: string | null) {
  if (val) {
    layout.theme = val;
    handleThemeStyle(val);
  }
}

watch(
  () => layout.theme,
  (v) => {
    handleThemeStyle(v);
  },
);

watch(
  () => layout.dynamicTitle,
  () => {
    layout.applyDocumentTitle(
      // 由父级路由同步；此处仅恢复默认或保持
      null,
    );
  },
);

function saveSetting() {
  const loading = ElLoading.service({
    lock: true,
    text: t("layoutSettings.saving"),
    background: "rgba(0,0,0,0.2)",
  });
  layout.persistToLocalStorage();
  setTimeout(() => {
    loading.close();
  }, 400);
}

function resetSetting() {
  const loading = ElLoading.service({
    lock: true,
    text: t("layoutSettings.resetting"),
    background: "rgba(0,0,0,0.2)",
  });
  setTimeout(() => {
    loading.close();
    layout.resetLocalStorageAndReload();
  }, 600);
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
      background: linear-gradient(90deg, #1b2a47 30%, #f0f2f5 30%);
    }
    .thumb-light {
      background: linear-gradient(90deg, #fff 30%, #f0f2f5 30%);
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
    background: #f0f2f5;
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
      background: #1b2a47;
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
      background: #1b2a47;
    }
    b:last-child {
      width: 30%;
      background: #1b2a47;
      position: absolute;
      height: 70%;
      border-radius: 0 0 0 4px;
    }
  }
  .top {
    b:first-child {
      display: block;
      height: 30%;
      background: #1b2a47;
      border-radius: 4px 4px 0 0;
    }
  }
}
</style>
