import type { Cell, Move, Side } from './types'

/** Standard 15x15 Gobang board */
export const BOARD_SIZE = 15

export function createEmptyBoard(): Cell[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => '' as Cell)
  )
}

export function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map(row => row.slice() as Cell[])
}

export function isValidCoord(x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE
}

export function countLine(
  board: Cell[][],
  x: number,
  y: number,
  dx: number,
  dy: number
): number {
  const v = board[x][y]
  if (!v) return 0
  let count = 1
  for (let i = 1; i < 5; i++) {
    const nx = x + dx * i
    const ny = y + dy * i
    if (!isValidCoord(nx, ny) || board[nx][ny] !== v) break
    count++
  }
  for (let i = 1; i < 5; i++) {
    const nx = x - dx * i
    const ny = y - dy * i
    if (!isValidCoord(nx, ny) || board[nx][ny] !== v) break
    count++
  }
  return count
}

export function checkWin(board: Cell[][], x: number, y: number): boolean {
  const dirs: [number, number][] = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ]
  return dirs.some(([dx, dy]) => countLine(board, x, y, dx, dy) >= 5)
}

export function isBoardFull(board: Cell[][]): boolean {
  return board.every(row => row.every(cell => cell !== ''))
}

export function placeStone(
  board: Cell[][],
  x: number,
  y: number,
  side: Side
): { ok: boolean; win: boolean; draw: boolean; board: Cell[][] } {
  if (!isValidCoord(x, y) || board[x][y]) {
    return { ok: false, win: false, draw: false, board }
  }
  const next = cloneBoard(board)
  next[x][y] = side
  const win = checkWin(next, x, y)
  const draw = !win && isBoardFull(next)
  return { ok: true, win, draw, board: next }
}

export function opposite(side: Side): Side {
  return side === 'b' ? 'w' : 'b'
}

export function formatMoveList(moves: Move[]): string[] {
  return moves.map(m => {
    const color = m.side === 'b' ? '黑' : '白'
    return `#${m.step} ${color} (${m.x + 1},${m.y + 1})`
  })
}
