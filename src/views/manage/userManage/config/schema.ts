export const allFields = [
  { fieldName: 'id', label: 'ID', type: 'text', width: 80, hideDialog: true },
  { fieldName: 'name', label: '姓名', type: 'input', width: 120 },
  { fieldName: 'phone', label: '手机', type: 'input', width: 130 },
  { fieldName: 'email', label: '邮箱', type: 'input', minWidth: 160 },
  {
    fieldName: 'accountAlias',
    label: '账号别名',
    type: 'input',
    width: 120
  },
  {
    fieldName: 'status',
    label: '状态',
    type: 'select',
    width: 90,
    options: [
      { label: '正常', value: 'active' },
      { label: '停用', value: 'deactivated' }
    ],
    config: { valueKey: 'value', labelKey: 'label' }
  },
  {
    fieldName: 'level',
    label: '等级',
    type: 'text',
    width: 70,
    hideDialog: true
  },
  {
    fieldName: 'roleNames',
    label: '角色',
    type: 'text',
    minWidth: 160,
    hideDialog: true
  }
]

export const tableFields = allFields.filter(s => !s.hideTable)
export const dialogFields = allFields.filter(s => !s.hideDialog)
