/** 流程分类管理 - 弹窗字段 schema */
export const dialogFields = [
  {
    fieldName: 'name',
    label: '分类名称',
    type: 'input',
    placeholder: '请输入分类名称',
    rule: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
  },
  {
    fieldName: 'code',
    label: '编码',
    type: 'input',
    placeholder: '唯一编码，如 DAILY_REPORT',
    rule: [{ required: true, message: '请输入编码', trigger: 'blur' }]
  },
  {
    fieldName: 'sortOrder',
    label: '排序',
    type: 'inputNumber',
    defaultVal: 0,
    attrs: { min: 0, class: 'w-full' }
  },
  {
    fieldName: 'enabled',
    label: '启用',
    type: 'switch',
    defaultVal: true
  },
  {
    fieldName: 'description',
    label: '描述',
    type: 'textarea',
    placeholder: '请输入描述',
    attrs: { rows: 2 }
  }
]
