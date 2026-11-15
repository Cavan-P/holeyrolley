import { WebSocketServer } from 'ws'

import { makeMember, send, sendRoom, sendState } from './utilities'
import { type Member, type Room } from './types'
import { parseClientMsg } from './validate'
import { darkwoodMeadows, practiceGreen, buildHole, maxPlayers, Ball, type HoleData } from '@holey/shared'

const wss = new WebSocketServer({ port: 3001 })

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

const SPAWN_OFFSETS = [[-18, -18], [18, -18], [-18, 18], [18, 18]] as const

function addBall(room: Room, member: Member): void {
    if(!room.hole || !room.holeData) return

    const [ox, oy] = SPAWN_OFFSETS[room.hole.balls.length % SPAWN_OFFSETS.length] ?? [0, 0]
    const ball = new Ball(room.holeData.tee.x + ox, room.holeData.tee.y + oy, member.player.cosmetics)

    room.hole.balls.push(ball)
    room.balls.set(member.player.id, ball)
}

function setHole(room: Room, data: HoleData): void {
    room.hole = buildHole(data, null).hole
    room.hole.collideBalls = room.settings.collision
    room.holeData = data
    room.balls = new Map()

    for(const member of room.players.values()){
        addBall(room, member)
    }
}

wss.on('connection', socket => {
    //once for every connection

    let mine: { room: Room, member: Member } | null = null

    function leaveRoom(): void {
        if(!mine) return

        const room = mine.room
        const myId = mine.member.player.id
        const myBall = room.balls.get(myId)

        mine = null

        room.players.delete(myId)
        room.balls.delete(myId)
        if(room.hole) {
            room.hole.balls = room.hole.balls.filter(b => b !== myBall)
        }

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
                    players: new Map([[member.player.id, member]]),
                    phase: 'lobby',
                    hole: null,
                    holeData: null,
                    holeIndex: 0,
                    balls: new Map()
                }

                setHole(room, practiceGreen)

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
                addBall(room, member)
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

                if(mine.room.hole) mine.room.hole.collideBalls = msg.settings.collision

                sendRoom(mine.room)

            break }

            //Start the game
            case 'start': { 
                if(!mine) break

                if(mine.member.player.id !== mine.room.hostId) break

                if(mine.room.phase !== 'lobby') break


                const holeData = darkwoodMeadows.holes[mine.room.holeIndex]
                if(!holeData) break

                const room = mine.room

                setHole(room, holeData)
                room.phase = 'playing'

                sendRoom(room)

            break }

            //Shoot the ball
            case 'shoot': { 
                if(!mine) break

                if(!mine.room.hole) break

                const ball = mine.room.balls.get(mine.member.player.id)
                if(!ball) break

                if(ball.isMoving() || ball.holed() || ball.sinking()) break

                ball.shoot(Math.cos(msg.angle), Math.sin(msg.angle), msg.power)

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

const STEP = 1/120
let last = performance.now()
let acc = 0

setInterval(() => {
    const now = performance.now()
    acc += Math.min((now - last) / 1000, 0.25)
    last = now

    while(acc >= STEP){
        for(const room of rooms.values()){
            if(room.hole){
                room.hole.update(STEP)
            }
        }
        acc -= STEP
    }
}, 1000 / 60)

setInterval(() => {
    for(const room of rooms.values()){
        sendState(room)
    }
}, 1000 / 20)

console.log('server on :3001')