import { WebSocketServer } from 'ws'

import { makeMember, send, sendRoom } from './utilities'
import { type Member, type Room } from './types'
import { parseClientMsg } from './validate'

const wss = new WebSocketServer({ port: 3001 })
const maxPlayers = 4

const rooms = new Map<string, Room>()

function makeCode(): string {
    let c: string
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

    do {
        c = ''
        for(let i = 0; i < 4; i++){
            c += chars.charAt(Math.floor(Math.random() * chars.length))
        }
    } while (rooms.has(c))

    return c
}

wss.on('connection', socket => {
    //once for every connection

    let mine: { room: Room, member: Member } | null = null

    function leaveRoom(): void {
        if(!mine) return

        const room = mine.room
        const myId = mine.member.player.id

        mine = null

        room.players.delete(myId)

        if(!room.players.size){
            rooms.delete(room.code)
            return
        }

        if(room.hostId === myId){
            const nextHost = room.players.keys().next().value
            if(nextHost) room.hostId = nextHost
        }

        sendRoom(room)
    }

    socket.on('message', data => {
        //Once for every message that this tab sends
        let attempt: unknown

        try {
            attempt = JSON.parse(data.toString())
        }
        catch { return }

        const msg = parseClientMsg(attempt)
        if(!msg) return

        console.log('Got: ' + msg.type)

        switch(msg.type){
            //CREATE ROOM
            case 'create': {
                if(mine) break

                const member = makeMember(msg.name, msg.cosmetics, socket)

                const room: Room = {
                    code: makeCode(),
                    settings: {
                        collision: false
                    },
                    hostId: member.player.id,
                    players: new Map([[member.player.id, member]])
                }

                rooms.set(room.code, room)

                mine = { room, member }

                sendRoom(room)
            break }


            //JOIN ROOM
            case 'join': {
                if(mine) break

                const attemptRoom = msg.room.toUpperCase().trim()
                const room = rooms.get(attemptRoom)

                if(!room){
                    send(socket, {
                        type: 'error',
                        reason: 'notFound'
                    })

                    break
                }

                if(room.players.size >= maxPlayers){
                    send(socket, {
                        type: 'error',
                        reason: 'full'
                    })

                    break
                }
                

                const member = makeMember(msg.name, msg.cosmetics, socket)

                room.players.set(member.player.id, member)
                mine = { room, member }
                sendRoom(room)
            break }


            //Something about the room settings updates
            case 'update': { 
                if(!mine) break

                if(mine.member.player.id !== mine.room.hostId) break

                mine.room.settings = {
                    collision: msg.settings.collision
                }

                sendRoom(mine.room)

            break }


            //Leave room, disconnect, whatever
            case 'leave': { 
                leaveRoom()
            break }

            default:
                return null
        }
    })

    socket.on('close', leaveRoom)
    
})
console.log('server on :3001')