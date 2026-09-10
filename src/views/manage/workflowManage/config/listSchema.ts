import type { Field } from '@/types/global'

/** 流程管理 - 新建流程弹窗字段 schema（分类 options 由页面动态填充） */
export const dialogFields: Field[] = [
  {
    fieldName: 'name',
    label: '流程名称',
    type: 'input',
    placeholder: '请输入流程名称',
    rule: [{ required: true, message: '请输入流程名称', trigger: 'blur' }]
  },
  {
    fieldName: 'description',
    label: '流程描述',
    type: 'textarea',
    placeholder: '请输入流程描述',
    attrs: { rows: 2 }
  },
  {
    fieldName: 'categoryId',
    label: '所属分类',
    type: 'select',
    placeholder: '请选择分类',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [] as Array<{ label: string; value: number }>,
    rule: [{ required: true, message: '请选择分类', trigger: 'change' }]
  },
  {
    fieldName: 'tags',
    label: '标签',
    type: 'input',
    placeholder: '多个标签用英文逗号分隔，如：日报,定时'
  }
]
