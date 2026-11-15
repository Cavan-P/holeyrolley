import { Ball, Breakable, type BallState, type CourseData, type Hole, type ServerMsg } from '@holey/shared'
import { Camera } from './classes/Camera'
import { createGrassPattern } from './art/grass'
import { getTheme } from './art/themes'
import { drawAim } from './art/aim'
import { drawBackdrop } from './art/backdrop'
import { drawMinimap } from './art/minimap'
import { burst, stepParticles } from './art/celebrations'
import { buildHole } from './build'
import { setupInput } from './input'
import { drawNameTag } from './lobby'
import { clearStates, getRtt, getStates, getSnapshot, send } from '../network/connection'
import { getPrefs } from '../settings/store'
import { ballSounds, sfx } from '../audio/sfx'

const STEP = 1 / 120
const LEAD = 0.02
const MAX_REPLAY = 0.6
const SMOOTH_LIMIT = 120
const SMOOTH_RATE = 12

type StateMsg = Extract<ServerMsg, { type: 'state' }>

export type PartyStatus = {
    strokes: number
    time: number
    done: boolean
    watching: string | null
}

type Track = {
    ball: Ball
    server: BallState
    wasHoled: boolean
    ox: number
    oy: number
}

type Shot = { seq: number, angle: number, power: number, at: number }

let lastSeq = 0

function adopt(ball: Ball, s: BallState, hole: Hole): void {
    ball.x = s.x
    ball.y = s.y
    ball.vx = s.vx
    ball.vy = s.vy
    ball.layer = s.layer
    ball.strokes = s.strokes
    ball.holedTime = s.holedTime
    ball.sinkTime = s.sinkTime
    ball.drifting = s.drifting
    ball.airTime = s.airTime
    ball.airTotal = s.airTotal
    ball.airPeak = s.airPeak
    ball.lastX = s.lastX
    ball.lastY = s.lastY
    ball.lastLayer = s.lastLayer
    ball.cupX = s.cupX
    ball.cupY = s.cupY
    ball.portal = s.portal >= 0 ? hole.portals[s.portal] ?? null : null
}

const canShoot = (b: Ball) => !b.isMoving() && !b.holed() && !b.sinking()

