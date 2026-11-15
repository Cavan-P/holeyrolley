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
    holes: HoleRange
}

export const HOLE_RANGES = ['all', 'front', 'back'] as const
export type HoleRange = typeof HOLE_RANGES[number]

export function holeRange(count: number, range: HoleRange): [number, number] {
    if(range === 'front') return [0, Math.min(8, count - 1)]
    if(range === 'back' && count > 9) return [9, count - 1]
    return [0, count - 1]
}

export const STROKE_LIMITS = [null, 3, 4, 5] as const
export const TIME_LIMITS = [null, 60, 90, 120, 180] as const

export type ClientMsg = 
    | { type: 'join', room: string, name: string, cosmetics: Cosmetics, token?: string }
    | { type: 'create', name: string, cosmetics: Cosmetics }
    | { type: 'quickplay', name: string, cosmetics: Cosmetics }

    | { type: 'leave' }
    | { type: 'shoot', angle: number, power: number, seq: number }
    | { type: 'ping', id: number }
    | { type: 'update', settings: RoomSettings }
    | { type: 'start'}
    | { type: 'place', x: number, y: number }
    | { type: 'next' }
    | { type: 'endHole' }

export type ServerMsg = 
    | { type: 'room', code: string, settings: RoomSettings, players: Player[], yourId: string, yourToken: string, hostId: string, roomPhase: RoomPhase, isPublic: boolean, pieces: GreenPiece[], holeIndex: number, scores: Record<string, (number | null)[]>, holeDone: boolean, pickedUp: string[] }
    | { type: 'error', reason: 'notFound' | 'full' }
    | { type: 'pong', id: number }
    | { type: 'state', time: number, balls: BallState[], breaks: [number, number][] }

export type RoomPhase = 'lobby' | 'playing'
export type BallState = { id: string, x: number, y: number, layer: number, moving: boolean, holed: boolean, strokes: number, done: boolean, holedTime: number, sinkTime: number, drifting: boolean, vx: number, vy: number, airTime: number, airTotal: number, airPeak: number, lastX: number, lastY: number, lastLayer: number, cupX: number, cupY: number, portal: number, seq: number }