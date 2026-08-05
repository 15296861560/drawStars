<template>
  <div>
    <el-row>
      <el-col>
        <el-menu
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          @select="handleSelect"
          :background-color="menuBg"
          :text-color="menuText"
          :active-text-color="menuActive"
          :collapse="websiteInfo.isCollapse"
          :unique-opened="true"
          :router="false"
          :default-active="defaultActive"
          ref="asideMenu"
        >
          <el-menu-item index="collapse" class="m-text-center">
            <el-icon v-show="websiteInfo.isCollapse"><ArrowRight /></el-icon>
            <template #title>
              <span v-if="layout.sidebarLogo">Draw Starts</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/home/homepage">
            <el-icon><HomeFilled /></el-icon>
            <template #title>
              <span>{{ $t('aside.homePage') }}</span>
            </template>
          </el-menu-item>

          <!-- RBAC 动态菜单优先 -->
          <template v-if="rbacMenus.length">
            <template v-for="item in rbacMenus" :key="'rbac-' + item.id">
              <el-sub-menu
                v-if="item.children && item.children.length"
                :index="'rbac-' + item.id"
              >
                <template #title>
                  <menu-icon :name="item.icon" />
                  <span>{{ item.name }}</span>
                </template>
                <template
                  v-for="child in item.children"
                  :key="'rbac-c-' + child.id"
                >
                  <el-sub-menu
                    v-if="child.children && child.children.length"
                    :index="'rbac-' + child.id"
                  >
                    <template #title>
                      <menu-icon :name="child.icon" />
                      <span>{{ child.name }}</span>
                    </template>
                    <el-menu-item
                      v-for="leaf in child.children"
                      :key="'rbac-l-' + leaf.id"
                      :index="leaf.path || 'rbac-' + leaf.id"
                    >
                      <menu-icon :name="leaf.icon" />
                      <template #title>{{ leaf.name }}</template>
                    </el-menu-item>
                  </el-sub-menu>
                  <el-menu-item
                    v-else
                    :index="child.path || 'rbac-' + child.id"
                  >
                    <menu-icon :name="child.icon" />
                    <template #title>{{ child.name }}</template>
                  </el-menu-item>
                </template>
              </el-sub-menu>
              <el-menu-item
                v-else-if="item.path"
                :index="item.path"
              >
                <menu-icon :name="item.icon" />
                <template #title>{{ item.name }}</template>
              </el-menu-item>
            </template>
          </template>

          <template v-else>
          <el-sub-menu index="1">
            <template #title>
              <el-icon><Shop /></el-icon>
              <span>{{ $t('aside.module') }}</span>
            </template>
            <el-menu-item
              :index="item.path"
              v-for="item in pathList"
              :key="item.path"
              >{{ $t(item.name) }}</el-menu-item
            >
          </el-sub-menu>
          <el-sub-menu index="logs">
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
          <el-sub-menu index="2">
            <template #title>
              <el-icon><Avatar /></el-icon>
              <span>{{ $t('aside.test') }}</span>
            </template>
            <el-menu-item-group title="测试页面">
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
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getHomePathList } from '@/utils/home-path-list'
import { layoutSettingsStore } from '@/stores/layout-settings'
import { permissionStore } from '@/stores/permission'
import { mockUndefinedRouteError } from '@/utils/mock-undefined-error'
import MenuIcon from '@/components/layout/MenuIcon.vue'
export default {
  name: 'AsideList',
  components: { MenuIcon },
  inject: ['websiteInfo'],
  data() {
    return {
      defaultActive: '/home/homepage',
      pathList: []
    }
  },
  computed: {
    layout() {
      return layoutSettingsStore()
    },
    rbacMenus() {
      const store = permissionStore()
      return (store.menus || []).filter(
        m => m.path !== '/home/homepage' && m.type !== 3
      )
    },
    menuBg() {
      return this.layout.isDarkAside ? '#282c34' : '#ffffff'
    },
    menuText() {
      return this.layout.isDarkAside ? '#fff' : '#303133'
    },
    menuActive() {
      return this.layout.isDarkAside ? '#ffd04b' : 'var(--el-color-primary)'
    }
  },
  methods: {
    handleSelect(path) {
      if (!path) {
        return
      }
      switch (path) {
        case 'outSide':
          this.toOutSide()
          break
        case 'undefinedError':
          mockUndefinedRouteError()
          break
        case 'collapse':
          this.collapse()
          break

        default:
          this.$router.push({
            path
          })
          break
      }
    },
    handleOpen(_key, _keyPath) {
      // 展开
    },
    handleClose(_key, _keyPath) {
      // 收起
    },

    toOutSide() {
      window.open('https://cn.bing.com/')
    },
    // 收缩侧边栏
    collapse() {
      if (!this.websiteInfo.isPC) {
        this.websiteInfo.isCollapse = true
      } else {
        this.websiteInfo.isCollapse = !this.websiteInfo.isCollapse
      }
    },
    // 获取主页列表数据
    getHomePages() {
      this.pathList = getHomePathList()
      this.defaultActive = this.$route.fullPath
    }
  },
  mounted() {
    this.getHomePages()
    const perm = permissionStore()
    if (!perm.loaded && !perm.menus?.length) {
      perm.loadPermission().catch(() => {})
    }
  }
}
</script>

<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
  height: 100vh;
  overflow: hidden auto;
}
</style>
