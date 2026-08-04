import type { DirectiveBinding } from 'vue'
import type { AppDirective } from './types'
import { permissionStore } from '@/stores/permission'

export type PermissionBinding =
  | string
  | string[]
  | {
      role?: string
      allowed?: string | string[]
      /** @deprecated demo shape — prefer permission string */
    }

function resolveCodes(value: PermissionBinding): string[] | null {
  if (value == null || value === '') return null
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.map(String)

  // Legacy demo: { role, allowed } — keep working for lab page
  if (value && typeof value === 'object' && 'allowed' in value) {
    const allowed = Array.isArray(value.allowed)
      ? value.allowed
      : value.allowed
        ? [value.allowed]
        : []
    const role = value.role
    if (role == null) return allowed.map(String)
    return allowed.map(String).includes(String(role)) ? ['*'] : []
  }
  return null
}

function check(value: PermissionBinding): boolean {
  const codes = resolveCodes(value)
  if (codes === null) return true
  if (codes.includes('*')) return true
  if (codes.length === 0) return false
  const store = permissionStore()
  return store.hasPermission(codes)
}

interface PermissionElement extends HTMLElement {
  __permissionPrevDisplay?: string
}

function applyVisibility(el: PermissionElement, visible: boolean): void {
  if (visible) {
    el.style.display = el.__permissionPrevDisplay ?? ''
    el.removeAttribute('aria-hidden')
  } else {
    if (el.__permissionPrevDisplay === undefined) {
      el.__permissionPrevDisplay = el.style.display
    }
    el.style.display = 'none'
    el.setAttribute('aria-hidden', 'true')
  }
}

const permission: AppDirective<PermissionBinding> = {
  mounted(el: PermissionElement, binding: DirectiveBinding<PermissionBinding>) {
    applyVisibility(el, check(binding.value))
  },
  updated(el: PermissionElement, binding: DirectiveBinding<PermissionBinding>) {
    applyVisibility(el, check(binding.value))
  }
}

export default permission
