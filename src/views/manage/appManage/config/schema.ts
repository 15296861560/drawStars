export const allFields = [
  {
    fieldName: 'name',
    label: '应用名称',
    type: 'input',
    width: 150,
    rule: [{ required: true, message: '请输入应用名称', trigger: 'blur' }]
  },
  {
    fieldName: 'module_code',
    label: 'moduleCode',
    type: 'input',
    width: 140,
    placeholder: 'demo.hello'
  },
  {
    fieldName: 'description',
    label: '应用描述',
    type: 'textarea',
    width: 200,
    placeholder: '请输入应用描述'
  },
  {
    fieldName: 'version',
    label: '版本号',
    type: 'input',
    width: 100,
    rule: [{ required: true, message: '请输入 SemVer 版本号', trigger: 'blur' }]
  },
  {
    fieldName: 'platforms',
    label: '平台',
    type: 'select',
    width: 160,
    attrs: { multiple: true, collapseTags: true },
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: 'Android', value: 'android' },
      { label: 'iOS', value: 'ios' },
      { label: 'H5', value: 'h5' },
      { label: 'mp-weixin', value: 'mp-weixin' }
    ]
  },
  {
    fieldName: 'module_url',
    label: 'module_url',
    type: 'input',
    width: 200,
    placeholder: 'H5 module url'
  },
  {
    fieldName: 'permission_codes',
    label: '关联权限',
    type: 'input',
    width: 180,
    placeholder: 'code1,code2'
  },
  {
    fieldName: 'checksum',
    label: 'checksum',
    type: 'input',
    width: 160,
    placeholder: 'sha256:...'
  },
  {
    fieldName: 'min_shell_version',
    label: '最低壳版本',
    type: 'input',
    width: 120,
    placeholder: '1.0.0'
  },
  {
    fieldName: 'release_notes',
    label: '发版说明',
    type: 'textarea',
    width: 180
  },
  {
    fieldName: 'force_update',
    label: '强制更新',
    type: 'select',
    width: 100,
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '否', value: 0 },
      { label: '是', value: 1 }
    ]
  },
  {
    fieldName: 'status',
    label: '状态',
    type: 'select',
    width: 100,
    rule: [{ required: true, message: '请选择状态', trigger: 'blur' }],
    placeholder: '请选择',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '已发布', value: 'published' },
      { label: '未发布', value: 'unpublished' },
      { label: '开发中', value: 'developing' },
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
    fieldName: 'category',
    label: '分类',
    type: 'select',
    width: 120,
    rule: [{ required: true, message: '请选择分类', trigger: 'blur' }],
    placeholder: '请选择',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '工具类', value: 'tool' },
      { label: '游戏类', value: 'game' },
      { label: '办公类', value: 'office' },
      { label: '社交类', value: 'social' },
      { label: '其他', value: 'other' }
    ]
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
    label: '更新时间',
    type: 'date',
    width: 180,
    hideDialog: true
  },
  {
    fieldName: 'file_path',
    label: '文件',
    type: 'upload',
    width: 180,
    attrs: {
      field: {
        controlCongfig: {
          fileType: [3]
        }
      }
    }
  }
]

export const tableFields = allFields
export const dialogFields = allFields.filter(s => !s.hideDialog)
