/** 调试白名单 - 表格字段 */
export const tableFields = [
  { fieldName: 'pattern', label: '匹配串', minWidth: 240 },
  { fieldName: 'remark', label: '备注', minWidth: 220 }
]

/** 调试白名单 - 新增弹窗字段 */
export const dialogFields = [
  {
    fieldName: 'pattern',
    label: '匹配串',
    type: 'input',
    placeholder: '白名单域名或路径片段，如 localhost',
    rule: [{ required: true, message: '请输入匹配串', trigger: 'blur' }]
  },
  {
    fieldName: 'remark',
    label: '备注',
    type: 'textarea',
    placeholder: '可选'
  }
]
