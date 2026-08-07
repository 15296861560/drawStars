<template>
  <div class="gobang-page" v-loading="onlineLoading">
    <div class="toolbar">
      <el-radio-group
        v-model="mode"
        :disabled="status === 'playing' || onlineJoined"
        @change="onModeChange"
      >
        <el-radio-button label="local">本地对战</el-radio-button>
        <el-radio-button label="ai">人机对战</el-radio-button>
        <el-radio-button label="online">联机对战</el-radio-button>
      </el-radio-group>

      <div class="toolbar-row" v-if="mode === 'ai'">
        <span>难度</span>
        <el-select
          v-model="aiLevel"
          :disabled="status === 'playing'"
          style="width: 110px"
        >
          <el-option label="简单" value="easy" />
          <el-option label="中等" value="medium" />
          <el-option label="困难" value="hard" />
        </el-select>
        <span>我执</span>
        <el-radio-group v-model="playerSide" :disabled="status === 'playing'">
          <el-radio-button label="b">黑棋</el-radio-button>
          <el-radio-button label="w">白棋</el-radio-button>
        </el-radio-group>
      </div>

      <div class="toolbar-row" v-if="mode === 'online'">
        <el-input
          v-model="roomCode"
          placeholder="房间号"
          maxlength="6"
          style="width: 140px"
          :disabled="onlineJoined"
        />
        <el-button type="primary" :disabled="onlineJoined" @click="createRoom">
          创建房间
        </el-button>
        <el-button type="success" :disabled="onlineJoined" @click="joinRoom">
          加入房间
        </el-button>
        <el-button v-if="onlineJoined" type="danger" plain @click="leaveOnline">
          离开房间
        </el-button>
        <span v-if="onlineJoined" class="room-tip">
          房间 {{ roomCode }} · {{ isHost ? '房主(黑)' : '客人(白)' }} ·
          {{ peerReady ? '对方已就位' : '等待对方' }} · {{ transportLabel }}
        </span>
      </div>
    </div>

    <div class="main">
      <div class="board-wrap">
        <canvas
          class="checkerboard"
          ref="canvasRef"
          @click="onBoardClick"
        ></canvas>
      </div>

      <aside class="side-panel">
        <div class="status-card">
          <div class="status-title">对局状态</div>
          <div class="status-line">
            <span class="stone black"></span>
            <span>{{ blackLabel }}</span>
          </div>
          <div class="status-line">
            <span class="stone white"></span>
            <span>{{ whiteLabel }}</span>
          </div>
          <div class="turn">
            {{ statusText }}
          </div>
          <div class="step">步数：{{ moves.length }}</div>
        </div>

        <div class="actions">
          <el-button type="primary" @click="startGame" :disabled="!canStart">
            {{ status === 'idle' ? '开始游戏' : '重新开局' }}
          </el-button>
          <el-button @click="undo" :disabled="!canUndo">悔棋</el-button>
          <el-button
            type="warning"
            @click="surrender"
            :disabled="status !== 'playing'"
          >
            认输
          </el-button>
        </div>

        <div class="history">
          <div class="status-title">落子记录</div>
          <div class="history-list" ref="historyRef">
            <div v-for="item in historyText" :key="item" class="history-item">
              {{ item }}
            </div>
            <div v-if="!historyText.length" class="history-empty">暂无记录</div>
          </div>
        </div>

        <div class="tips">
          <p>规则：15×15 棋盘，先连成五子者胜。</p>
          <p v-if="mode === 'local'">本地模式：双人轮流落子。</p>
          <p v-if="mode === 'ai'">人机模式：可选难度与执子颜色。</p>
          <p v-if="mode === 'online'">
            联机模式：通过 drawstarts-notify
            通知频道创建/加入房间对战（需通知服务 ws://localhost:8030/ 可用）。
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { showTips } from '@/utils/message/showTips.js'
import { getAiMove } from './ai'
import {
  BOARD_SIZE,
  createEmptyBoard,
  formatMoveList,
  opposite,
  placeStone
} from './gameLogic'
import { GobangOnline, randomRoomCode } from './online'
import type {
  AiLevel,
  Cell,
  GameMode,
  GameStatus,
  Move,
  OnlineMessage,
  Side
} from './types'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const historyRef = ref<HTMLElement | null>(null)

