/** 壳版本发布 - 表格字段 */
export const tableFields = [
  {
    fieldName: 'platform',
    label: '平台',
    type: 'select',
    width: 100,
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: 'Android', value: 'android' },
      { label: 'iOS', value: 'ios' },
      { label: 'H5', value: 'h5' }
    ]
  },
  { fieldName: 'channel', label: '渠道', width: 110 },
  { fieldName: 'version', label: '版本', width: 100 },
  { fieldName: 'buildNumber', label: '构建号', width: 90 },
  {
    fieldName: 'forceUpdate',
    label: '强制更新',
    type: 'select',
    width: 90,
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '是', value: true },
      { label: '否', value: false }
    ]
  },
  { fieldName: 'packageUrl', label: '包地址', minWidth: 220 },
  { fieldName: 'releaseNotes', label: '发版说明', minWidth: 160 }
]

/** 壳版本发布 - 新增弹窗字段 */
export const dialogFields = [
  {
    fieldName: 'platform',
    label: '平台',
    type: 'select',
    defaultVal: 'android',
    placeholder: '请选择平台',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: 'Android', value: 'android' },
      { label: 'iOS', value: 'ios' },
      { label: 'H5', value: 'h5' }
    ],
    rule: [{ required: true, message: '请选择平台', trigger: 'change' }]
  },
  {
    fieldName: 'channel',
    label: '渠道',
    type: 'input',
    defaultVal: 'default',
    placeholder: 'default'
  },
  {
    fieldName: 'version',
    label: '版本号',
    type: 'input',
    placeholder: '1.0.1',
    rule: [{ required: true, message: '请输入版本号', trigger: 'blur' }]
  },
  {
    fieldName: 'buildNumber',
    label: '构建号',
    type: 'input',
    placeholder: '可选'
  },
  {
    fieldName: 'packageUrl',
    label: '包地址',
    type: 'input',
    placeholder: 'https://...'
  },
  {
    fieldName: 'forceUpdate',
    label: '强制更新',
    type: 'switch',
    defaultVal: false
  },
  { fieldName: 'releaseNotes', label: '发版说明', type: 'textarea' }
]
