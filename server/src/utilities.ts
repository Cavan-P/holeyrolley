import type { Cosmetics, ServerMsg } from '@holey/shared';
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
            hostId: room.hostId
        })
    }
}

export function makeMember(name: string, cosmetics: Cosmetics, socket: WebSocket): Member {
    return {
        player: {
            id: randomUUID(),
            name,
            cosmetics
        },
        socket
    }
}