import { Breakable, OBSTACLE_KINDS, type Cosmetics, type ServerMsg } from '@holey/shared';
import { type WebSocket } from 'ws'
import type { Member, Room } from './types';
import { randomUUID } from 'node:crypto';

export function send(socket: WebSocket | null, msg: ServerMsg): void {
    socket?.send(JSON.stringify(msg))
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
            yourToken: member.token,
            hostId: room.hostId,
            roomPhase: room.phase,
            isPublic: room.public,
            pieces: [...room.pieces.values()],
            holeIndex: room.holeIndex,
            scores: Object.fromEntries(room.scores),
            holeDone: room.holeDone,
            pickedUp: [...room.pickedUp]
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
        holed: b.holed(),
        strokes: b.strokes,
        done: b.finished() || room.pickedUp.has(id),
        holedTime: b.holedTime,
        sinkTime: b.sinkTime,
        drifting: b.drifting,
        vx: b.vx,
        vy: b.vy,
        airTime: b.airTime,
        airTotal: b.airTotal,
        airPeak: b.airPeak,
        lastX: b.lastX,
        lastY: b.lastY,
        lastLayer: b.lastLayer
    }))

    const breaks = room.hole.walls.flatMap(w => w instanceof Breakable ? [[w.left, w.broken] as [number, number]] : [])

    const msg: ServerMsg = {
        type: 'state',
        time: room.hole.time,
        balls,
        breaks
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
        socket,
        token: randomUUID(),
        gone: null
    }
}