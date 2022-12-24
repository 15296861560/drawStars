/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-13 22:40:08
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-20 23:29:47
 */

import copy from './copy'
import longpress from './longpress'
import debounce from './debounce'
import emoji from './emoji'
import lazyload from './lazyload'
import waterMarker from './waterMarker'
import draggable from './draggable'

export default (app) => {

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
    app.directive(key, directives[key])
  })

}