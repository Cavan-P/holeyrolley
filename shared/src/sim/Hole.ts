import type { MotionPath } from '../course'
import type { Ball } from './Ball'
import type { Collider } from './Collider'
import type { Cup } from './Cup'
import type { Bridge } from './Bridge'
import type { Transform } from './Transform'
import { type Surface, surfaceAt } from './surfaces/Surface'
import type { Shape, Bounds } from './shapes/Shape'
import { evaluateMotion } from './motion'

export type Mover = { transform: Transform, path: MotionPath }

export type Fairway = { shape: Shape, color: string | null }

type HoleOptions = {
    par: number
    tee: { x: number, y: number }
    fairways: Fairway[]
    balls: Ball[]
    walls: Collider[]
    surfaces: Surface[]
    bridges: Bridge[]
    movers: Mover[]
    cup: Cup
}

function fairwayBounds(fairways: Fairway[]): Bounds {
    let left = Infinity
    let right = -Infinity
    let top = Infinity
    let bottom = -Infinity

    for(const f of fairways){
        const b = f.shape.bounds()
        left = Math.min(left, b.x)
        right = Math.max(right, b.x + b.w)
        top = Math.min(top, b.y)
        bottom = Math.max(bottom, b.y + b.h)
    }

    return { x: left - 80, y: top - 80, w: right - left + 160, h: bottom - top + 160 }
}

export class Hole {
    par: number
    tee: { x: number, y: number }

    time: number

    fairways: Fairway[]
    balls: Ball[]
    walls: Collider[]
    surfaces: Surface[]
    bridges: Bridge[]
    movers: Mover[]

    cup: Cup

    bounds: Bounds

    private wallsByLayer: [Collider[], Collider[]]

    constructor(o: HoleOptions){
        this.par = o.par
        this.tee = o.tee
        this.time = 0

        this.fairways = o.fairways
        this.bounds = fairwayBounds(o.fairways)

        this.balls = o.balls
        this.walls = o.walls
        this.surfaces = o.surfaces
        this.bridges = o.bridges
        this.movers = o.movers

        this.cup = o.cup

        this.wallsByLayer = [o.walls.filter(w => w.layer === 0), o.walls.filter(w => w.layer === 1)]

        this.setTime(0)
    }

    setTime(t: number, dt: number = 0): void {
        this.time = t
        for(const m of this.movers){
            const p = evaluateMotion(m.path, t)
            m.transform.set(p.x, p.y, p.angle, dt)
        }
    }

    update(dt: number): void {
        this.setTime(this.time + dt, dt)

        for(const w of this.walls) w.update?.(dt)
        for(const s of this.surfaces) s.update(dt)

        for(const ball of this.balls){
            for(const b of this.bridges) b.tryLift(ball)

            const layer = ball.layer === 1 ? 1 : 0
            const sf = surfaceAt(this.surfaces, ball.x, ball.y, layer)
            ball.update(dt, this.wallsByLayer[layer], sf)

            if(ball.layer === 1 && !ball.airborne() && !this.bridges.some(b => b.shape.contains(ball.x, ball.y))){
                ball.layer = 0
            }

            if(ball.layer === 0) this.cup.update(dt, ball)
        }
    }
}