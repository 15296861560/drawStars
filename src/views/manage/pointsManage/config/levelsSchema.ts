/** 积分等级配置 - 弹窗字段 schema */
export const dialogFields = [
  {
    fieldName: 'level',
    label: '等级',
    type: 'inputNumber',
    defaultVal: 1,
    attrs: { min: 1, class: 'w-full' },
    rule: [{ required: true, message: '请输入等级', trigger: 'blur' }]
  },
  {
    fieldName: 'name',
    label: '名称',
    type: 'input',
    placeholder: '请输入等级名称',
    rule: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  },
  {
    fieldName: 'icon',
    label: '图标',
    type: 'input',
    placeholder: '如 gold / diamond'
  },
  {
    fieldName: 'requiredPoints',
    label: '所需积分',
    type: 'inputNumber',
    defaultVal: 0,
    attrs: { min: 0, class: 'w-full' },
    rule: [{ required: true, message: '请输入所需积分', trigger: 'blur' }]
  },
  {
    fieldName: 'sortOrder',
    label: '排序',
    type: 'inputNumber',
    defaultVal: 0,
    attrs: { min: 0, class: 'w-full' }
  },
  {
    fieldName: 'benefits',
    label: '权益 JSON',
    type: 'textarea',
    defaultVal: '{}',
    placeholder: '例如 {"discount":0.95,"freeShipping":true}',
    attrs: { rows: 4 },
    rule: [
      {
        validator: (
          _rule: unknown,
          value: string,
          callback: (e?: Error) => void
        ) => {
          try {
            JSON.parse(value || '{}')
            callback()
          } catch {
            callback(new Error('权益 JSON 格式不正确'))
          }
        },
        trigger: 'blur'
      }
    ]
  },
  {
    fieldName: 'description',
    label: '说明',
    type: 'textarea',
    placeholder: '请输入说明',
    attrs: { rows: 2 }
  }
]
