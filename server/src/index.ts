import { WebSocketServer } from 'ws'
import { http } from './http'

import { makeMember, send, sendRoom, sendState } from './utilities'
import { type Member, type Room } from './types'
import { parseClientMsg } from './validate'
import { COURSES, DEFAULT_COURSE, holeRange, practiceGreenWith, canPlace, buildHole, maxPlayers, Ball, type HoleData } from '@holey/shared'

const PORT = Number(process.env.PORT) || 3001
const wss = new WebSocketServer({ server: http, path: '/ws' })
http.listen(PORT)

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

function rebuildGreen(room: Room): void {
    if(room.phase !== 'lobby' || !room.hole) return

    const data = practiceGreenWith([...room.pieces.values()])
    const hole = buildHole(data, null).hole

    hole.balls = room.hole.balls
    hole.collideBalls = room.hole.collideBalls
    room.hole = hole
    room.holeData = data
}

const RESPAWN_DELAY = 1.2
const REJOIN_GRACE = 60_000

function respawnHoled(room: Room): void {
    const hole = room.hole
    if(room.phase !== 'lobby' || !hole || !room.holeData) return

    for(const [id, ball] of room.balls){
        if(!ball.holed() || ball.holedTime < RESPAWN_DELAY) continue

        const angle = Math.random() * Math.PI * 2
        const dist = 20 + Math.random() * 25
        const fresh = new Ball(room.holeData.tee.x + Math.cos(angle) * dist, room.holeData.tee.y + Math.sin(angle) * dist, ball.cosmetics)

        room.balls.set(id, fresh)
        hole.balls = hole.balls.map(b => b === ball ? fresh : b)
    }
}

function setHole(room: Room, data: HoleData): void {
    room.pickedUp = new Set()
    room.holeDone = false
    room.hole = buildHole(data, null).hole
    room.hole.collideBalls = room.settings.collision
    room.holeData = data
    room.balls = new Map()

    for(const member of room.players.values()){
        addBall(room, member)
    }
}

function courseOf(room: Room) {
    return COURSES[room.settings.course]
}

function startScores(room: Room, id: string): void {
    const holes = courseOf(room)?.holes.length ?? 0
    room.scores.set(id, Array.from({ length: holes }, () => null))
}

function pickUp(room: Room, id: string, ball: Ball): void {
    room.pickedUp.add(id)
    if(room.hole) room.hole.balls = room.hole.balls.filter(b => b !== ball)
}

function checkHole(room: Room): void {
    const hole = room.hole
    if(room.phase !== 'playing' || room.holeDone || !hole) return

    const strokeCap = room.settings.strokeLimit === null ? null : hole.par + room.settings.strokeLimit
    const outOfTime = room.settings.timeLimit !== null && hole.time >= room.settings.timeLimit

    for(const [id, ball] of room.balls){
        if(room.pickedUp.has(id) || ball.holed()) continue

        const capped = strokeCap !== null && ball.strokes >= strokeCap && !ball.isMoving() && !ball.sinking()
        if(capped || outOfTime) pickUp(room, id, ball)
    }

    const settled = (id: string, ball: Ball) => ball.finished() || room.pickedUp.has(id)
    if(![...room.balls].every(([id, ball]) => settled(id, ball))) return

    for(const [id, ball] of room.balls){
        const card = room.scores.get(id)
        if(!card) continue

        const score = room.pickedUp.has(id) ? Math.max(ball.strokes, hole.par) + 1 : ball.strokes
        card[room.holeIndex] = strokeCap === null ? score : Math.min(score, strokeCap + 1)
    }

    room.holeDone = true
    sendRoom(room)
}

function backToLobby(room: Room): void {
    room.phase = 'lobby'
    room.holeIndex = 0
    room.scores = new Map()
    setHole(room, practiceGreenWith([...room.pieces.values()]))
}

function makeRoom(member: Member, isPublic: boolean): Room {
    const room: Room = {
        code: makeCode(),
        public: isPublic,
        settings: {
            collision: false,
            course: DEFAULT_COURSE,
            strokeLimit: null,
            timeLimit: null,
            holes: 'all'
        },
        hostId: member.player.id,
        players: new Map([[member.player.id, member]]),
        phase: 'lobby',
        hole: null,
        holeData: null,
        holeIndex: 0,
        balls: new Map(),
        pieces: new Map(),
        scores: new Map(),
        pickedUp: new Set(),
        holeDone: false
    }

    setHole(room, practiceGreenWith([]))
    rooms.set(room.code, room)
    return room
}

