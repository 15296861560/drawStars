import Vue from 'vue'
import animation from './dragAndDropComponents/animation'
import compose from './dragAndDropComponents/compose'
import contextmenu from './dragAndDropComponents/contextmenu'
import copy from './dragAndDropComponents/copy'
import event from './dragAndDropComponents/event'
import layer from './dragAndDropComponents/layer'
import snapshot from './dragAndDropComponents/snapshot'
import lock from './dragAndDropComponents/lock'


export default {

  ...animation.mutations,
  ...compose.mutations,
  ...contextmenu.mutations,
  ...copy.mutations,
  ...event.mutations,
  ...layer.mutations,
  ...snapshot.mutations,
  ...lock.mutations,

  setClickComponentStatus(state, status) {
    state.isClickComponent = status
  },

  setEditMode(state, mode) {
    state.editMode = mode
  },

  setCanvasStyle(state, style) {
    state.canvasStyleData = style
  },

  setCurComponent(state, {
    component,
    index
  }) {
    state.curComponent = component
    state.curComponentIndex = index
  },

  setShapeStyle({
    curComponent
  }, {
    top,
    left,
    width,
    height,
    rotate
  }) {
    if (top) curComponent.style.top = top
    if (left) curComponent.style.left = left
    if (width) curComponent.style.width = width
    if (height) curComponent.style.height = height
    if (rotate) curComponent.style.rotate = rotate
  },

  setShapeSingleStyle({
    curComponent
  }, {
    key,
    value
  }) {
    curComponent.style[key] = value
  },

  setComponentData(state, componentData = []) {
    Vue.set(state, 'componentData', componentData)
  },

  addComponent(state, {
    component,
    index
  }) {
    if (index !== undefined) {
      state.componentData.splice(index, 0, component)
    } else {
      state.componentData.push(component)
    }
  },

  deleteComponent(state, index) {
    if (index === undefined) {
      index = state.curComponentIndex
    }

    state.componentData.splice(index, 1)
  },

}
