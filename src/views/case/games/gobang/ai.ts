import {
  BOARD_SIZE,
  checkWin,
  cloneBoard,
  isValidCoord,
  opposite
} from './gameLogic'
import type { AiLevel, Cell, Side } from './types'

type Pos = { x: number; y: number }

const SCORE = {
  FIVE: 100000,
  LIVE4: 10000,
  DEAD4: 1000,
  LIVE3: 1000,
  DEAD3: 100,
  LIVE2: 100,
  DEAD2: 10,
  LIVE1: 10
}

function hasNeighbor(board: Cell[][], x: number, y: number, dist = 2): boolean {
  for (let i = -dist; i <= dist; i++) {
    for (let j = -dist; j <= dist; j++) {
      if (i === 0 && j === 0) continue
      const nx = x + i
      const ny = y + j
      if (isValidCoord(nx, ny) && board[nx][ny]) return true
    }
  }
  return false
}

function getCandidates(board: Cell[][]): Pos[] {
  const list: Pos[] = []
  let empty = true
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (board[x][y]) {
        empty = false
      } else if (hasNeighbor(board, x, y)) {
        list.push({ x, y })
      }
    }
  }
  if (empty) {
    const c = Math.floor(BOARD_SIZE / 2)
    return [{ x: c, y: c }]
  }
  return list
}

function countDir(
  board: Cell[][],
  x: number,
  y: number,
  dx: number,
  dy: number,
  side: Side
): { count: number; block: number } {
  let count = 1
  let block = 0

  let nx = x + dx
  let ny = y + dy
  while (isValidCoord(nx, ny) && board[nx][ny] === side) {
    count++
    nx += dx
    ny += dy
  }
  if (!isValidCoord(nx, ny) || board[nx][ny] !== '') block++

  nx = x - dx
  ny = y - dy
  while (isValidCoord(nx, ny) && board[nx][ny] === side) {
    count++
    nx -= dx
    ny -= dy
  }
  if (!isValidCoord(nx, ny) || board[nx][ny] !== '') block++

  return { count, block }
}

function patternScore(count: number, block: number): number {
  if (block >= 2 && count < 5) return 0
  if (count >= 5) return SCORE.FIVE
  if (count === 4) return block === 0 ? SCORE.LIVE4 : SCORE.DEAD4
  if (count === 3) return block === 0 ? SCORE.LIVE3 : SCORE.DEAD3
  if (count === 2) return block === 0 ? SCORE.LIVE2 : SCORE.DEAD2
  if (count === 1) return block === 0 ? SCORE.LIVE1 : 0
  return 0
}

function evaluatePoint(board: Cell[][], x: number, y: number, side: Side): number {
  const dirs: [number, number][] = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ]
  let score = 0
  for (const [dx, dy] of dirs) {
    const { count, block } = countDir(board, x, y, dx, dy, side)
    score += patternScore(count, block)
  }
  return score
}

function evaluateBoard(board: Cell[][], aiSide: Side): number {
  let ai = 0
  let human = 0
  const humanSide = opposite(aiSide)
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (board[x][y] === aiSide) ai += evaluatePoint(board, x, y, aiSide)
      else if (board[x][y] === humanSide)
        human += evaluatePoint(board, x, y, humanSide)
    }
  }
  return ai - human
}

function scoreMove(board: Cell[][], x: number, y: number, aiSide: Side): number {
  const attack = evaluatePoint(board, x, y, aiSide)
  const defend = evaluatePoint(board, x, y, opposite(aiSide))
  return attack * 1.1 + defend
}

function depthByLevel(level: AiLevel): number {
  if (level === 'easy') return 1
  if (level === 'medium') return 2
  return 3
}

function minimax(
  board: Cell[][],
  depth: number,
  maximizing: boolean,
  aiSide: Side,
  alpha: number,
  beta: number
): number {
  const candidates = getCandidates(board)
  if (depth === 0 || candidates.length === 0) {
    return evaluateBoard(board, aiSide)
  }

  const side = maximizing ? aiSide : opposite(aiSide)
  const ranked = candidates
    .map(p => ({ ...p, s: scoreMove(board, p.x, p.y, aiSide) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 12)

  if (maximizing) {
    let maxEval = -Infinity
    for (const { x, y } of ranked) {
      const next = cloneBoard(board)
      next[x][y] = side
      if (checkWin(next, x, y)) return SCORE.FIVE * 10
      const val = minimax(next, depth - 1, false, aiSide, alpha, beta)
      maxEval = Math.max(maxEval, val)
      alpha = Math.max(alpha, val)
      if (beta <= alpha) break
    }
    return maxEval
  }

  let minEval = Infinity
  for (const { x, y } of ranked) {
    const next = cloneBoard(board)
    next[x][y] = side
    if (checkWin(next, x, y)) return -SCORE.FIVE * 10
    const val = minimax(next, depth - 1, true, aiSide, alpha, beta)
    minEval = Math.min(minEval, val)
    beta = Math.min(beta, val)
    if (beta <= alpha) break
  }
  return minEval
}

export function getAiMove(
  board: Cell[][],
  aiSide: Side,
  level: AiLevel
): Pos | null {
  const candidates = getCandidates(board)
  if (!candidates.length) return null

  // Immediate win / block
  for (const p of candidates) {
    const next = cloneBoard(board)
    next[p.x][p.y] = aiSide
    if (checkWin(next, p.x, p.y)) return p
  }
  const human = opposite(aiSide)
  for (const p of candidates) {
    const next = cloneBoard(board)
    next[p.x][p.y] = human
    if (checkWin(next, p.x, p.y)) return p
  }

  const ranked = candidates
    .map(p => ({ ...p, s: scoreMove(board, p.x, p.y, aiSide) }))
    .sort((a, b) => b.s - a.s)

  if (level === 'easy') {
    const top = ranked.slice(0, Math.min(5, ranked.length))
    return top[Math.floor(Math.random() * top.length)]
  }

  const depth = depthByLevel(level)
  let best = ranked[0]
  let bestScore = -Infinity
  const pool = ranked.slice(0, 14)

  for (const p of pool) {
    const next = cloneBoard(board)
    next[p.x][p.y] = aiSide
    if (checkWin(next, p.x, p.y)) return p
    const score = minimax(
      next,
      depth - 1,
      false,
      aiSide,
      -Infinity,
      Infinity
    )
    if (score > bestScore) {
      bestScore = score
      best = p
    }
  }
  return best
}
