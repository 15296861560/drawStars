/** 运营 Banner - 表格字段 */
export const tableFields = [
  { fieldName: 'title', label: '标题', minWidth: 160 },
  { fieldName: 'imageUrl', label: '图片', type: 'img', width: 100 },
  {
    fieldName: 'link',
    label: '跳转',
    type: 'link',
    minWidth: 200
  },
  { fieldName: 'platforms', label: '端', minWidth: 140 },
  {
    fieldName: 'status',
    label: '状态',
    type: 'tag',
    width: 100,
    config: {
      labelKey: 'label',
      tagTypeMap: {
        published: 'success',
        offline: 'info'
      }
    },
    options: [
      { label: '已上线', value: 'published' },
      { label: '已下线', value: 'offline' }
    ]
  },
  { fieldName: 'sort', label: '排序', width: 80 },
  { fieldName: 'roleCodes', label: '角色', minWidth: 140 }
]

/** 运营 Banner - 新增/编辑弹窗字段 */
export const dialogFields = [
  {
    fieldName: 'title',
    label: '标题',
    type: 'input',
    placeholder: '请输入标题',
    rule: [{ required: true, message: '请输入标题', trigger: 'blur' }]
  },
  {
    fieldName: 'imageUrl',
    label: '图片URL',
    type: 'input',
    placeholder: 'https://...'
  },
  {
    fieldName: 'link',
    label: '跳转',
    type: 'input',
    placeholder: 'ds://module/xxx 或 https'
  },
  {
    fieldName: 'platforms',
    label: '平台',
    type: 'input',
    defaultVal: 'android,h5',
    placeholder: 'android,h5'
  },
  {
    fieldName: 'roleCodes',
    label: '角色',
    type: 'input',
    placeholder: '可选'
  },
  {
    fieldName: 'sort',
    label: '排序',
    type: 'inputNumber',
    defaultVal: 0,
    attrs: { min: 0, class: 'w-full' }
  },
  {
    fieldName: 'status',
    label: '状态',
    type: 'select',
    defaultVal: 'published',
    placeholder: '请选择状态',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '已上线', value: 'published' },
      { label: '已下线', value: 'offline' }
    ]
  }
]
