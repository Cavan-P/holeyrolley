import { type Player, type RoomSettings, type RoomPhase, type Hole, type HoleData, type Ball, type GreenPiece } from '@holey/shared'
import { type WebSocket } from 'ws'

export type Member = {
    player: Player
    socket: WebSocket
}

export type Room = {
    code: string
    settings: RoomSettings
    hostId: string
    players: Map<string, Member>,
    phase: RoomPhase
    hole: Hole | null
    holeData: HoleData | null
    holeIndex: number
    balls: Map<string, Ball>
    pieces: Map<string, GreenPiece>
}