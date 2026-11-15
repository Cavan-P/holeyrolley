import type { Ball } from './Ball'
import type { Collider } from './Collider'
import type { Shape } from './shapes/Shape'

export const FALL_WARN = 1.2
export const FALL_STAY = 3
const SHOVE = 420

export type Impact = { x: number, y: number, t: number }

function hash(n: number, salt: number): number {
    const v = Math.sin(n * 127.1 + salt * 311.7) * 43758.5453
    return v - Math.floor(v)
}

export class Faller implements Collider {
    shape: Shape
    every: number
    size: number
    seed: number

    r: number
    bounce: number
    layer: number

    time: number

    constructor(shape: Shape, every: number, size: number, seed: number){
        this.shape = shape
        this.every = Math.max(0.5, every)
        this.size = size
        this.seed = seed

        this.r = size
        this.bounce = 0.6
        this.layer = 0

        this.time = 0
    }

    impact(k: number): Impact {
        const b = this.shape.bounds()
        let x = b.x + b.w / 2
        let y = b.y + b.h / 2

        for(let i = 0; i < 12; i++){
            const tx = b.x + hash(k, this.seed + i) * b.w
            const ty = b.y + hash(k, this.seed + i + 50) * b.h
            if(this.shape.contains(tx, ty)){
                x = tx
                y = ty
                break
            }
        }

        return { x, y, t: (k + 1) * this.every }
    }

    nearby(): Impact[] {
        const first = Math.max(0, Math.floor((this.time - FALL_STAY) / this.every) - 1)
        const last = Math.floor((this.time + FALL_WARN) / this.every)
        const out: Impact[] = []

        for(let k = first; k <= last; k++){
            const i = this.impact(k)
            if(i.t > this.time - FALL_STAY && i.t - FALL_WARN < this.time) out.push(i)
        }

        return out
    }

    closestPoint(px: number, py: number): [number, number] {
        let best: [number, number] = [1e9, 1e9]
        let bestD = Infinity

        for(const i of this.nearby()){
            if(i.t > this.time) continue
            const d = Math.hypot(i.x - px, i.y - py)
            if(d < bestD){
                bestD = d
                best = [i.x, i.y]
            }
        }

        return best
    }

    step(dt: number, balls: Ball[]): void {
        const before = this.time - dt

        for(const i of this.nearby()){
            if(i.t <= before || i.t > this.time) continue

            for(const ball of balls){
                if(ball.layer !== 0 || ball.holed() || ball.sinking() || ball.airborne()) continue

                const dx = ball.x - i.x
                const dy = ball.y - i.y
                const d = Math.hypot(dx, dy)

                if(d < this.size + ball.rad){
                    ball.sink()
                }
                else if(d < this.size * 3){
                    const k = SHOVE * (1 - d / (this.size * 3))
                    ball.vx += dx / d * k
                    ball.vy += dy / d * k
                }
            }
        }
    }
}
