/*
 * @Description: RBAC permission store (roles / permissions / menus)
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import menuApi from '@/assets/js/api/menuController/menuApi.js'
import { userInfoStore } from '@/stores/user-info'
import { isSkipLoginMode } from '@/config/skip-login'

export interface MenuNode {
  id: number
  parentId: number
  name: string
  type: number
  path: string | null
  permission: string | null
  icon: string | null
  children?: MenuNode[]
}

export const permissionStore = defineStore(
  'permission',
  () => {
    const roles = ref<string[]>([])
    const permissions = ref<string[]>([])
    const menus = ref<MenuNode[]>([])
    const loaded = ref(false)

    const isSuperAdmin = computed(() => roles.value.includes('super_admin'))

    function hasPermission(code?: string | string[]) {
      if (!code) return true
      if (isSkipLoginMode()) return true
      if (isSuperAdmin.value) return true
      const codes = Array.isArray(code) ? code : [code]
      if (!codes.length) return true
      return codes.some(c => permissions.value.includes(c))
    }

    function setPermission(payload: {
      roles?: string[]
      permissions?: string[]
      menus?: MenuNode[]
    }) {
      if (payload.roles) roles.value = payload.roles
      if (payload.permissions) permissions.value = payload.permissions
      if (payload.menus) menus.value = payload.menus
      loaded.value = true
    }

    function clearPermission() {
      roles.value = []
      permissions.value = []
      menus.value = []
      loaded.value = false
    }

    async function loadPermission() {
      const user = userInfoStore()
      const params: Record<string, number> = {}
      if (user.getUserId) params.userId = Number(user.getUserId)

      const [menuRes, permRes] = await Promise.all([
        menuApi.userMenus(params),
        menuApi.userPermissions(params)
      ])

      const nextMenus = menuRes.status ? menuRes.data || [] : []
      const nextRoles = permRes.status ? permRes.data?.roles || [] : []
      const nextPerms = permRes.status ? permRes.data?.permissions || [] : []

      setPermission({
        menus: nextMenus,
        roles: nextRoles,
        permissions: nextPerms
      })

      if (nextRoles.length) {
        user.changeUserInfo({ roles: nextRoles } as never)
      }

      return { menus: nextMenus, roles: nextRoles, permissions: nextPerms }
    }

    return {
      roles,
      permissions,
      menus,
      loaded,
      isSuperAdmin,
      hasPermission,
      setPermission,
      clearPermission,
      loadPermission
    }
  },
  {
    persist: {
      storage: sessionStorage
    }
  }
)
