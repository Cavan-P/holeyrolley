import { darkwoodMeadows, practiceGreen, Ball, clamp, lerp } from '@holey/shared'
import { Camera } from './classes/Camera'
import { createGrassPattern } from './art/grass'
import { getTheme } from './art/themes'
import { drawAim } from './art/aim'
import { buildHole } from './build'
import { setupInput } from './input'
import { getStates, getSnapshot, send, type TimedState } from '../network/connection'
import { getPrefs } from '../settings/store'

const INTERP_DELAY = 100

export function startLobby(canvas: HTMLCanvasElement): { dispose: () => void } {
    const ctx = canvas.getContext('2d')

    if(!ctx) throw new Error('2D canvas not supported')

    let frameId = 0
    const balls = new Map<string, Ball>()
    const names = new Map<string, string>()
    let myMoving = false

    const theme = getTheme(darkwoodMeadows.theme)
    const view = buildHole(practiceGreen, darkwoodMeadows, null)
    const grass = createGrassPattern(ctx, theme.turf, theme.turfStripe)

    const b = view.hole.bounds
    const camera = new Camera(0, 0, canvas.clientWidth, canvas.clientHeight)
    camera.snapTo(b.x + b.w / 2, b.y + b.h / 2)

    const myBall = () => {
        const id = getSnapshot().room?.yourId
        return id ? balls.get(id) : undefined
    }

    const input = setupInput({
        canvas,
        camera,
        origin: () => myBall() ?? { x: 0, y: 0 },
        canAim: () => myBall() !== undefined && !myMoving,
        onShoot: ({ dx, dy, power }) => send({ type: 'shoot', angle: Math.atan2(dy, dx), power })
    })

    const frame = () => {
        const states = getStates()
        const latest = states.at(-1)
        if(latest){
            const state = latest.msg
            const myId = getSnapshot().room?.yourId
            const [from, to, t] = bracket(states, performance.now() - INTERP_DELAY, latest)

            for(const s of state.balls){
                let ball = balls.get(s.id)

                if(!ball){
                    const player = getSnapshot().room?.players.find(p => p.id === s.id)
                    if(!player) continue

                    ball = new Ball(s.x, s.y, player.cosmetics)
                    balls.set(s.id, ball)
                    names.set(s.id, player.name)
                }
                const a = from.msg.balls.find(p => p.id === s.id)
                const z = to.msg.balls.find(p => p.id === s.id)
                ball.x = a && z ? lerp(a.x, z.x, t) : s.x
                ball.y = a && z ? lerp(a.y, z.y, t) : s.y
                ball.layer = s.layer

                if(s.id === myId) myMoving = s.moving
            }

            for(const id of balls.keys()){
                if(!state.balls.some(b => b.id === id)){
                    balls.delete(id)
                    names.delete(id)
                }
            }

            view.hole.balls = [...balls.values()]
        }

        ctx.fillStyle = theme.scenery
        ctx.fillRect(0, 0, camera.viewW, camera.viewH)

        camera.begin(ctx)
        view.drawGround(ctx, grass)
        view.draw(ctx)

        if(getPrefs().nameTags){
            for(const [id, ball] of balls){
                const name = names.get(id)
                if(name) drawNameTag(ctx, ball.x, ball.y, name, camera.zoom)
            }
        }

        const aim = input.aim()
        const mine = myBall()
        if(aim && mine && getPrefs().aimGuide) drawAim(ctx, mine, aim)

        camera.end(ctx)

        frameId = requestAnimationFrame(frame)
    }
    frameId = requestAnimationFrame(frame)

    const resize = () => {
        const dpr = window.devicePixelRatio || 1
        canvas.width = canvas.clientWidth * dpr
        canvas.height = canvas.clientHeight * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        camera.viewW = canvas.clientWidth
        camera.viewH = canvas.clientHeight

        camera.zoom = camera.fitZoom(b)
        camera.targetZoom = camera.zoom
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    return {
        dispose: () => {
            cancelAnimationFrame(frameId)
            observer.disconnect()
            input.dispose()
        }
    }
}

function bracket(states: TimedState[], at: number, fallback: TimedState): [TimedState, TimedState, number] {
    for(let i = states.length - 1; i > 0; i--){
        const a = states[i - 1]
        const b = states[i]
        if(a && b && a.at <= at){
            return [a, b, clamp((at - a.at) / (b.at - a.at), 0, 1)]
        }
    }

    const first = states[0] ?? fallback
    return [first, first, 0]
}

function drawNameTag(ctx: CanvasRenderingContext2D, x: number, y: number, name: string, zoom: number): void {
    ctx.save()
    ctx.font = `700 ${14 / zoom}px Nunito, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.lineWidth = 3 / zoom
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.strokeText(name, x, y - 14 / zoom)
    ctx.fillStyle = 'white'
    ctx.fillText(name, x, y - 14 / zoom)
    ctx.restore()
}
