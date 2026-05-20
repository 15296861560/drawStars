import type { DirectiveBinding } from 'vue'
import type { AppDirective } from './types'

export interface PermissionValue {
  role: string
  allowed: string | string[]
}

function normalizeAllowed(allowed: string | string[]): string[] {
  return Array.isArray(allowed) ? allowed : [allowed]
}

function hasPermission(value: PermissionValue): boolean {
  return normalizeAllowed(value.allowed).includes(value.role)
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

const permission: AppDirective<PermissionValue> = {
  mounted(el: PermissionElement, binding: DirectiveBinding<PermissionValue>) {
    applyVisibility(el, hasPermission(binding.value))
  },
  updated(el: PermissionElement, binding: DirectiveBinding<PermissionValue>) {
    applyVisibility(el, hasPermission(binding.value))
  }
}

export default permission
