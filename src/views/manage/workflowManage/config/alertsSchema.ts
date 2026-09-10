/** 告警规则配置 - 弹窗字段 schema */
export const dialogFields = [
  {
    fieldName: 'workflowId',
    label: '关联流程',
    type: 'select',
    placeholder: '不选则对全部流程生效',
    config: { valueKey: 'value', labelKey: 'label' },
    attrs: { clearable: true, class: 'w-full' },
    options: [] as { label: string; value: number }[]
  },
  {
    fieldName: 'ruleType',
    label: '规则类型',
    type: 'select',
    placeholder: '请选择规则类型',
    defaultVal: 'FAILURE_RATE',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '失败率(%)', value: 'FAILURE_RATE' },
      { label: '失败次数', value: 'FAILURE_COUNT' }
    ],
    rule: [{ required: true, message: '请选择规则类型', trigger: 'change' }]
  },
  {
    fieldName: 'threshold',
    label: '阈值',
    type: 'inputNumber',
    defaultVal: 10,
    attrs: { min: 0, class: 'w-full' },
    rule: [{ required: true, message: '请输入阈值', trigger: 'blur' }]
  },
  {
    fieldName: 'windowMinutes',
    label: '统计窗口(分钟)',
    type: 'inputNumber',
    defaultVal: 30,
    attrs: { min: 1, class: 'w-full' }
  },
  {
    fieldName: 'notifyChannels',
    label: '通知方式',
    type: 'select',
    placeholder: '请选择通知方式',
    defaultVal: ['EMAIL'],
    config: { valueKey: 'value', labelKey: 'label' },
    attrs: { multiple: true, class: 'w-full' },
    options: [
      { label: '邮件', value: 'EMAIL' },
      { label: '站内信', value: 'MESSAGE' }
    ],
    rule: [{ required: true, message: '请选择通知方式', trigger: 'change' }]
  },
  {
    fieldName: 'enabled',
    label: '启用',
    type: 'switch',
    defaultVal: true
  }
]
