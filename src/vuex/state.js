export default {
  editMode: 'edit', // 编辑器模式 edit read
  canvasStyleData: { // 页面全局数据
    width: 1100,
    height: 740,
  },
  componentData: [], // 画布组件数据
  curComponent: null,
  curComponentIndex: null,
  snapshotData: [], // 编辑器快照数据
  snapshotIndex: -1, // 快照索引
  menuTop: 0, // 右击菜单数据
  menuLeft: 0,
  menuShow: false,
  copyData: null, // 复制粘贴剪切
}
