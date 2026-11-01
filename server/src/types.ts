import { type Player, type RoomSettings } from '@holey/shared'
import { type WebSocket } from 'ws'

export type Member = {
    player: Player
    socket: WebSocket
}

export type Room = {
    code: string
    settings: RoomSettings
    hostId: string
    players: Map<string, Member>
}