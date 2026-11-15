import { type Player, type RoomSettings, type RoomPhase, type Hole, type HoleData, type Ball, type GreenPiece } from '@holey/shared'
import { type WebSocket } from 'ws'

export type Member = {
    player: Player
    socket: WebSocket | null
    token: string
    seq: number
    gone: ReturnType<typeof setTimeout> | null
}

export type Room = {
    code: string
    public: boolean
    settings: RoomSettings
    hostId: string
    players: Map<string, Member>,
    phase: RoomPhase
    hole: Hole | null
    holeData: HoleData | null
    holeIndex: number
    balls: Map<string, Ball>
    pieces: Map<string, GreenPiece>
    scores: Map<string, (number | null)[]>
    pickedUp: Set<string>
    holeDone: boolean
}