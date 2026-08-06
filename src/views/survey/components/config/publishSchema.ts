/** 发布问卷弹窗字段 */
export const publishDialogFields = [
  {
    fieldName: 'publishMode',
    label: '发布时间',
    type: 'radio',
    defaultVal: 'now',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '立即发布', value: 'now' },
      { label: '定时发布', value: 'schedule' }
    ]
  },
  {
    fieldName: 'publishTime',
    label: '定时时间',
    type: 'date',
    placeholder: '选择发布时间',
    attrs: {
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      style: { width: '100%' }
    },
    visibleWhen: (form: Record<string, any>) => form.publishMode === 'schedule'
  },
  {
    fieldName: 'expireTime',
    label: '截止时间',
    type: 'date',
    placeholder: '不限则留空',
    attrs: {
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      clearable: true,
      style: { width: '100%' }
    }
  },
  {
    fieldName: 'maxResponses',
    label: '最大份数',
    type: 'inputNumber',
    defaultVal: 0,
    hint: '0 表示不限',
    attrs: { min: 0 }
  },
  {
    fieldName: 'limitPerUser',
    label: '每人限填',
    type: 'inputNumber',
    defaultVal: 1,
    attrs: { min: 0 }
  },
  {
    fieldName: 'ipLimit',
    label: '同IP限制',
    type: 'inputNumber',
    defaultVal: 0,
    attrs: { min: 0 }
  },
  {
    fieldName: 'deviceLimit',
    label: '设备限制',
    type: 'inputNumber',
    defaultVal: 0,
    attrs: { min: 0 }
  },
  {
    fieldName: 'requireLogin',
    label: '登录要求',
    type: 'select',
    defaultVal: 'none',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '不需要', value: 'none' },
      { label: '选填', value: 'optional' },
      { label: '必填', value: 'required' }
    ]
  },
  {
    fieldName: 'accessPassword',
    label: '访问密码',
    type: 'input',
    placeholder: '可选',
    attrs: { clearable: true, showPassword: true }
  },
  {
    fieldName: 'minDuration',
    label: '最短时长(秒)',
    type: 'inputNumber',
    defaultVal: 0,
    hint: '低于此时长标记为无效',
    attrs: { min: 0 }
  },
  {
    fieldName: 'whitelistText',
    label: '白名单用户ID',
    type: 'textarea',
    placeholder: '可选，逗号分隔用户 ID',
    attrs: { rows: 2 }
  }
]
