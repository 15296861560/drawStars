<template>
  <el-menu
    class="top-home-menu"
    mode="horizontal"
    :ellipsis="false"
    :default-active="defaultActive"
    background-color="#fff"
    text-color="#303133"
    active-text-color="var(--el-color-primary)"
    @select="handleSelect"
  >
    <el-menu-item index="/home/homepage">
      <el-icon><HomeFilled /></el-icon>
      <span>{{ $t('aside.homePage') }}</span>
    </el-menu-item>
    <template v-if="rbacMenus.length">
      <template v-for="item in rbacMenus" :key="'tm-' + item.id">
        <el-sub-menu
          v-if="item.children && item.children.length"
          :index="'tm-' + item.id"
        >
          <template #title>
            <menu-icon :name="item.icon" />
            <span>{{ item.name }}</span>
          </template>
          <template v-for="child in item.children" :key="'tmc-' + child.id">
            <el-sub-menu
              v-if="child.children && child.children.length"
              :index="'tm-' + child.id"
            >
              <template #title>
                <menu-icon :name="child.icon" />
                <span>{{ child.name }}</span>
              </template>
              <el-menu-item
                v-for="leaf in child.children"
                :key="'tml-' + leaf.id"
                :index="leaf.path || 'tm-' + leaf.id"
              >
                <menu-icon :name="leaf.icon" />
                <span>{{ leaf.name }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item
              v-else
              :index="child.path || 'tm-' + child.id"
            >
              <menu-icon :name="child.icon" />
              <span>{{ child.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>
        <el-menu-item v-else-if="item.path" :index="item.path">
          <menu-icon :name="item.icon" />
          <span>{{ item.name }}</span>
        </el-menu-item>
      </template>
    </template>
    <template v-else>
    <el-sub-menu index="sub-mod">
      <template #title>
        <el-icon><Shop /></el-icon>
        <span>{{ $t('aside.module') }}</span>
      </template>
      <el-menu-item
        v-for="item in pathList"
        :key="item.path"
        :index="item.path"
      >
        {{ $t(item.name) }}
      </el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="sub-logs">
      <template #title>
        <el-icon><Document /></el-icon>
        <span>{{ $t('aside.logManage') }}</span>
      </template>
      <el-menu-item index="/home/logs/operation">{{
        $t('aside.operationLog')
      }}</el-menu-item>
      <el-menu-item index="/home/logs/business">{{
        $t('aside.businessLog')
      }}</el-menu-item>
      <el-menu-item index="/home/logs/api">{{
        $t('aside.apiLog')
      }}</el-menu-item>
      <el-menu-item index="/home/logs/performance">{{
        $t('aside.performanceLog')
      }}</el-menu-item>
      <el-menu-item index="/home/logs/traffic">{{
        $t('aside.trafficStats')
      }}</el-menu-item>
    </el-sub-menu>
    </template>
    <el-sub-menu index="sub-survey">
      <template #title>
        <el-icon><Document /></el-icon>
        <span>{{ $t('aside.surveyManage') }}</span>
      </template>
      <el-menu-item index="/home/survey">{{
        $t('aside.surveyList')
      }}</el-menu-item>
      <el-menu-item index="/home/survey/create">{{
        $t('aside.surveyCreate')
      }}</el-menu-item>
      <el-menu-item index="/home/survey/template">{{
        $t('aside.surveyTemplate')
      }}</el-menu-item>
      <el-menu-item index="/home/survey/question-bank">{{
        $t('aside.surveyQuestionBank')
      }}</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="sub-test">
      <template #title>
        <el-icon><Avatar /></el-icon>
        <span>{{ $t('aside.test') }}</span>
      </template>
      <el-menu-item-group :title="$t('layoutSettings.testPages')">
        <el-menu-item index="outSide"
          ><el-icon><Link /></el-icon
          >{{ $t('aside.externalLinks') }}</el-menu-item
        >
      </el-menu-item-group>
      <el-menu-item-group title="模拟错误">
        <el-menu-item index="undefinedError">未定义错误模拟</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
  </el-menu>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled,
  Shop,
  Avatar,
  Link,
  Document
} from '@element-plus/icons-vue'
import { getHomePathList } from '@/utils/home-path-list'
import { mockUndefinedRouteError } from '@/utils/mock-undefined-error'
import { resolveActiveMenuIndex } from '@/utils/menu-active'
import { permissionStore } from '@/stores/permission'
import { storeToRefs } from 'pinia'
import MenuIcon from '@/components/layout/MenuIcon.vue'

const route = useRoute()
const router = useRouter()

const pathList = ref(getHomePathList())
const defaultActive = ref('/home/homepage')

const perm = permissionStore()
const { menus: permMenus } = storeToRefs(perm)
const rbacMenus = computed(() =>
  (permMenus.value || []).filter(
    (m: { path?: string | null; type?: number }) =>
      m.path !== '/home/homepage' && m.type !== 3
  )
)

/** 可用于高亮匹配的菜单 path 集合 */
const menuIndexPaths = computed(() => {
  const paths = [
    '/home/homepage',
    ...pathList.value.map(i => i.path)
  ]
  const walk = (nodes: any[]) => {
    ;(nodes || []).forEach(n => {
      if (n.path && !n.path.startsWith('tm-')) paths.push(n.path)
      walk(n.children)
    })
  }
  walk(rbacMenus.value)
  return paths
})

const syncActive = () => {
  defaultActive.value = resolveActiveMenuIndex(
    route.path,
    menuIndexPaths.value
  )
}

function handleSelect(path: string) {
  if (!path) {
    return
  }
  switch (path) {
    case 'outSide':
      window.open('https://cn.bing.com/')
      break
    case 'undefinedError':
      mockUndefinedRouteError()
      break
    default:
      router.push({ path })
  }
}

onMounted(() => {
  syncActive()
  if (!perm.loaded && !perm.menus?.length) {
    perm.loadPermission().catch(() => {})
  }
})

watch(() => route.path, syncActive)
</script>

<style scoped lang="less">
.top-home-menu {
  flex: 1;
  min-width: 0;
  border-bottom: none;
}
</style>