const mode = ref<GameMode>('local')
const status = ref<GameStatus>('idle')
const aiLevel = ref<AiLevel>('medium')
const playerSide = ref<Side>('b')
const currentSide = ref<Side>('b')
const boards = ref<Cell[][]>(createEmptyBoard())
const moves = ref<Move[]>([])
const lastMove = ref<{ x: number; y: number } | null>(null)
const winner = ref<Side | 'draw' | null>(null)
const aiThinking = ref(false)

const roomCode = ref('')
const onlineLoading = ref(false)
const onlineJoined = ref(false)
const onlineTransport = ref<'notify'>('notify')
const isHost = ref(false)
const peerReady = ref(false)
const myOnlineSide = ref<Side>('b')
let online: GobangOnline | null = null
let _pendingUndo = false
let pendingRestart = false

const pixelSize = 640
const gapWidth = pixelSize / (BOARD_SIZE - 1)
const chessSize = gapWidth * 0.38
const starPoints = [
  [3, 3],
  [3, 11],
  [7, 7],
  [11, 3],
  [11, 11]
]

const historyText = computed(() => formatMoveList(moves.value))

const blackLabel = computed(() => {
  if (mode.value === 'ai') {
    return playerSide.value === 'b' ? '玩家' : 'AI'
  }
  if (mode.value === 'online') {
    return isHost.value ? '我' : '对方'
  }
  return '玩家 A'
})

const whiteLabel = computed(() => {
  if (mode.value === 'ai') {
    return playerSide.value === 'w' ? '玩家' : 'AI'
  }
  if (mode.value === 'online') {
    return isHost.value ? '对方' : '我'
  }
  return '玩家 B'
})

const statusText = computed(() => {
  if (status.value === 'idle') return '请开始游戏'
  if (status.value === 'ended') {
    if (winner.value === 'draw') return '平局'
    if (winner.value === 'b') return '黑棋获胜'
    if (winner.value === 'w') return '白棋获胜'
    return '对局结束'
  }
  if (aiThinking.value) return 'AI 思考中...'
  return currentSide.value === 'b' ? '轮到黑棋' : '轮到白棋'
})

const transportLabel = computed(() => '通知联机')

const canStart = computed(() => {
  if (mode.value === 'online') return onlineJoined.value && peerReady.value
  return true
})

const canUndo = computed(() => {
  if (status.value !== 'playing') return false
  if (!moves.value.length) return false
  if (mode.value === 'ai') return !aiThinking.value
  if (mode.value === 'online') return moves.value.length > 0
  return true
})

function drawBoard() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = pixelSize
  canvas.height = pixelSize
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const grad = ctx.createLinearGradient(0, 0, pixelSize, pixelSize)
  grad.addColorStop(0, '#e2b574')
  grad.addColorStop(1, '#c68a3f')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, pixelSize, pixelSize)

  ctx.strokeStyle = '#5a3a1a'
  ctx.lineWidth = 1
  for (let i = 0; i < BOARD_SIZE; i++) {
    const p = i * gapWidth
    ctx.beginPath()
    ctx.moveTo(0, p)
    ctx.lineTo(pixelSize, p)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(p, 0)
    ctx.lineTo(p, pixelSize)
    ctx.stroke()
  }

  ctx.fillStyle = '#3d2410'
  for (const [sx, sy] of starPoints) {
    ctx.beginPath()
    ctx.arc(sx * gapWidth, sy * gapWidth, 3.5, 0, Math.PI * 2)
    ctx.fill()
  }

  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const cell = boards.value[x][y]
      if (!cell) continue
      drawStone(ctx, x, y, cell)
    }
  }

  if (lastMove.value) {
    const { x, y } = lastMove.value
    ctx.strokeStyle = '#e74c3c'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x * gapWidth, y * gapWidth, chessSize * 0.45, 0, Math.PI * 2)
    ctx.stroke()
  }
}

