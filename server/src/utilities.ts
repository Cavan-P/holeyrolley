import { OBSTACLE_KINDS, type Cosmetics, type ServerMsg } from '@holey/shared';
import { type WebSocket } from 'ws'
import type { Member, Room } from './types';
import { randomUUID } from 'node:crypto';

export function send(socket: WebSocket, msg: ServerMsg): void {
    socket.send(JSON.stringify(msg))
}

export function sendRoom(room: Room): void {
    const players = [...room.players.values()].map(p => p.player)

    for(const member of room.players.values()){
        send(member.socket, {
            type: 'room',
            code: room.code,
            settings: room.settings,
            players: players,
            yourId: member.player.id,
            hostId: room.hostId,
            roomPhase: room.phase,
            pieces: [...room.pieces.values()]
        })
    }
}

export function sendState(room: Room): void {
    if(!room.hole) return
    
    const balls = [...room.balls.entries()].map(([id, b]) => ({
        id,
        x: b.x,
        y: b.y,
        layer: b.layer,
        moving: b.isMoving(),
        holed: b.holed()
    }))

    const msg: ServerMsg = {
        type: 'state',
        time: room.hole.time,
        balls
    }

    for(const member of room.players.values()){
        send(member.socket, msg)
    }
}

export function makeMember(name: string, cosmetics: Cosmetics, socket: WebSocket): Member {
    return {
        player: {
            id: randomUUID(),
            name,
            cosmetics,
            obstacle: OBSTACLE_KINDS[Math.floor(Math.random() * OBSTACLE_KINDS.length)]!
        },
        socket
    }
}