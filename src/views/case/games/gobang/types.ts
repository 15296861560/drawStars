export type Cell = '' | 'b' | 'w'
export type GameMode = 'local' | 'ai' | 'online'
export type AiLevel = 'easy' | 'medium' | 'hard'
export type GameStatus = 'idle' | 'playing' | 'ended'
export type Side = 'b' | 'w'
export type OnlineTransport = 'notify'

export interface Move {
  x: number
  y: number
  side: Side
  step: number
}

export interface OnlineMessage {
  type:
    | 'hello'
    | 'ready'
    | 'start'
    | 'move'
    | 'undo'
    | 'undo-ack'
    | 'restart'
    | 'restart-ack'
    | 'surrender'
    | 'sync'
    | 'chat'
  payload?: any
  from?: string
}