function drawStone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  side: Side
) {
  const cx = x * gapWidth
  const cy = y * gapWidth
  const g = ctx.createRadialGradient(
    cx - chessSize * 0.3,
    cy - chessSize * 0.3,
    chessSize * 0.1,
    cx,
    cy,
    chessSize
  )
  if (side === 'b') {
    g.addColorStop(0, '#666')
    g.addColorStop(1, '#111')
  } else {
    g.addColorStop(0, '#fff')
    g.addColorStop(1, '#d8d8d8')
  }
  ctx.beginPath()
  ctx.arc(cx, cy, chessSize, 0, Math.PI * 2)
  ctx.fillStyle = g
  ctx.fill()
  if (side === 'w') {
    ctx.strokeStyle = '#999'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

function resetBoardState() {
  boards.value = createEmptyBoard()
  moves.value = []
  lastMove.value = null
  winner.value = null
  currentSide.value = 'b'
  aiThinking.value = false
  status.value = 'idle'
  drawBoard()
}

function applyMove(x: number, y: number, side: Side, silent = false) {
  const result = placeStone(boards.value, x, y, side)
  if (!result.ok) return false
  boards.value = result.board
  const step = moves.value.length + 1
  moves.value.push({ x, y, side, step })
  lastMove.value = { x, y }
  drawBoard()
  scrollHistory()

  if (result.win) {
    status.value = 'ended'
    winner.value = side
    if (!silent) {
      showTips('success', side === 'b' ? '黑棋获胜！' : '白棋获胜！')
    }
    return true
  }
  if (result.draw) {
    status.value = 'ended'
    winner.value = 'draw'
    if (!silent) showTips('success', '平局！')
    return true
  }
  currentSide.value = opposite(side)
  return true
}

function scrollHistory() {
  nextTick(() => {
    if (historyRef.value) {
      historyRef.value.scrollTop = historyRef.value.scrollHeight
    }
  })
}

function startGame() {
  if (mode.value === 'online' && (!onlineJoined.value || !peerReady.value)) {
    showTips('warning', '请先加入房间并等待对方')
    return
  }

  boards.value = createEmptyBoard()
  moves.value = []
  lastMove.value = null
  winner.value = null
  currentSide.value = 'b'
  status.value = 'playing'
  aiThinking.value = false
  drawBoard()
  showTips('success', '游戏开始！')

  if (mode.value === 'online' && online) {
    if (pendingRestart) {
      pendingRestart = false
    } else {
      online.send({ type: 'start' })
    }
  }

  if (mode.value === 'ai' && playerSide.value === 'w') {
    runAiTurn()
  }
}

function onBoardClick(event: MouseEvent) {
  if (status.value !== 'playing' || aiThinking.value) {
    if (status.value === 'idle') showTips('warning', '请先开始游戏')
    return
  }

  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const offsetX = (event.clientX - rect.left) * scaleX
  const offsetY = (event.clientY - rect.top) * scaleY
  const x = Math.round(offsetX / gapWidth)
  const y = Math.round(offsetY / gapWidth)

  if (x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE) return
  if (boards.value[x][y]) return

  if (mode.value === 'ai' && currentSide.value !== playerSide.value) return
  if (mode.value === 'online' && currentSide.value !== myOnlineSide.value) {
    showTips('warning', '还没轮到你')
    return
  }

  const side = currentSide.value
  const ok = applyMove(x, y, side)
  if (!ok) return

  if (mode.value === 'online' && online) {
    online.send({ type: 'move', payload: { x, y, side } })
  }

  if (status.value === 'playing' && mode.value === 'ai') {
    runAiTurn()
  }
}

function runAiTurn() {
  if (status.value !== 'playing') return
  if (currentSide.value === playerSide.value) return
  aiThinking.value = true
  const side = currentSide.value
  const boardSnapshot = boards.value.map(r => r.slice()) as Cell[][]
  const level = aiLevel.value

  setTimeout(
    () => {
      const move = getAiMove(boardSnapshot, side, level)
      aiThinking.value = false
      if (!move || status.value !== 'playing') return
      applyMove(move.x, move.y, side)
    },
    level === 'hard' ? 180 : 80
  )
}

function undo() {
  if (!canUndo.value) return

  if (mode.value === 'online') {
    if (!online) return
    _pendingUndo = true
    online.send({ type: 'undo' })
    showTips('info', '已发起悔棋请求，等待对方确认')
    return
  }

  doUndo(mode.value === 'ai' ? 2 : 1)
}

function doUndo(count: number) {
  if (!moves.value.length) return
  const n = Math.min(count, moves.value.length)
  for (let i = 0; i < n; i++) {
    const m = moves.value.pop()
    if (!m) break
    boards.value[m.x][m.y] = ''
  }
  const last = moves.value[moves.value.length - 1]
  lastMove.value = last ? { x: last.x, y: last.y } : null
  currentSide.value = last ? opposite(last.side) : 'b'
  winner.value = null
  if (status.value === 'ended') status.value = 'playing'
  drawBoard()
  if (
    mode.value === 'ai' &&
    status.value === 'playing' &&
    currentSide.value !== playerSide.value
  ) {
    runAiTurn()
  }
}

function surrender() {
  if (status.value !== 'playing') return
  let loseSide: Side = currentSide.value
  if (mode.value === 'ai') loseSide = playerSide.value
  if (mode.value === 'online') loseSide = myOnlineSide.value
  const winSide = opposite(loseSide)
  status.value = 'ended'
  winner.value = winSide
  showTips('success', winSide === 'b' ? '黑棋获胜！' : '白棋获胜！')
  if (mode.value === 'online' && online) {
    online.send({ type: 'surrender', payload: { side: loseSide } })
  }
}

function onModeChange() {
  resetBoardState()
  if (mode.value !== 'online') {
    leaveOnline(true)
  }
}

async function ensureOnline() {
  if (!online) online = new GobangOnline()
  if (!online.account) {
    onlineLoading.value = true
    try {
      await online.connect()
      online.onMessage(handleOnlineMessage)
    } finally {
      onlineLoading.value = false
    }
  }
  return online
}

async function createRoom() {
  try {
    const client = await ensureOnline()
    roomCode.value = randomRoomCode()
    onlineLoading.value = true
    await client.joinRoom(roomCode.value)
    onlineJoined.value = true
    onlineTransport.value = client.transport
    isHost.value = true
    myOnlineSide.value = 'b'
    peerReady.value = false
    await client.send({ type: 'hello', payload: { role: 'host' } })
    showTips('success', `房间${roomCode.value}已创建，等待对手加入`)
  } catch (e: any) {
    showTips('error', e?.message || '创建房间失败')
  } finally {
    onlineLoading.value = false
  }
}

async function joinRoom() {
  if (!/^\d{6}$/.test(roomCode.value)) {
    showTips('warning', '请输入 6 位房间号')
    return
  }
  try {
    const client = await ensureOnline()
    onlineLoading.value = true
    await client.joinRoom(roomCode.value)
    onlineJoined.value = true
    onlineTransport.value = client.transport
    isHost.value = false
    myOnlineSide.value = 'w'
    peerReady.value = true
    await client.send({ type: 'ready', payload: { role: 'guest' } })
    showTips('success', '已加入房间，可开始对局')
  } catch (e: any) {
    showTips('error', e?.message || '加入房间失败')
  } finally {
    onlineLoading.value = false
  }
}

async function leaveOnline(silent = false) {
  if (online) {
    try {
      await online.leaveRoom()
    } catch (_) {
      /* ignore */
    }
  }
  onlineJoined.value = false
  peerReady.value = false
  isHost.value = false
  if (!silent) showTips('info', '已离开房间')
  if (mode.value === 'online') resetBoardState()
}

function handleOnlineMessage(msg: OnlineMessage, _memberId: string) {
  if (msg.from && online && msg.from === online.account) return

  switch (msg.type) {
    case 'hello':
      peerReady.value = true
      if (onlineJoined.value) {
        online?.send({
          type: 'ready',
          payload: { role: isHost.value ? 'host' : 'guest' }
        })
      }
      break
    case 'ready':
      peerReady.value = true
      showTips('success', '对方已就位')
      break
    case 'start':
      boards.value = createEmptyBoard()
      moves.value = []
      lastMove.value = null
      winner.value = null
      currentSide.value = 'b'
      status.value = 'playing'
      drawBoard()
      showTips('success', '对方已开始，游戏开始！')
      break
    case 'move': {
      const { x, y, side } = msg.payload || {}
      if (typeof x !== 'number' || typeof y !== 'number') return
      if (status.value === 'idle') {
        status.value = 'playing'
      }
      if (status.value === 'playing' && side === currentSide.value) {
        applyMove(x, y, side)
      }
      break
    }
    case 'undo':
      ElMessageBoxConfirmUndo()
      break
    case 'undo-ack':
      if (msg.payload?.agree) {
        doUndo(1)
        showTips('success', '对方同意悔棋')
      } else {
        showTips('warning', '对方拒绝悔棋')
      }
      _pendingUndo = false
      break
    case 'restart':
      ElMessageBoxConfirmRestart()
      break
    case 'restart-ack':
      if (msg.payload?.agree) {
        pendingRestart = true
        startGame()
      } else {
        showTips('warning', '对方拒绝重开')
      }
      break
    case 'surrender': {
      const loseSide = msg.payload?.side as Side
      if (!loseSide) return
      status.value = 'ended'
      winner.value = opposite(loseSide)
      showTips('success', '对方认输，你获胜！')
      break
    }
    default:
      break
  }
}

function ElMessageBoxConfirmUndo() {
  import('element-plus').then(({ ElMessageBox }) => {
    ElMessageBox.confirm('对方请求悔棋，是否同意？', '悔棋', {
      confirmButtonText: '同意',
      cancelButtonText: '拒绝',
      type: 'warning'
    })
      .then(() => {
        doUndo(1)
        online?.send({ type: 'undo-ack', payload: { agree: true } })
      })
      .catch(() => {
        online?.send({ type: 'undo-ack', payload: { agree: false } })
      })
  })
}

function ElMessageBoxConfirmRestart() {
  import('element-plus').then(({ ElMessageBox }) => {
    ElMessageBox.confirm('对方请求重新开局，是否同意？', '重开', {
      confirmButtonText: '同意',
      cancelButtonText: '拒绝',
      type: 'warning'
    })
      .then(() => {
        online?.send({ type: 'restart-ack', payload: { agree: true } })
        pendingRestart = true
        startGame()
      })
      .catch(() => {
        online?.send({ type: 'restart-ack', payload: { agree: false } })
      })
  })
}

watch(historyText, () => scrollHistory())

onMounted(() => {
  drawBoard()
})

onBeforeUnmount(() => {
  if (online) {
    online.logout()
    online = null
  }
})
</script>

<style lang="less" scoped>
.gobang-page {
  padding: 0.5rem 1rem 1.5rem;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.toolbar-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.room-tip {
  color: #606266;
  font-size: 0.875rem;
}

.main {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  justify-content: center;
}

.board-wrap {
  flex: 0 0 auto;
}

.checkerboard {
  width: min(92vw, 640px);
  height: auto;
  background: #c68a3f;
  display: block;
  border: solid 4px #3d2410;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(61, 36, 16, 0.25);
}

.side-panel {
  width: min(100%, 280px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-card,
.history,
.tips {
  background: #faf7f2;
  border: 1px solid #e6d5bf;
  border-radius: 8px;
  padding: 0.875rem 1rem;
}

.status-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #3d2410;
}

.status-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.stone {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  &.black {
    background: #111;
  }
  &.white {
    background: #fff;
    border: 1px solid #999;
  }
}

.turn {
  margin-top: 0.5rem;
  font-size: 1.05rem;
  color: #c45600;
  font-weight: 600;
}

.step {
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.875rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.history-list {
  max-height: 220px;
  overflow: auto;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: #4a4a4a;
}

.history-empty {
  color: #aaa;
}

.tips {
  font-size: 0.8125rem;
  color: #666;
  line-height: 1.6;
  p {
    margin: 0 0 0.35rem;
  }
}

@media (max-width: 720px) {
  .side-panel {
    width: 100%;
  }
}
</style>
