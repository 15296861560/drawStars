import type { Directive } from 'vue'

/** 在元素上挂载指令内部状态，并在 unmounted 时统一清理 */
export interface DirectiveElement extends HTMLElement {
  __directiveCleanup?: () => void
}

export function setDirectiveCleanup(
  el: DirectiveElement,
  cleanup: () => void
): void {
  el.__directiveCleanup?.()
  el.__directiveCleanup = cleanup
}

export function runDirectiveCleanup(el: DirectiveElement): void {
  el.__directiveCleanup?.()
  el.__directiveCleanup = undefined
}

/**
 * Vue Directive 泛型顺序为 <HostElement, BindingValue>。
 * 此处将业务常用的 BindingValue 放在第一位，Host 默认为 DirectiveElement。
 */
export type AppDirective<
  Value = unknown,
  Host extends DirectiveElement = DirectiveElement
> = Directive<Host, Value>
