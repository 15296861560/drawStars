/* eslint-disable */
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const write = (rel, content) => {
  fs.writeFileSync(path.join(root, rel), content, 'utf8')
  console.log('W', rel)
}

write(
  'src/views/manage/appManage/config/schema.ts',
  `export const allFields = [
  {
    fieldName: 'name',
    label: '\u5e94\u7528\u540d\u79f0',
    type: 'input',
    width: 150,
    rule: [{ required: true, message: '\u8bf7\u8f93\u5165\u5e94\u7528\u540d\u79f0', trigger: 'blur' }]
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
    label: '\u5e94\u7528\u63cf\u8ff0',
    type: 'textarea',
    width: 200,
    placeholder: '\u8bf7\u8f93\u5165\u5e94\u7528\u63cf\u8ff0'
  },
  {
    fieldName: 'version',
    label: '\u7248\u672c\u53f7',
    type: 'input',
    width: 100,
    rule: [{ required: true, message: '\u8bf7\u8f93\u5165 SemVer \u7248\u672c\u53f7', trigger: 'blur' }]
  },
  {
    fieldName: 'platforms',
    label: '\u5e73\u53f0',
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
    label: '\u5173\u8054\u6743\u9650',
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
    fieldName: 'release_notes',
    label: '\u53d1\u7248\u8bf4\u660e',
    type: 'textarea',
    width: 180
  },
  {
    fieldName: 'force_update',
    label: '\u5f3a\u5236\u66f4\u65b0',
    type: 'select',
    width: 100,
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '\u5426', value: 0 },
      { label: '\u662f', value: 1 }
    ]
  },
  {
    fieldName: 'status',
    label: '\u72b6\u6001',
    type: 'select',
    width: 100,
    rule: [{ required: true, message: '\u8bf7\u9009\u62e9\u72b6\u6001', trigger: 'blur' }],
    placeholder: '\u8bf7\u9009\u62e9',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '\u5df2\u53d1\u5e03', value: 'published' },
      { label: '\u672a\u53d1\u5e03', value: 'unpublished' },
      { label: '\u5f00\u53d1\u4e2d', value: 'developing' },
      { label: '\u8349\u7a3f', value: 'draft' }
    ]
  },
  {
    fieldName: 'icon',
    label: '\u56fe\u6807',
    type: 'img',
    width: 80
  },
  {
    fieldName: 'category',
    label: '\u5206\u7c7b',
    type: 'select',
    width: 120,
    rule: [{ required: true, message: '\u8bf7\u9009\u62e9\u5206\u7c7b', trigger: 'blur' }],
    placeholder: '\u8bf7\u9009\u62e9',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: '\u5de5\u5177\u7c7b', value: 'tool' },
      { label: '\u6e38\u620f\u7c7b', value: 'game' },
      { label: '\u529e\u516c\u7c7b', value: 'office' },
      { label: '\u793e\u4ea4\u7c7b', value: 'social' },
      { label: '\u5176\u4ed6', value: 'other' }
    ]
  },
  {
    fieldName: 'create_time',
    label: '\u521b\u5efa\u65f6\u95f4',
    type: 'date',
    width: 180,
    hideDialog: true
  },
  {
    fieldName: 'update_time',
    label: '\u66f4\u65b0\u65f6\u95f4',
    type: 'date',
    width: 180,
    hideDialog: true
  },
  {
    fieldName: 'file_path',
    label: '\u6587\u4ef6',
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
`
)

write(
  'src/assets/js/api/appController/appApi.js',
  `import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'

const appApi = {
  queryAppList: params => $axiosGet(params, \`/appApi/list\`),
  getAppDetailById: id => $axiosGet({}, \`/appApi/detail/\${id}\`),
  createApp: app => $axios(app, \`/appApi/create\`),
  updateApp: data =>
    requests({ url: \`/api/appApi/update\`, data, method: 'put' }),
  deleteApp: id =>
    requests({ url: \`/api/appApi/delete/\${id}\`, method: 'delete' }),
  batchDeleteApp: ids =>
    requests({ url: \`/api/appApi/batchDelete\`, data: ids, method: 'delete' }),
  upgradeApp: data =>
    requests({
      url: \`/api/appApi/upgrade/\${data.id}\`,
      data,
      method: 'post'
    }),
  publishApp: id =>
    requests({ url: \`/api/appApi/publish/\${id}\`, method: 'post' }),
  listVersions: id => $axiosGet({}, \`/appApi/versions/\${id}\`),
  bindPermissions: (moduleCode, permissionCodes) =>
    requests({
      url: \`/api/mobile/modules/\${encodeURIComponent(moduleCode)}/permissions\`,
      data: { permissionCodes },
      method: 'post'
    })
}

export default appApi
`
)

