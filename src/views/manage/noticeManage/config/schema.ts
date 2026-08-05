export const allFields = [
  {
    fieldName: 'title',
    label: '标题',
    type: 'input',
    width: 200,
    rule: [{ required: true, message: '请输入标题', trigger: 'blur' }]
  },
  {
    fieldName: 'type',
    label: '类型',
    type: 'select',
    width: 120,
    rule: [{ required: true, message: '请选择类型', trigger: 'blur' }],
    placeholder: '请选择',
    config: {
      valueKey: 'value',
      labelKey: 'label'
    },
    options: [
      {
        label: '外链',
        value: 'link'
      },
      {
        label: '富文本',
        value: 'rich'
      },
      {
        label: '其他',
        value: 'other'
      }
    ]
  },
  {
    fieldName: 'status',
    label: '状态',
    type: 'select',
    width: 100,
    config: {
      valueKey: 'value',
      labelKey: 'label'
    },
    options: [
      { label: '已发布', value: 'published' },
      { label: '草稿', value: 'draft' }
    ]
  },
  {
    fieldName: 'icon',
    label: '图标',
    type: 'img',
    width: 80
  },
  {
    fieldName: 'create_time',
    label: '创建时间',
    type: 'date',
    width: 180,
    hideDialog: true
  },
  {
    fieldName: 'update_time',
    label: '修改时间',
    type: 'date',
    width: 180,
    hideDialog: true
  }
]

export const tableFields = allFields
export const dialogFields = [
  {
    fieldName: 'title',
    label: '标题',
    type: 'input',
    width: 200,
    placeholder: '请输入标题',
    rule: [{ required: true, message: '请输入标题', trigger: 'blur' }]
  },
  {
    fieldName: 'type',
    label: '类型',
    type: 'select',
    width: 120,
    rule: [{ required: true, message: '请选择类型', trigger: 'change' }],
    placeholder: '请选择',
    config: {
      valueKey: 'value',
      labelKey: 'label'
    },
    options: [
      { label: '外链', value: 'link' },
      { label: '富文本', value: 'rich' },
      { label: '其他', value: 'other' }
    ]
  },
  {
    fieldName: 'status',
    label: '状态',
    type: 'select',
    width: 120,
    placeholder: '请选择',
    config: {
      valueKey: 'value',
      labelKey: 'label'
    },
    options: [
      { label: '已发布', value: 'published' },
      { label: '草稿', value: 'draft' }
    ]
  },
  {
    fieldName: 'content',
    label: '内容',
    type: 'richText',
    width: 200,
    rule: [{ required: true, message: '请输入内容', trigger: 'blur' }]
  }
]
