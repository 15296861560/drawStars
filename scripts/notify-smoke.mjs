/**
 * 联调冒烟：模拟 Index 站内频道 + 五子棋房间（对接 serve@0.2.0）
 * 先启动：cd ../drawStarts-notify-serve && npm run demo
 * 再执行：node scripts/notify-smoke.mjs
 */
import { createRequire } from 'module'
import { pathToFileURL } from 'url'
import path from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (!globalThis.WebSocket) {
  // 复用 serve 仓库依赖，避免本项目额外安装 ws
  const WS = require(
    path.resolve(__dirname, '../../drawStarts-notify-serve/node_modules/ws')
  )
  globalThis.WebSocket = WS
}

// SDK generateId 依赖 window.crypto（浏览器环境）
if (!globalThis.window) {
  globalThis.window = { crypto: globalThis.crypto }
}

const WS_URL = process.env.NOTIFY_URL || 'ws://127.0.0.1:8030/'
const WEBSITE_CHANNEL = 'drawstars-web'
const GOBANG_TYPE = 'gobang'
const ROOM = `gobang_smoke_${Date.now().toString(36)}`

const clientPath = path.resolve(
  __dirname,
  '../node_modules/drawstarts-notify/dist/draw-starts-notify.es.js'
)
const mod = await import(pathToFileURL(clientPath).href)
const { NotifyClient, MSG_TYPE } = mod

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function runAsUser(token) {
  const client = new NotifyClient()
  await client.createInstance(WS_URL, { autoReconnect: false, autoAck: true })
  const loginRes = await client.login(token)
  assert(loginRes?.status, `${token} login failed`)
  return client
}

const results = []
function pass(name) {
  results.push({ name, ok: true })
  console.log(`  ✓ ${name}`)
}

console.log('======== drawstarts-notify 0.2.0 业务冒烟 ========')
console.log(`WS: ${WS_URL}`)
console.log(`ROOM: ${ROOM}`)

try {
  const alice = await runAsUser('alice')
  const bob = await runAsUser('bob')
  pass('两端 createInstance + login')

  assert((await alice.joinChannel(WEBSITE_CHANNEL))?.status, 'alice join site')
  assert((await bob.joinChannel(WEBSITE_CHANNEL))?.status, 'bob join site')
  pass('joinChannel drawstars-web')

  let siteHit = null
  alice.addNotifyCallback('site', WEBSITE_CHANNEL, payload => {
    siteHit = payload
  })

  const siteSend = await bob.sendNotify({
    notifyType: 'site',
    notifyMsg: JSON.stringify({
      id: 9001,
      content: '站内信冒烟',
      tag: '系统'
    }),
    channelName: WEBSITE_CHANNEL,
    msgType: MSG_TYPE.channel,
    excludeSender: true,
    waitAck: true
  })
  assert(siteSend?.status, 'site sendNotify failed')
  await wait(400)
  assert(siteHit?.content === '站内信冒烟', 'site callback miss')
  pass('站内信 channel notify + callback')

  assert((await alice.joinChannel(ROOM))?.status, 'alice join room')
  assert((await bob.joinChannel(ROOM))?.status, 'bob join room')
  pass('joinChannel gobang room')

  let gobangHit = null
  bob.addNotifyCallback(GOBANG_TYPE, ROOM, payload => {
    gobangHit = payload
  })

  const moveSend = await alice.sendNotify({
    notifyType: GOBANG_TYPE,
    notifyMsg: JSON.stringify({
      type: 'move',
      x: 7,
      y: 7,
      from: 'alice'
    }),
    channelName: ROOM,
    excludeSender: true,
    waitAck: true
  })
  assert(moveSend?.status, 'gobang send failed')
  await wait(400)
  assert(
    gobangHit?.type === 'move' && gobangHit?.x === 7,
    'gobang callback miss'
  )
  pass('五子棋房间消息收发')

  const history = await alice.pullHistory(ROOM, undefined, 10)
  assert(history?.status, 'pullHistory failed')
  const histCount =
    history?.data?.list?.length ?? history?.data?.messages?.length ?? '?'
  pass(`pullHistory (count=${histCount})`)

  alice.destroyed()
  bob.destroyed()
  pass('destroyed')

  console.log('')
  console.log(`======== 结果 ${results.length}/${results.length} ========`)
  console.log('业务冒烟通过（站内信频道 + 五子棋房间 + 历史）')
} catch (e) {
  console.error(`  ✗ 冒烟失败 — ${e.message || e}`)
  console.error(
    '请确认 drawstarts-notify-serve demo 已在 8030 运行：npm run demo'
  )
  process.exit(1)
}
