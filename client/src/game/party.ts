import { Ball, Breakable, type BallState, type CourseData } from '@holey/shared'
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
import { clearStates, getStates, getSnapshot, send } from '../network/connection'
import { getPrefs } from '../settings/store'
import { ballSounds, sfx } from '../audio/sfx'

const STEP = 1 / 120
const RESYNC_AFTER = 1.5
const SMOOTH_LIMIT = 120
const SMOOTH_RATE = 12

export type PartyStatus = {
    strokes: number
    time: number
    done: boolean
    watching: string | null
}

type Track = {
    ball: Ball
    server: BallState
    predicting: boolean
    sawMove: boolean
    restFor: number
    wasHoled: boolean
    ox: number
    oy: number
}

function adopt(ball: Ball, s: BallState): void {
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
}

function snap(t: Track, s: BallState): void {
    const seenX = t.ball.x + t.ox
    const seenY = t.ball.y + t.oy
    adopt(t.ball, s)

    t.ox = seenX - t.ball.x
    t.oy = seenY - t.ball.y
    if(Math.hypot(t.ox, t.oy) > SMOOTH_LIMIT || s.holed || s.sinkTime >= 0){
        t.ox = 0
        t.oy = 0
    }
}

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
    view.hole.balls = []
    const grass = createGrassPattern(ctx, theme.turf, theme.turfStripe)
    const breakables = view.hole.walls.filter((w): w is Breakable => w instanceof Breakable)

    const tracks = new Map<string, Track>()
    let clock: number | null = null
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

    const atRest = (b: Ball) => !b.isMoving() && !b.sinking() && b.airTime <= 0
    const inPlay = (b: Ball) => !b.holed() && !b.sinking() && b.airTime <= 0

    const focusId = (): string | undefined => {
        const id = myId()
        if(id && tracks.has(id) && !tracks.get(id)!.server.done) return id

        const others = visible().map(([k]) => k)
        if(!others.length) return id
        return others[watchIndex % others.length]
    }

    const input = setupInput({
        canvas,
        camera,
        origin: () => mineTrack()?.ball ?? { x: 0, y: 0 },
        canAim: () => {
            const t = mineTrack()
            return !!t && !t.predicting && atRest(t.ball) && !t.ball.holed() && !t.server.moving && !t.server.done && !overview
        },
        onShoot: ({ dx, dy, power }) => {
            const t = mineTrack()
            if(!t) return
            const angle = Math.atan2(dy, dx)
            t.ball.shoot(Math.cos(angle), Math.sin(angle), power)
            t.predicting = true
            t.sawMove = false
            t.restFor = 0
            send({ type: 'shoot', angle, power })
        }
    })

    const markHits = () => {
        const list = visible().map(([, t]) => t)
        for(const a of list){
            if(!a.predicting || !inPlay(a.ball)) continue
            for(const b of list){
                if(b === a || b.predicting || !inPlay(b.ball) || a.ball.layer !== b.ball.layer) continue
                if(Math.hypot(a.ball.x - b.ball.x, a.ball.y - b.ball.y) <= a.ball.rad + b.ball.rad + 0.5){
                    b.predicting = true
                    b.sawMove = false
                    b.restFor = 0
                }
            }
        }
    }

    let lastStatus = ''

    const frame = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1)
        last = now

        const latest = getStates().at(-1)
        const id = myId()

        if(latest && latest.at !== lastArrival){
            lastArrival = latest.at
            const sample = latest.msg.time - latest.at / 1000
            clock = clock === null ? sample : clock + (sample - clock) * 0.1

            latest.msg.breaks.forEach(([left, broken], i) => {
                const b = breakables[i]
                if(!b) return
                b.left = left
                b.broken = broken
            })

            for(const s of latest.msg.balls){
                let t = tracks.get(s.id)
                if(!t){
                    const player = getSnapshot().room?.players.find(p => p.id === s.id)
                    if(!player) continue
                    const ball = new Ball(s.x, s.y, player.cosmetics)
                    adopt(ball, s)
                    t = { ball, server: s, predicting: false, sawMove: false, restFor: 0, wasHoled: s.holed, ox: 0, oy: 0 }
                    tracks.set(s.id, t)
                    if(s.id === id) camera.snapTo(s.x, s.y)
                }

                t.server = s
                if(t.predicting){
                    if(s.moving) t.sawMove = true
                    if(s.holed && !t.ball.holed()){
                        snap(t, s)
                        t.predicting = false
                    }
                }
                else snap(t, s)
            }

            for(const bid of tracks.keys()){
                if(!latest.msg.balls.some(b => b.id === bid)) tracks.delete(bid)
            }
        }

        for(const [bid, t] of tracks){
            if(!t.predicting) continue
            if(!atRest(t.ball)){
                t.restFor = 0
                continue
            }

            t.restFor += dt
            const serverRest = !t.server.moving && t.server.sinkTime < 0 && t.server.airTime <= 0
            const caughtUp = bid === id ? t.server.strokes >= t.ball.strokes : t.sawMove
            if((serverRest && caughtUp) || t.restFor > RESYNC_AFTER){
                snap(t, t.server)
                t.predicting = false
            }
        }

        if(clock !== null){
            const target = now / 1000 + clock
            const behind = target - view.hole.time
            view.hole.collideBalls = getSnapshot().room?.settings.collision ?? false
            view.hole.balls = visible().map(([, t]) => t.ball)

            if(behind < -0.1 || behind > 0.5) view.hole.setTime(target)
            else {
                for(let n = Math.floor(behind / STEP); n > 0; n--){
                    view.hole.update(STEP)
                    if(view.hole.collideBalls) markHits()
                }
            }
        }

        const fade = Math.exp(-dt * SMOOTH_RATE)
        for(const [bid, t] of tracks){
            t.ox *= fade
            t.oy *= fade

            if(t.ball.holed() && !t.wasHoled){
                if(!getPrefs().reduceMotion) view.particles.push(...burst(t.ball.cosmetics.celebration, t.ball.x, t.ball.y))
                if(bid !== id) sfx.cup(0.5)
            }
            t.wasHoled = t.ball.holed()
        }

        const mine = mineTrack()
        if(mine) sounds(mine.ball)
        view.particles = stepParticles(view.particles, dt)

        const focus = focusId()
        const target = focus ? tracks.get(focus) : undefined

        if(overview){
            const b = view.hole.bounds
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
            time: Math.floor(view.hole.time),
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
        drawBackdrop(ctx, theme, visArea, view.hole.time)

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
