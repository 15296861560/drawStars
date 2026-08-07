/** Survey template create dialog fields */
export const dialogFields = [
  {
    fieldName: 'title',
    label: '标题',
    type: 'input',
    placeholder: '请输入模板标题',
    rule: [{ required: true, message: '请输入标题', trigger: 'blur' }]
  },
  {
    fieldName: 'description',
    label: '描述',
    type: 'textarea',
    placeholder: '请输入模板描述',
    attrs: { rows: 3 }
  },
  {
    fieldName: 'category',
    label: '分类',
    type: 'select',
    placeholder: '请选择分类',
    defaultVal: 'general',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '通用', value: 'general' },
      { label: '满意度', value: 'satisfaction' },
      { label: '活动反馈', value: 'feedback' },
      { label: '需求收集', value: 'requirement' },
      { label: '考试测评', value: 'exam' },
      { label: '活动报名', value: 'signup' },
      { label: '人力资源', value: 'hr' },
      { label: '教育培训', value: 'education' },
      { label: '市场调研', value: 'market' }
    ]
  },
  {
    fieldName: 'type',
    label: '类型',
    type: 'select',
    placeholder: '请选择类型',
    defaultVal: 'normal',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '普通', value: 'normal' },
      { label: '考试', value: 'exam' },
      { label: '报名', value: 'signup' }
    ]
  },
  {
    fieldName: 'surveyId',
    label: '来源问卷',
    type: 'select',
    placeholder: '可选，搜索并选择已有问卷',
    config: { valueKey: 'value', labelKey: 'label' },
    attrs: { filterable: true, clearable: true },
    options: []
  }
]
