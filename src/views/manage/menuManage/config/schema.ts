/** 菜单管理 - 表格字段 */
export const tableFields = [
  {
    fieldName: 'name',
    label: '名称',
    type: 'input',
    minWidth: 180
  },
  {
    fieldName: 'typeLabel',
    label: '类型',
    type: 'text',
    width: 90
  },
  { fieldName: 'path', label: '路径', type: 'input', minWidth: 180 },
  {
    fieldName: 'permission',
    label: '权限码',
    type: 'input',
    minWidth: 180
  },
  { fieldName: 'icon', label: '图标', type: 'input', width: 120 },
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

/** 菜单管理 - 新增/编辑弹窗字段 */
export const dialogFields = [
  {
    fieldName: 'parentId',
    label: '上级ID',
    type: 'inputNumber',
    attrs: { min: 0, class: 'w-full' }
  },
  {
    fieldName: 'name',
    label: '名称',
    type: 'input',
    placeholder: '请输入菜单名称',
    rule: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  },
  {
    fieldName: 'type',
    label: '类型',
    type: 'select',
    defaultVal: 2,
    placeholder: '请选择类型',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '目录', value: 1 },
      { label: '菜单', value: 2 },
      { label: '按钮', value: 3 }
    ],
    rule: [{ required: true, message: '请选择类型', trigger: 'change' }]
  },
  {
    fieldName: 'path',
    label: '路径',
    type: 'input',
    placeholder: '/home/...'
  },
  {
    fieldName: 'component',
    label: '组件',
    type: 'input',
    placeholder: '可选'
  },
  {
    fieldName: 'permission',
    label: '权限码',
    type: 'input',
    placeholder: '如 system:user:create'
  },
  {
    fieldName: 'icon',
    label: '图标',
    type: 'icon',
    placeholder: '下拉选择或上传',
    /** 上传上限 200KB */
    attrs: { maxSizeMB: 0.2 }
  },
  {
    fieldName: 'sort',
    label: '排序',
    type: 'inputNumber',
    defaultVal: 0,
    attrs: { min: 0, class: 'w-full' }
  },
  {
    fieldName: 'visible',
    label: '可见',
    type: 'select',
    defaultVal: 1,
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '是', value: 1 },
      { label: '否', value: 0 }
    ]
  },
  {
    fieldName: 'status',
    label: '状态',
    type: 'select',
    defaultVal: 1,
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '启用', value: 1 },
      { label: '停用', value: 0 }
    ]
  }
]
