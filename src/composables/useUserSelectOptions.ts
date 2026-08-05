import { ref, shallowRef } from 'vue'
import userManageApi from '@/assets/js/api/userManageController/userManageApi.js'

export type UserSelectItem = {
  id: number | string
  name: string
  phone: string
  accountAlias: string
  email: string
  /** 下拉展示文案 */
  label: string
  /** 与日志 username/operator 对齐的展示名 */
  displayName: string
}

type CacheState = {
  loaded: boolean
  promise: Promise<UserSelectItem[]> | null
  users: UserSelectItem[]
}

/** 模块级缓存：多处引用只请求一次用户列表 */
const cache: CacheState = {
  loaded: false,
  promise: null,
  users: []
}

function normalizeUser(raw: Record<string, any>): UserSelectItem {
  const id = raw.id ?? raw.userId ?? ''
  const name = String(raw.name || '').trim()
  const phone = String(raw.phone || '').trim()
  const accountAlias = String(raw.accountAlias || '').trim()
  const email = String(raw.email || '').trim()
  const displayName = name || accountAlias || phone || `用户#${id}`
  const parts = [displayName]
  if (phone && phone !== displayName) parts.push(phone)
  if (accountAlias && accountAlias !== displayName && accountAlias !== phone) {
    parts.push(accountAlias)
  }
  return {
    id,
    name,
    phone,
    accountAlias,
    email,
    displayName,
    label: `${parts.join(' / ')} (ID:${id})`
  }
}

function matchUser(user: UserSelectItem, keyword: string) {
  const q = keyword.trim().toLowerCase()
  if (!q) return true
  return (
    user.label.toLowerCase().includes(q) ||
    user.displayName.toLowerCase().includes(q) ||
    user.name.toLowerCase().includes(q) ||
    user.phone.toLowerCase().includes(q) ||
    user.accountAlias.toLowerCase().includes(q) ||
    user.email.toLowerCase().includes(q) ||
    String(user.id).includes(q)
  )
}

async function fetchAllUsers(): Promise<UserSelectItem[]> {
  if (cache.loaded) return cache.users
  if (cache.promise) return cache.promise

  cache.promise = (async () => {
    const res = await userManageApi.queryList({
      curPage: 1,
      pageSize: 500
    })
    const list = res?.status ? res.data?.list || [] : []
    cache.users = (list as Record<string, any>[]).map(normalizeUser)
    cache.loaded = true
    return cache.users
  })().finally(() => {
    cache.promise = null
  })

  return cache.promise
}

/** 强制刷新缓存（用户管理增删改后可调用） */
export function invalidateUserSelectCache() {
  cache.loaded = false
  cache.promise = null
  cache.users = []
}

/**
 * 用户下拉选项（共享缓存 + 本地模糊过滤，避免重复打接口）
 */
export function useUserSelectOptions() {
  const options = shallowRef<UserSelectItem[]>([])
  const loading = ref(false)
  const keyword = ref('')

  async function ensureLoaded() {
    if (cache.loaded) {
      options.value = cache.users.filter(u => matchUser(u, keyword.value))
      return cache.users
    }
    loading.value = true
    try {
      const users = await fetchAllUsers()
      options.value = users.filter(u => matchUser(u, keyword.value))
      return users
    } finally {
      loading.value = false
    }
  }

  function filterMethod(query: string) {
    keyword.value = query || ''
    if (!cache.loaded) {
      void ensureLoaded()
      return
    }
    options.value = cache.users.filter(u => matchUser(u, keyword.value))
  }

  return {
    options,
    loading,
    keyword,
    ensureLoaded,
    filterMethod
  }
}
