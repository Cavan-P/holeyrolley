import { type Cosmetics } from './cosmetics'
import type { GreenPiece, ObstacleKind } from './courses/practiceGreen'

export const maxNameLength = 16
export const maxPlayers = 4

export type Player = {
    id: string,
    name: string,
    cosmetics: Cosmetics,
    obstacle: ObstacleKind
}

export type RoomSettings = {
    collision: boolean
    course: string
    strokeLimit: number | null
    timeLimit: number | null
}

export const STROKE_LIMITS = [null, 3, 4, 5] as const
export const TIME_LIMITS = [null, 60, 90, 120, 180] as const

export type ClientMsg = 
    | { type: 'join', room: string, name: string, cosmetics: Cosmetics }
    | { type: 'create', name: string, cosmetics: Cosmetics }

    | { type: 'leave' }
    | { type: 'shoot', angle: number, power: number }
    | { type: 'update', settings: RoomSettings }
    | { type: 'start'}
    | { type: 'place', x: number, y: number }

export type ServerMsg = 
    | { type: 'room', code: string, settings: RoomSettings, players: Player[], yourId: string, hostId: string, roomPhase: RoomPhase, pieces: GreenPiece[] }
    | { type: 'error', reason: 'notFound' | 'full' }
    | { type: 'state', time: number, balls: BallState[] }

export type RoomPhase = 'lobby' | 'playing'
export type BallState = { id: string, x: number, y: number, layer: number, moving: boolean, holed: boolean }