export function startPartyGame(canvas: HTMLCanvasElement, course: CourseData, holeIndex: number, onStatus: (s: PartyStatus) => void) {
    const ctx = canvas.getContext('2d')
    if(!ctx) throw new Error('2D canvas not supported')

    const data = course.holes[holeIndex]
    if(!data) throw new Error('No such hole')

    clearStates()

    let frameId = 0
    let last = performance.now()
    let overview = false
    let watchIndex = 0

    const theme = getTheme(course.theme)
    const view = buildHole(data, course, null)
    const hole = view.hole
    hole.balls = []
    const grass = createGrassPattern(ctx, theme.turf, theme.turfStripe)
    const breakables = hole.walls.filter((w): w is Breakable => w instanceof Breakable)

    const tracks = new Map<string, Track>()
    let pending: Shot[] = []
    let applied = new Set<number>()
    let base: number | null = null
    let lastArrival = -1
    const sounds = ballSounds()

    const camera = new Camera(0, 0, canvas.clientWidth, canvas.clientHeight)
    camera.snapTo(data.tee.x, data.tee.y)

    const myId = () => getSnapshot().room?.yourId
    const mineTrack = () => {
        const id = myId()
        return id ? tracks.get(id) : undefined
    }
    const nameOf = (id: string) => getSnapshot().room?.players.find(p => p.id === id)?.name ?? ''
    const visible = () => [...tracks].filter(([, t]) => !t.server.done)
    const now = () => performance.now() / 1000 + (base ?? 0) + getRtt() + LEAD

    const shootDue = () => {
        const mine = mineTrack()
        if(!mine) return
        for(const s of pending){
            if(applied.has(s.seq) || s.at > hole.time + STEP / 2) continue
            applied.add(s.seq)
            if(canShoot(mine.ball)) mine.ball.shoot(Math.cos(s.angle), Math.sin(s.angle), s.power)
        }
    }

    const advance = (steps: number) => {
        hole.balls = visible().map(([, t]) => t.ball)
        hole.collideBalls = getSnapshot().room?.settings.collision ?? false
        for(let i = 0; i < steps; i++){
            shootDue()
            hole.update(STEP)
        }
    }

    const rewind = (msg: StateMsg) => {
        const seen = new Map([...tracks].map(([id, t]) => [id, { x: t.ball.x + t.ox, y: t.ball.y + t.oy }]))
        const id = myId()

        for(const s of msg.balls){
            let t = tracks.get(s.id)
            if(!t){
                const player = getSnapshot().room?.players.find(p => p.id === s.id)
                if(!player) continue
                t = { ball: new Ball(s.x, s.y, player.cosmetics), server: s, wasHoled: s.holed, ox: 0, oy: 0 }
                tracks.set(s.id, t)
                if(s.id === id) camera.snapTo(s.x, s.y)
            }
            t.server = s
            adopt(t.ball, s, hole)
            if(s.id === id) pending = pending.filter(p => p.seq > s.seq)
        }

        for(const bid of tracks.keys()){
            if(!msg.balls.some(b => b.id === bid)) tracks.delete(bid)
        }

        msg.breaks.forEach(([left, broken], i) => {
            const b = breakables[i]
            if(!b) return
            b.left = left
            b.broken = broken
        })

        hole.setTime(msg.time)
        applied = new Set()
        advance(Math.round(Math.min(MAX_REPLAY, Math.max(0, now() - msg.time)) / STEP))

        for(const [bid, t] of tracks){
            const was = seen.get(bid)
            t.ox = was ? was.x - t.ball.x : 0
            t.oy = was ? was.y - t.ball.y : 0
            if(Math.hypot(t.ox, t.oy) > SMOOTH_LIMIT){
                t.ox = 0
                t.oy = 0
            }
        }
    }

    const input = setupInput({
        canvas,
        camera,
        origin: () => mineTrack()?.ball ?? { x: 0, y: 0 },
        canAim: () => {
            const t = mineTrack()
            return !!t && !pending.length && canShoot(t.ball) && t.ball.airTime <= 0 && !t.server.done && !overview
        },
        onShoot: ({ dx, dy, power }) => {
            const t = mineTrack()
            if(!t) return
            const angle = Math.atan2(dy, dx)
            const seq = lastSeq = Math.max(lastSeq + 1, Date.now())
            pending.push({ seq, angle, power, at: hole.time })
            shootDue()
            send({ type: 'shoot', angle, power, seq })
        }
    })

    let lastStatus = ''

    const frame = (time: number) => {
        const dt = Math.min((time - last) / 1000, 0.1)
        last = time

        const latest = getStates().at(-1)
        const id = myId()

        if(latest && latest.at !== lastArrival){
            lastArrival = latest.at
            const sample = latest.msg.time - latest.at / 1000
            base = base === null ? sample : base + (sample - base) * 0.1
            rewind(latest.msg)
        }
        else if(base !== null){
            const behind = now() - hole.time
            if(behind > 0) advance(Math.min(Math.floor(behind / STEP), 12))
        }

        const fade = Math.exp(-dt * SMOOTH_RATE)
        for(const [bid, t] of tracks){
            t.ox *= fade
            t.oy *= fade

            if(t.ball.holed() && !t.wasHoled){
                if(!getPrefs().reduceMotion) view.particles.push(...burst(t.ball.cosmetics.celebration, t.ball.cupX, t.ball.cupY))
                if(bid !== id) sfx.cup(0.5)
            }
            t.wasHoled = t.ball.holed()
        }

        const mine = mineTrack()
        if(mine) sounds(mine.ball)
        view.particles = stepParticles(view.particles, dt)

        const focusId = (): string | undefined => {
            if(id && mine && !mine.server.done) return id
            const others = visible().map(([k]) => k)
            if(!others.length) return id
            return others[watchIndex % others.length]
        }
        const focus = focusId()
        const target = focus ? tracks.get(focus) : undefined

        if(overview){
            const b = hole.bounds
            camera.targetX = b.x + b.w / 2
            camera.targetY = b.y + b.h / 2
            camera.targetZoom = camera.fitZoom(b)
        }
        else {
            if(target && !target.server.done) camera.follow(target.ball, dt)
            camera.targetZoom = 1
        }
        camera.update(dt)

        const status: PartyStatus = {
            strokes: mine?.ball.strokes ?? 0,
            time: Math.floor(hole.time),
            done: !!mine?.server.done,
            watching: focus && focus !== id ? nameOf(focus) : null
        }
        const key = JSON.stringify(status)
        if(key !== lastStatus){
            lastStatus = key
            onStatus(status)
        }

        camera.begin(ctx)
        const visArea = camera.visibleRect()
        ctx.fillStyle = theme.scenery
        ctx.fillRect(visArea.x, visArea.y, visArea.w, visArea.h)
        drawBackdrop(ctx, theme, visArea, hole.time)

        const shown = visible()
        for(const [, t] of shown){
            t.ball.x += t.ox
            t.ball.y += t.oy
        }

        view.drawGround(ctx, grass)
        view.draw(ctx, target?.ball)

        if(getPrefs().nameTags){
            for(const [bid, t] of shown) drawNameTag(ctx, t.ball.x, t.ball.y, nameOf(bid), camera.zoom)
        }

        for(const [, t] of shown){
            t.ball.x -= t.ox
            t.ball.y -= t.oy
        }

        const aim = input.aim()
        if(aim && mine && getPrefs().aimGuide) drawAim(ctx, mine.ball, aim)

        camera.end(ctx)

        if(getPrefs().minimap) drawMinimap(ctx, view, camera, theme)

        frameId = requestAnimationFrame(frame)
    }
    frameId = requestAnimationFrame(frame)

    const resize = () => {
        const dpr = window.devicePixelRatio || 1
        canvas.width = window.innerWidth * dpr
        canvas.height = window.innerHeight * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        camera.viewW = window.innerWidth
        camera.viewH = window.innerHeight
    }
    resize()

    const onKey = (e: KeyboardEvent) => {
        if(e.key !== 'Tab') return
        e.preventDefault()
        overview = e.type === 'keydown'
    }
    const onBlur = () => { overview = false }

    window.addEventListener('resize', resize)
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    window.addEventListener('blur', onBlur)

    return {
        setOverview: (on: boolean) => { overview = on },
        watchNext: () => { watchIndex++ },
        dispose: () => {
            cancelAnimationFrame(frameId)
            window.removeEventListener('resize', resize)
            window.removeEventListener('keydown', onKey)
            window.removeEventListener('keyup', onKey)
            window.removeEventListener('blur', onBlur)
            input.dispose()
        }
    }
}
