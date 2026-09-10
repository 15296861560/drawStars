/** 工具管理 - 分类/请求方式选项与弹窗字段 schema */

/** 工具分类选项（对应 ToolCategory 枚举） */
export const toolCategoryOptions = [
  { label: '通知', value: 'NOTIFICATION' },
  { label: '数据', value: 'DATA' },
  { label: '文件', value: 'FILE' },
  { label: 'AI', value: 'AI' },
  { label: '平台', value: 'PLATFORM' }
]

/** 分类编码 → 文案 */
export const toolCategoryText: Record<string, string> = {
  NOTIFICATION: '通知',
  DATA: '数据',
  FILE: '文件',
  AI: 'AI',
  PLATFORM: '平台'
}

/** 请求方式选项 */
export const toolMethodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' }
]

/** 内置工具测试参数示例（按工具编码索引，与 paramSchema 字段一一对应） */
export const builtinToolTestExamples: Record<
  string,
  Record<string, unknown>
> = {
  // 通知
  feishu_message: {
    chat_id: 'oc_demo_group_001',
    msg_type: 'text',
    content: '您好，这是来自流程工具测试的消息'
  },
  email_send: {
    to: 'demo@example.com',
    subject: '流程工具测试邮件',
    body: '这是一封由流程平台工具测试发出的邮件。',
    cc: ''
  },
  dingtalk_message: {
    webhook: 'https://oapi.dingtalk.com/robot/send?access_token=demo_token',
    content: '运维通知：服务运行正常',
    at_all: false
  },
  // 数据
  http_request: {
    url: 'https://httpbin.org/get',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: {}
  },
  db_query: {
    datasource: 'default',
    sql: 'SELECT COUNT(*) AS total FROM user',
    params: {}
  },
  redis_op: {
    command: 'GET',
    key: 'workflow:demo:key',
    value: '',
    ttl: 300
  },
  // 文件
  file_upload: {
    file_url: 'https://example.com/report.pdf',
    target: 'oss',
    path: 'workflow/demo/report.pdf'
  },
  file_download: {
    url: 'https://example.com/report.pdf',
    save_path: '/tmp/report.pdf'
  },
  // AI
  text_summary: {
    text: '流程编排系统支持可视化拖拽编排、条件分支与循环执行，可用于数据汇总、告警推送等场景。',
    max_length: 200,
    language: 'zh'
  },
  text_translate: {
    text: '你好，流程编排系统',
    source_lang: 'zh',
    target_lang: 'en'
  },
  image_recognition: {
    image_url: 'https://example.com/photo.jpg',
    tasks: ['label', 'ocr']
  },
  sentiment_analysis: {
    text: '这个产品真的太好用了，体验非常流畅！'
  },
  keyword_extract: {
    text: '流程编排系统支持可视化编辑、条件分支与循环执行',
    top_k: 5
  },
  content_classify: {
    text: '请问如何申请退款？',
    categories: ['售后', '咨询', '投诉']
  },
  // 平台
  points_grant: {
    user_id: '10001',
    points: 100,
    reason: '连续签到奖励'
  },
  task_create: {
    title: '处理流程告警工单',
    assignee_id: '10002',
    due_date: '2026-09-11 18:00:00',
    priority: 'HIGH'
  },
  user_query: {
    user_id: '10001',
    keyword: ''
  }
}

/**
 * 从 paramSchema（{ 字段: 类型 } 结构）推导测试参数示例，
 * 用于未配置专属示例的自定义工具
 */
export function buildToolTestExample(
  paramSchema: unknown
): Record<string, unknown> | null {
  if (
    !paramSchema ||
    typeof paramSchema !== 'object' ||
    Array.isArray(paramSchema)
  ) {
    return null
  }
  const entries = Object.entries(paramSchema as Record<string, unknown>)
  if (!entries.length) return null
  const example: Record<string, unknown> = {}
  for (const [key, type] of entries) {
    switch (String(type)) {
      case 'number':
        example[key] = 0
        break
      case 'boolean':
        example[key] = false
        break
      case 'object':
        example[key] = {}
        break
      case 'array':
        example[key] = []
        break
      default:
        example[key] = `示例${key}`
    }
  }
  return example
}

/** 工具管理 - 新建/编辑弹窗字段 schema */
export const dialogFields = [
  {
    fieldName: 'name',
    label: '工具名称',
    type: 'input',
    placeholder: '请输入工具名称',
    rule: [{ required: true, message: '请输入工具名称', trigger: 'blur' }]
  },
  {
    fieldName: 'code',
    label: '编码',
    type: 'input',
    placeholder: '唯一编码，如 send_message',
    disableOnEdit: true,
    rule: [{ required: true, message: '请输入编码', trigger: 'blur' }]
  },
  {
    fieldName: 'category',
    label: '分类',
    type: 'select',
    placeholder: '请选择分类',
    defaultVal: 'NOTIFICATION',
    config: { valueKey: 'value', labelKey: 'label' },
    options: toolCategoryOptions,
    rule: [{ required: true, message: '请选择分类', trigger: 'change' }]
  },
  {
    fieldName: 'method',
    label: '请求方式',
    type: 'select',
    defaultVal: 'GET',
    config: { valueKey: 'value', labelKey: 'label' },
    options: toolMethodOptions
  },
  {
    fieldName: 'endpoint',
    label: '接口地址',
    type: 'input',
    placeholder: '如 https://api.example.com/weather'
  },
  {
    fieldName: 'icon',
    label: '图标',
    type: 'input',
    placeholder: '图标名称，如 Bell'
  },
  {
    fieldName: 'authConfig',
    label: '认证配置',
    type: 'textarea',
    placeholder: 'JSON 对象格式，如 {"type": "none"}，留空表示无',
    attrs: { rows: 3 }
  },
  {
    fieldName: 'paramSchema',
    label: '参数结构',
    type: 'textarea',
    placeholder: 'JSON 对象格式，如 {"city": "string"}',
    attrs: { rows: 3 }
  },
  {
    fieldName: 'outputSchema',
    label: '输出结构',
    type: 'textarea',
    placeholder: 'JSON 对象格式，如 {"temp": "number"}',
    attrs: { rows: 3 }
  },
  {
    fieldName: 'enabled',
    label: '启用',
    type: 'switch',
    defaultVal: true
  },
  {
    fieldName: 'description',
    label: '描述',
    type: 'textarea',
    placeholder: '请输入工具描述',
    attrs: { rows: 2 }
  }
]
