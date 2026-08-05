import { pointsSourceOptions, pointsTypeOptions } from '@/utils/points-labels'

/** 积分规则配置 - 弹窗字段 schema */
export const dialogFields = [
  {
    fieldName: 'name',
    label: '规则名称',
    type: 'input',
    placeholder: '请输入规则名称',
    rule: [{ required: true, message: '请输入规则名称', trigger: 'blur' }]
  },
  {
    fieldName: 'code',
    label: '编码',
    type: 'input',
    placeholder: '唯一编码，如 DAILY_CHECK_IN',
    disableOnEdit: true,
    rule: [{ required: true, message: '请输入编码', trigger: 'blur' }]
  },
  {
    fieldName: 'source',
    label: '来源',
    type: 'select',
    placeholder: '请选择来源',
    defaultVal: 'CHECK_IN',
    config: { valueKey: 'value', labelKey: 'label' },
    options: pointsSourceOptions,
    rule: [{ required: true, message: '请选择来源', trigger: 'change' }]
  },
  {
    fieldName: 'pointsType',
    label: '积分类型',
    type: 'select',
    defaultVal: 'GENERAL',
    config: { valueKey: 'value', labelKey: 'label' },
    options: pointsTypeOptions
  },
  {
    fieldName: 'calcMethod',
    label: '计算方式',
    type: 'select',
    defaultVal: 'FIXED',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '固定值', value: 'FIXED' },
      { label: '比例', value: 'RATIO' },
      { label: '公式', value: 'FORMULA' }
    ]
  },
  {
    fieldName: 'pointsValue',
    label: '积分值',
    type: 'inputNumber',
    defaultVal: 10,
    attrs: { min: 0, step: 0.01, precision: 4, class: 'w-full' },
    rule: [{ required: true, message: '请输入积分值', trigger: 'blur' }]
  },
  {
    fieldName: 'dailyLimit',
    label: '每日上限',
    type: 'inputNumber',
    defaultVal: 0,
    attrs: { min: 0, class: 'w-full' }
  },
  {
    fieldName: 'monthlyLimit',
    label: '每月上限',
    type: 'inputNumber',
    defaultVal: 0,
    attrs: { min: 0, class: 'w-full' }
  },
  {
    fieldName: 'singleLimit',
    label: '单次上限',
    type: 'inputNumber',
    defaultVal: 0,
    attrs: { min: 0, class: 'w-full' }
  },
  {
    fieldName: 'validDays',
    label: '有效天数',
    type: 'inputNumber',
    defaultVal: 365,
    attrs: { min: 0, class: 'w-full' }
  },
  {
    fieldName: 'priority',
    label: '优先级',
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
    label: '说明',
    type: 'textarea',
    placeholder: '请输入说明',
    attrs: { rows: 2 }
  }
]
