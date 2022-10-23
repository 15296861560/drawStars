/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-13 22:40:08
 * @LastEditors: lgy
 * @LastEditTime: 2022-10-19 23:14:48
 */
import Vue from 'vue'

import copy from './copy'
import longpress from './longpress'
import debounce from './debounce'
import emoji from './emoji'
import lazyload from './lazyload'
import waterMarker from './waterMarker'
import draggable from './draggable'

const directives = {
  copy,
  longpress,
  debounce,
  emoji,
  lazyload,
  waterMarker,
  draggable,
}

Object.keys(directives).forEach((key) => {
  Vue.directive(key, directives[key])
})
