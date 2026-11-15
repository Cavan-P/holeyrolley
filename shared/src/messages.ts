import { type Cosmetics } from './cosmetics'

export const maxNameLength = 16
export const maxPlayers = 4

export type Player = {
    id: string,
    name: string,
    cosmetics: Cosmetics
}

export type RoomSettings = {
    collision: boolean
}

export type ClientMsg = 
    | { type: 'join', room: string, name: string, cosmetics: Cosmetics }
    | { type: 'create', name: string, cosmetics: Cosmetics }

    | { type: 'leave' }
    | { type: 'shoot', angle: number, power: number }
    | { type: 'update', settings: RoomSettings }
    | { type: 'start'}

export type ServerMsg = 
    | { type: 'room', code: string, settings: RoomSettings, players: Player[], yourId: string, hostId: string, roomPhase: RoomPhase }
    | { type: 'error', reason: 'notFound' | 'full' }

export type RoomPhase = 'lobby' | 'playing'