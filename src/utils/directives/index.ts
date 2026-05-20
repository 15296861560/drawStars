import type { App, Directive } from 'vue'
import type { DirectiveElement } from './types'

import copy from './copy'
import longpress from './longpress'
import debounce from './debounce'
import throttle from './throttle'
import emoji from './emoji'
import lazyload from './lazyload'
import waterMarker from './waterMarker'
import draggable from './draggable'
import clickOutside from './clickOutside'
import trim from './trim'
import focus from './focus'
import permission from './permission'
import loading from './loading'

export const directives = {
  copy,
  longpress,
  debounce,
  throttle,
  emoji,
  lazyload,
  waterMarker,
  draggable,
  clickOutside,
  trim,
  focus,
  permission,
  loading
} as const

export type DirectiveName = keyof typeof directives

export default function installDirectives(app: App): void {
  ;(
    Object.entries(directives) as [
      DirectiveName,
      Directive<DirectiveElement, unknown>
    ][]
  ).forEach(([name, directive]) => {
    app.directive(name, directive)
  })
}

export {
  copy,
  longpress,
  debounce,
  throttle,
  emoji,
  lazyload,
  waterMarker,
  draggable,
  clickOutside,
  trim,
  focus,
  permission,
  loading
}