function removeMember(room: Room, myId: string): void {
    const member = room.players.get(myId)
    if(!member) return
    if(member.gone) clearTimeout(member.gone)

    const myBall = room.balls.get(myId)

    room.players.delete(myId)
    room.balls.delete(myId)
    room.scores.delete(myId)
    room.pickedUp.delete(myId)
    if(room.hole) {
        room.hole.balls = room.hole.balls.filter(b => b !== myBall)
    }
    if(room.pieces.delete(myId)) rebuildGreen(room)

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

wss.on('connection', socket => {
    //once for every connection

    let mine: { room: Room, member: Member } | null = null

    function leaveRoom(): void {
        if(!mine) return

        const { room, member } = mine
        mine = null
        removeMember(room, member.player.id)
    }

    function disconnect(): void {
        if(!mine || mine.member.socket !== socket) return

        const { room, member } = mine
        mine = null

        if(room.phase !== 'playing'){
            removeMember(room, member.player.id)
            return
        }

        member.socket = null
        member.gone = setTimeout(() => removeMember(room, member.player.id), REJOIN_GRACE)
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

                const room = makeRoom(member, false)

                mine = { room, member }

                sendRoom(room)
            break }


            case 'quickplay': {
                if(mine) break

                const member = makeMember(msg.name, msg.cosmetics, socket)
                const open = [...rooms.values()].find(r => r.public && r.phase === 'lobby' && r.players.size < maxPlayers)

                if(open){
                    open.players.set(member.player.id, member)
                    addBall(open, member)
                    mine = { room: open, member }
                    sendRoom(open)
                    break
                }

                const room = makeRoom(member, true)
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

                const returning = msg.token ? [...room.players.values()].find(m => m.token === msg.token) : undefined
                if(returning){
                    if(returning.gone) clearTimeout(returning.gone)
                    returning.gone = null
                    returning.socket = socket
                    mine = { room, member: returning }
                    sendRoom(room)
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
                if(room.phase === 'playing') startScores(room, member.player.id)
                mine = { room, member }
                sendRoom(room)
            break }


            //Something about the room settings updates
            case 'update': { 
                if(!mine) break

                if(mine.member.player.id !== mine.room.hostId) break

                mine.room.settings = msg.settings

                if(mine.room.hole) mine.room.hole.collideBalls = msg.settings.collision

                sendRoom(mine.room)

            break }

            //Start the game
            case 'start': { 
                if(!mine) break

                if(mine.member.player.id !== mine.room.hostId) break

                if(mine.room.phase !== 'lobby') break


                const room = mine.room
                const course = courseOf(room)
                if(!course) break

                const [first] = holeRange(course.holes.length, room.settings.holes)
                const holeData = course.holes[first]
                if(!holeData) break

                room.holeIndex = first
                setHole(room, holeData)
                room.phase = 'playing'
                room.scores = new Map()
                for(const id of room.players.keys()) startScores(room, id)

                sendRoom(room)

            break }

            //Shoot the ball
            case 'shoot': { 
                if(!mine) break

                if(!mine.room.hole) break
                if(mine.room.holeDone || mine.room.pickedUp.has(mine.member.player.id)) break

                const ball = mine.room.balls.get(mine.member.player.id)
                if(!ball) break

                if(ball.isMoving() || ball.holed() || ball.sinking()) break

                ball.shoot(Math.cos(msg.angle), Math.sin(msg.angle), msg.power)

            break }


            //Drop or move your obstacle on the practice green
            case 'place': {
                if(!mine) break

                const room = mine.room
                if(room.phase !== 'lobby') break
                if(!canPlace(msg.x, msg.y)) break

                const player = mine.member.player
                room.pieces.set(player.id, { owner: player.id, kind: player.obstacle, x: msg.x, y: msg.y })
                rebuildGreen(room)

                sendRoom(room)

            break }

            case 'next': {
                if(!mine) break

                const room = mine.room
                if(mine.member.player.id !== room.hostId) break
                if(room.phase !== 'playing' || !room.holeDone) break

                const course = courseOf(room)
                const [, last] = holeRange(course?.holes.length ?? 0, room.settings.holes)
                const nextData = room.holeIndex < last ? course?.holes[room.holeIndex + 1] : undefined
                if(nextData){
                    room.holeIndex++
                    setHole(room, nextData)
                }
                else backToLobby(room)

                sendRoom(room)

            break }

            case 'endHole': {
                if(!mine) break

                const room = mine.room
                if(mine.member.player.id !== room.hostId) break
                if(room.phase !== 'playing' || room.holeDone) break

                for(const [id, ball] of room.balls){
                    if(!ball.holed() && !room.pickedUp.has(id)) pickUp(room, id, ball)
                }

            break }

            //Leave room, disconnect, whatever
            case 'leave': { 
                leaveRoom()
            break }

            default:
                return null
        }
    })

    socket.on('close', disconnect)
    
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

    for(const room of rooms.values()){
        respawnHoled(room)
        checkHole(room)
    }
}, 1000 / 60)

setInterval(() => {
    for(const room of rooms.values()){
        sendState(room)
    }
}, 1000 / 20)

console.log(`server on :${PORT}`)