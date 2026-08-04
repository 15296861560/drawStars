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
            <span>{{ item.name }}</span>
          </template>
          <template v-for="child in item.children" :key="'tmc-' + child.id">
            <el-sub-menu
              v-if="child.children && child.children.length"
              :index="'tm-' + child.id"
            >
              <template #title>{{ child.name }}</template>
              <el-menu-item
                v-for="leaf in child.children"
                :key="'tml-' + leaf.id"
                :index="leaf.path || 'tm-' + leaf.id"
                >{{ leaf.name }}</el-menu-item
              >
            </el-sub-menu>
            <el-menu-item
              v-else
              :index="child.path || 'tm-' + child.id"
              >{{ child.name }}</el-menu-item
            >
          </template>
        </el-sub-menu>
        <el-menu-item v-else-if="item.path" :index="item.path">
          {{ item.name }}
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
    <el-sub-menu index="sub-test">
      <template #title>
        <el-icon><Avatar /></el-icon>
        <span>{{ $t('aside.test') }}</span>
      </template>
      <el-menu-item-group :title="$t('layoutSettings.permExample')">
        <el-menu-item v-if="userData.level > 1" index="/home/test1">{{
          $t('aside.moreThanOne')
        }}</el-menu-item>
        <el-menu-item v-if="userData.level > 2" index="/home/test2">{{
          $t('aside.moreThanTwo')
        }}</el-menu-item>
      </el-menu-item-group>
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
    <el-sub-menu index="sub-pow">
      <template #title>
        <el-icon><User /></el-icon>
        <span>{{ $t('aside.power') }}</span>
      </template>
      <el-menu-item index="levelDown"
        ><el-icon><CaretBottom /></el-icon
        >{{ $t('aside.levelDown') }}</el-menu-item
      >
      <el-menu-item index="levelUp"
        ><el-icon><CaretTop /></el-icon>{{ $t('aside.levelUp') }}</el-menu-item
      >
      <el-menu-item disabled
        ><el-icon><DCaret /></el-icon
        >{{ $t('aside.curLevel') + userData.level }}</el-menu-item
      >
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
  User,
  CaretBottom,
  CaretTop,
  DCaret,
  Document
} from '@element-plus/icons-vue'
import { getHomePathList } from '@/utils/home-path-list'
import { mockUndefinedRouteError } from '@/utils/mock-undefined-error'
import { permissionStore } from '@/stores/permission'
import { storeToRefs } from 'pinia'
import Test1 from '@/views/pages/test1.vue'
import Test2 from '@/views/pages/test2.vue'

const route = useRoute()
const router = useRouter()

const pathList = ref(getHomePathList())
const defaultActive = ref('/home/homepage')
const userData = ref({ level: 3 })

const perm = permissionStore()
const { menus: permMenus } = storeToRefs(perm)
const rbacMenus = computed(() =>
  (permMenus.value || []).filter(
    (m: { path?: string | null; type?: number }) =>
      m.path !== '/home/homepage' && m.type !== 3
  )
)

function levelDown() {
  if (userData.value.level > 1) {
    userData.value.level--
  }
  if (userData.value.level < 3 && router.hasRoute('测试页2')) {
    router.removeRoute('测试页2')
  }
  if (userData.value.level < 2 && router.hasRoute('测试页1')) {
    router.removeRoute('测试页1')
  }
}

function levelUp() {
  if (userData.value.level < 9) {
    userData.value.level++
  }
  if (userData.value.level > 1 && !router.hasRoute('测试页1')) {
    router.addRoute('home', {
      path: '/home/test1',
      name: '测试页1',
      component: Test1,
      meta: { title: ['首页', '测试页1'], keepAlive: true }
    })
  }
  if (userData.value.level > 2 && !router.hasRoute('测试页2')) {
    router.addRoute('home', {
      path: '/home/test2',
      name: '测试页2',
      component: Test2,
      meta: { title: ['首页', '测试页2'], keepAlive: true }
    })
  }
}

function handleSelect(path: string) {
  if (!path) {
    return
  }
  switch (path) {
    case 'levelDown':
      levelDown()
      break
    case 'levelUp':
      levelUp()
      break
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
  defaultActive.value = route.fullPath
  if (!perm.loaded && !perm.menus?.length) {
    perm.loadPermission().catch(() => {})
  }
  if (userData.value.level > 1 && !router.hasRoute('测试页1')) {
    router.addRoute('home', {
      path: '/home/test1',
      name: '测试页1',
      component: Test1,
      meta: { title: ['首页', '测试页1'], keepAlive: true }
    })
  }
  if (userData.value.level > 2 && !router.hasRoute('测试页2')) {
    router.addRoute('home', {
      path: '/home/test2',
      name: '测试页2',
      component: Test2,
      meta: { title: ['首页', '测试页2'], keepAlive: true }
    })
  }
})

watch(
  () => route.fullPath,
  p => {
    defaultActive.value = p
  }
)
</script>

<style scoped lang="less">
.top-home-menu {
  flex: 1;
  min-width: 0;
  border-bottom: none;
}
</style>
