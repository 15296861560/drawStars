export const allFields = [
  {
    fieldName: 'id',
    label: '角色编号',
    type: 'text',
    width: 100,
    align: 'center',
    hideTable: true,
    hideDialog: true
  },
  {
    fieldName: 'name',
    label: '角色名称',
    type: 'input',
    minWidth: 140,
    rule: [
      {
        required: true,
        message: '请输入角色名称',
        trigger: 'blur'
      }
    ]
  },
  {
    fieldName: 'code',
    label: '权限字符',
    type: 'input',
    minWidth: 140,
    rule: [{ required: true, message: '请输入权限字符', trigger: 'blur' }]
  },
  {
    fieldName: 'sort',
    label: '显示顺序',
    type: 'input',
    width: 100,
    align: 'center'
  },
  {
    fieldName: 'status',
    label: '状态',
    type: 'switch',
    width: 100,
    align: 'center',
    activeValue: 1,
    inactiveValue: 0
  },
  {
    fieldName: 'createTimeText',
    label: '创建时间',
    type: 'text',
    minWidth: 170,
    align: 'center',
    hideDialog: true
  },
  {
    fieldName: 'remark',
    label: '备注',
    type: 'textarea',
    minWidth: 160,
    hideTable: true
  }
]

export const tableFields = allFields.filter(s => !s.hideTable)
export const dialogFields = allFields.filter(s => !s.hideDialog)

export const searchFields = [
  {
    field: 'name',
    label: '角色名称',
    type: 'input',
    placeholder: '请输入角色名称'
  },
  {
    field: 'code',
    label: '权限字符',
    type: 'input',
    placeholder: '请输入权限字符'
  },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    placeholder: '角色状态',
    options: [
      { label: '启用', value: 1 },
      { label: '停用', value: 0 }
    ]
  },
  {
    field: 'dateRange',
    label: '创建时间',
    type: 'daterange',
    width: 280
  }
]
