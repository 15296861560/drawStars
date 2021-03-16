import animation from './dragAndDropComponents/animation'
import compose from './dragAndDropComponents/compose'
import contextmenu from './dragAndDropComponents/contextmenu'
import copy from './dragAndDropComponents/copy'
import event from './dragAndDropComponents/event'
import layer from './dragAndDropComponents/layer'
import snapshot from './dragAndDropComponents/snapshot'
import lock from './dragAndDropComponents/lock'
export default {
  ...animation.state,
    ...compose.state,
    ...contextmenu.state,
    ...copy.state,
    ...event.state,
    ...layer.state,
    ...snapshot.state,
    ...lock.state,

    editMode: 'edit', // 编辑器模式 edit preview
    canvasStyleData: { // 页面全局数据
      width: 1200,
      height: 740,
      scale: 100,
    },
    componentData: [], // 画布组件数据
    curComponent: null,
    curComponentIndex: null,
    // 点击画布时是否点中组件，主要用于取消选中组件用。
    // 如果没点中组件，并且在画布空白处弹起鼠标，则取消当前组件的选中状态
    isClickComponent: false,
}
