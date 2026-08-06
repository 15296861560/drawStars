import { listQuestionTypes } from '../../types'

const typeOptions = listQuestionTypes().map(t => ({
  label: t.label,
  value: t.type
}))

/** 题库新增/编辑弹窗字段 */
export const questionBankDialogFields = [
  {
    fieldName: 'type',
    label: '题型',
    type: 'select',
    defaultVal: 'radio',
    disableOnEdit: true,
    config: { valueKey: 'value', labelKey: 'label' },
    options: typeOptions,
    rule: [{ required: true, message: '请选择题型', trigger: 'change' }]
  },
  {
    fieldName: 'title',
    label: '题干',
    type: 'textarea',
    placeholder: '请输入题干',
    attrs: { rows: 2 },
    rule: [{ required: true, message: '请填写题干', trigger: 'blur' }]
  },
  {
    fieldName: 'description',
    label: '说明',
    type: 'textarea',
    attrs: { rows: 2 }
  },
  {
    fieldName: 'tagsText',
    label: '标签',
    type: 'input',
    placeholder: '逗号分隔'
  },
  {
    fieldName: 'optionsJson',
    label: '选项JSON',
    type: 'textarea',
    placeholder: '可选，如 [{"content":"A"},{"content":"B"}]',
    attrs: { rows: 4 },
    defaultVal: '[{"content":"选项A"},{"content":"选项B"}]'
  }
]
