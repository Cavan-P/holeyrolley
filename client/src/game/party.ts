import { Ball, Breakable, lerp, type BallState, type CourseData } from '@holey/shared'
import { Camera } from './classes/Camera'
import { createGrassPattern } from './art/grass'
import { getTheme } from './art/themes'
import { drawAim } from './art/aim'
import { drawBackdrop } from './art/backdrop'
import { drawMinimap } from './art/minimap'
import { burst, stepParticles } from './art/celebrations'
import { buildHole } from './build'
import { setupInput } from './input'
import { bracket, drawNameTag } from './lobby'
import { clearStates, getStates, getSnapshot, send } from '../network/connection'
import { getPrefs } from '../settings/store'
import { ballSounds, sfx } from '../audio/sfx'

const INTERP_DELAY = 100
const STEP = 1 / 120
const RESYNC_AFTER = 1.5

export type PartyStatus = {
    strokes: number
    time: number
    done: boolean
    watching: string | null
}

function adopt(ball: Ball, s: BallState): void {
    ball.x = s.x
    ball.y = s.y
    ball.vx = 0
    ball.vy = 0
    ball.layer = s.layer
    ball.strokes = s.strokes
    ball.holedTime = s.holedTime
    ball.sinkTime = s.sinkTime
    ball.drifting = s.drifting
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

    const balls = new Map<string, Ball>()
    const done = new Map<string, boolean>()
    const hidden = new Map<string, boolean>()

    let mine: Ball | null = null
    let server: BallState | null = null
    let restFor = 0
    let clock: number | null = null
    let lastArrival = -1
    const sounds = ballSounds()

    const camera = new Camera(0, 0, canvas.clientWidth, canvas.clientHeight)
    camera.snapTo(data.tee.x, data.tee.y)

    const myId = () => getSnapshot().room?.yourId
    const nameOf = (id: string) => getSnapshot().room?.players.find(p => p.id === id)?.name ?? ''

    const atRest = (b: Ball) => !b.isMoving() && !b.sinking() && b.airTime <= 0

    const focusId = (): string | undefined => {
        const id = myId()
        if(id && balls.has(id) && !done.get(id)) return id

        const others = [...balls.keys()].filter(k => !done.get(k))
        if(!others.length) return id
        return others[watchIndex % others.length]
    }

    const input = setupInput({
        canvas,
        camera,
        origin: () => mine ?? { x: 0, y: 0 },
        canAim: () => !!mine && !!server && atRest(mine) && !mine.holed() && !server.moving && server.strokes >= mine.strokes && !server.done && !overview,
        onShoot: ({ dx, dy, power }) => {
            if(!mine) return
            const angle = Math.atan2(dy, dx)
            mine.shoot(Math.cos(angle), Math.sin(angle), power)
            restFor = 0
            send({ type: 'shoot', angle, power })
        }
    })

    let lastStatus = ''

    const frame = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1)
        last = now

        const states = getStates()
        const latest = states.at(-1)
        const id = myId()

        if(latest){
            if(latest.at !== lastArrival){
                lastArrival = latest.at
                const sample = latest.msg.time - latest.at / 1000
                clock = clock === null ? sample : clock + (sample - clock) * 0.1

                latest.msg.breaks.forEach(([left, broken], i) => {
                    const b = breakables[i]
                    if(!b) return
                    b.left = left
                    b.broken = broken
                })
            }

            const [from, to, t] = bracket(states, now - INTERP_DELAY, latest)

            for(const s of latest.msg.balls){
                let ball = balls.get(s.id)
                if(!ball){
                    const player = getSnapshot().room?.players.find(p => p.id === s.id)
                    if(!player) continue
                    ball = new Ball(s.x, s.y, player.cosmetics)
                    adopt(ball, s)
                    balls.set(s.id, ball)
                    if(s.id === id){
                        mine = ball
                        camera.snapTo(s.x, s.y)
                    }
                }

                hidden.set(s.id, s.done)
                done.set(s.id, s.done)

                if(s.id === id){
                    server = s
                    continue
                }

                const a = from.msg.balls.find(p => p.id === s.id)
                const z = to.msg.balls.find(p => p.id === s.id) ?? s
                const smooth = a && !a.holed && !z.holed
                if(z.holed && !ball.holed()){
                    if(!getPrefs().reduceMotion) view.particles.push(...burst(ball.cosmetics.celebration, z.x, z.y))
                    sfx.cup(0.5)
                }
                ball.x = smooth ? lerp(a.x, z.x, t) : z.x
                ball.y = smooth ? lerp(a.y, z.y, t) : z.y
                ball.layer = z.layer
                ball.strokes = z.strokes
                ball.holedTime = z.holedTime
                ball.sinkTime = z.sinkTime
                ball.drifting = z.drifting
            }

            for(const bid of balls.keys()){
                if(!latest.msg.balls.some(b => b.id === bid)){
                    if(balls.get(bid) === mine) mine = null
                    balls.delete(bid)
                    done.delete(bid)
                    hidden.delete(bid)
                }
            }
        }

        if(mine && server){
            if(server.holed && !mine.holed()) adopt(mine, server)

            if(atRest(mine)){
                restFor += dt
                const serverRest = !server.moving && server.sinkTime < 0
                const caughtUp = server.strokes >= mine.strokes || restFor > RESYNC_AFTER
                const off = Math.hypot(mine.x - server.x, mine.y - server.y) > 0.5 || mine.holed() !== server.holed || mine.strokes !== server.strokes
                if(serverRest && caughtUp && off) adopt(mine, server)
            }
            else restFor = 0
        }

        if(clock !== null){
            const target = now / 1000 + clock
            const behind = target - view.hole.time
            if(behind < -0.1 || behind > 0.5) view.hole.setTime(target)
            else {
                view.hole.balls = mine && !hidden.get(id ?? '') ? [mine] : []
                for(let n = Math.floor(behind / STEP); n > 0; n--) view.update(STEP)
            }
        }

        if(mine) sounds(mine)
        view.hole.balls = [...balls].filter(([bid]) => !hidden.get(bid)).map(([, b]) => b)
        view.particles = stepParticles(view.particles, dt)

        const focus = focusId()
        const target = focus ? balls.get(focus) : undefined

        if(overview){
            const b = view.hole.bounds
            camera.targetX = b.x + b.w / 2
            camera.targetY = b.y + b.h / 2
            camera.targetZoom = camera.fitZoom(b)
        }
        else {
            if(target && !hidden.get(focus!)) camera.follow(target, dt)
            camera.targetZoom = 1
        }
        camera.update(dt)

        const status: PartyStatus = {
            strokes: mine?.strokes ?? 0,
            time: Math.floor(view.hole.time),
            done: !!id && !!done.get(id),
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

        view.drawGround(ctx, grass)
        view.draw(ctx, target)

        if(getPrefs().nameTags){
            for(const [bid, ball] of balls){
                if(!hidden.get(bid)) drawNameTag(ctx, ball.x, ball.y, nameOf(bid), camera.zoom)
            }
        }

        const aim = input.aim()
        if(aim && mine && getPrefs().aimGuide) drawAim(ctx, mine, aim)

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