// patch confirmMethod fields in index.vue
const indexPath = path.join(root, 'src/views/manage/appManage/index.vue')
let index = fs.readFileSync(indexPath, 'utf8')
index = index.replace(
  `const app = {
    name: newData.name,
    version: newData.version,
    status: newData.status,
    category: newData.category,
    icon: newData.icon,
    description: newData.description,
    file_path: newData.file_path
  }`,
  `const permissionCodes = Array.isArray(newData.permission_codes)
    ? newData.permission_codes
    : String(newData.permission_codes || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
  const app = {
    name: newData.name,
    version: newData.version,
    status: newData.status,
    category: newData.category,
    icon: newData.icon,
    description: newData.description,
    file_path: newData.file_path,
    module_code: newData.module_code,
    platforms: newData.platforms,
    module_url: newData.module_url,
    checksum: newData.checksum,
    release_notes: newData.release_notes,
    force_update: newData.force_update,
    permission_codes: permissionCodes
  }`
)

if (!index.includes('versionsRow')) {
  index = index.replace(
    `{
    label: '删除',
    type: 'danger',
    action: deleteRow
  }
]`,
    `{
    label: '删除',
    type: 'danger',
    action: deleteRow
  },
  {
    label: '\u7248\u672c\u5386\u53f2',
    type: 'primary',
    action: versionsRow
  }
]`
  )
  index = index.replace(
    'onMounted(() => {\n  query()\n})',
    `async function versionsRow(row) {
  const result = await appApi.listVersions(row.id)
  const list = result?.data?.list || []
  const text = list.length
    ? list.map(v => (v.version || '') + ' / ' + (v.status || '')).join('\\n')
    : '\u6682\u65e0\u7248\u672c\u8bb0\u5f55'
  ElMessageBox.alert(text, '\u7248\u672c\u5386\u53f2 - ' + (row.module_code || row.name), {
    confirmButtonText: '\u786e\u5b9a'
  })
}

onMounted(() => {
  query()
})`
  )
}

fs.writeFileSync(indexPath, index, 'utf8')
console.log('patched appManage/index.vue')

// menu schema client + moduleCode
const menuSchemaPath = path.join(
  root,
  'src/views/manage/menuManage/config/schema.ts'
)
let menuSchema = fs.readFileSync(menuSchemaPath, 'utf8')
if (!menuSchema.includes("fieldName: 'client'")) {
  menuSchema = menuSchema.replace(
    `{
    fieldName: 'permission',
    label: '\u6743\u9650\u7801',
    type: 'input',
    placeholder: '\u5982 system:user:create'
  },`,
    `{
    fieldName: 'permission',
    label: '\u6743\u9650\u7801',
    type: 'input',
    placeholder: '\u5982 system:user:create'
  },
  {
    fieldName: 'client',
    label: 'client',
    type: 'select',
    defaultVal: 'pc',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: 'pc', value: 'pc' },
      { label: 'mobile', value: 'mobile' },
      { label: 'all', value: 'all' }
    ]
  },
  {
    fieldName: 'moduleCode',
    label: 'moduleCode',
    type: 'input',
    placeholder: 'mobile module code'
  },`
  )
  // if unicode already decoded in file
  if (!menuSchema.includes("fieldName: 'client'")) {
    menuSchema = menuSchema.replace(
      `placeholder: '如 system:user:create'
  },`,
      `placeholder: '如 system:user:create'
  },
  {
    fieldName: 'client',
    label: 'client',
    type: 'select',
    defaultVal: 'pc',
    config: { valueKey: 'value', labelKey: 'label' },
    options: [
      { label: 'pc', value: 'pc' },
      { label: 'mobile', value: 'mobile' },
      { label: 'all', value: 'all' }
    ]
  },
  {
    fieldName: 'moduleCode',
    label: 'moduleCode',
    type: 'input',
    placeholder: 'mobile module code'
  },`
    )
  }
  fs.writeFileSync(menuSchemaPath, menuSchema, 'utf8')
  console.log('patched menu schema')
}

console.log('done')
