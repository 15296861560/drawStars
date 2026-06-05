/**
 * MockJS 路由占位（对接 axios 时启用）
 * 业务逻辑见 @/services/ai-assistant
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mock = require('mockjs')

Mock.mock(/\/api\/ai-assistant\/conversations$/, 'get', {
  code: 200,
  data: []
})

Mock.mock(/\/api\/ai-assistant\/chat$/, 'post', {
  code: 200,
  data: null
})
