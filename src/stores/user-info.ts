/*
 * @Description: 用户信息 store
 */
import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'

interface UserInfo {
  name: string
  userId: number
  phone: string
  email?: string
  avatar?: string
  accountAlias?: string
  level?: number
  roles?: string[]
}

export const userInfoStore = defineStore(
  'userInfo',
  () => {
    const userInfo = reactive({
      name: '',
      userId: 0,
      phone: '',
      email: '',
      avatar: '',
      accountAlias: '',
      level: 1,
      roles: [] as string[]
    }) as UserInfo
    const token = ref('')
    const getUserInfo = computed(() => userInfo)
    const getUserId = computed(() => userInfo.userId)
    const getUserName = computed(() => userInfo.name || userInfo.accountAlias)
    const getAvatar = computed(() => userInfo.avatar)
    const getToken = computed(() => token)

    function changeUserInfo(newVal: Partial<UserInfo>) {
      if (newVal.name !== undefined) userInfo.name = String(newVal.name || '')
      if (newVal.userId !== undefined) userInfo.userId = Number(newVal.userId) || 0
      if (newVal.phone !== undefined) userInfo.phone = String(newVal.phone || '')
      if (newVal.email !== undefined) userInfo.email = String(newVal.email || '')
      if (newVal.avatar !== undefined)
        userInfo.avatar = String(newVal.avatar || '')
      if (newVal.accountAlias !== undefined)
        userInfo.accountAlias = String(newVal.accountAlias || '')
      if (newVal.level !== undefined) userInfo.level = Number(newVal.level) || 1
      if (newVal.roles !== undefined) {
        userInfo.roles = Array.isArray(newVal.roles) ? newVal.roles : []
      }
    }

    function updateToken(newVal: string) {
      token.value = newVal
    }

    function clearUserInfo() {
      userInfo.name = ''
      userInfo.userId = 0
      userInfo.phone = ''
      userInfo.email = ''
      userInfo.avatar = ''
      userInfo.accountAlias = ''
      userInfo.level = 1
      userInfo.roles = []
      token.value = ''
    }

    return {
      userInfo,
      token,
      getUserInfo,
      getUserId,
      getUserName,
      getAvatar,
      getToken,
      updateToken,
      changeUserInfo,
      clearUserInfo
    }
  },
  {
    persist: {
      storage: sessionStorage
    }
  }
)
