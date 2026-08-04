export const allFields = [
  {
    fieldName: 'name',
    label: '名称',
    type: 'input',
    minWidth: 180,
    rule: [
      { required: true, message: '请输入名称', trigger: 'blur' }
    ]
  },
  {
    fieldName: 'typeLabel',
    label: '类型',
    type: 'text',
    width: 90,
    hideDialog: true
  },
  { fieldName: 'path', label: '路径', type: 'input', minWidth: 180 },
  {
    fieldName: 'permission',
    label: '权限码',
    type: 'input',
    minWidth: 180
  },
  { fieldName: 'icon', label: '图标', type: 'input', width: 100 },
  { fieldName: 'sort', label: '排序', type: 'input', width: 70 },
  {
    fieldName: 'visible',
    label: '可见',
    type: 'select',
    width: 70,
    options: [
      { label: '是', value: 1 },
      { label: '否', value: 0 }
    ],
    config: { valueKey: 'value', labelKey: 'label' }
  },
  {
    fieldName: 'status',
    label: '状态',
    type: 'select',
    width: 70,
    options: [
      { label: '启用', value: 1 },
      { label: '停用', value: 0 }
    ],
    config: { valueKey: 'value', labelKey: 'label' }
  }
]

export const tableFields = allFields.filter(s => !s.hideTable)
export const dialogFields = allFields.filter(s => !s.hideDialog)
