import { Surface } from './Surface'
import type { Shape } from '../shapes/Shape'
import type { Ball } from '../classes/Ball'
import { clamp } from '../utilities/math'

// A ball at least this fast skips off the water instead of sinking
const SKIP_SPEED = 300
// Fraction of speed kept after each skip
const SKIP_KEEP = 0.8
// Seconds the ball is in the air after a skip, before it touches the water again
const AIR_TIME = 0.25

const RIPPLE_LIFE = 0.9

type Ripple = { x: number, y: number, age: number, size: number }

export class Water extends Surface {
    ripples: Ripple[]

    constructor(shape: Shape){
        super(shape, '#3a9ad9')
        this.ripples = []
    }

    override affect(ball: Ball, _dt: number): void {
        this.ripples.push({ x: ball.x, y: ball.y, age: 0, size: 18 })

        const strength = clamp((ball.speed() - SKIP_SPEED) / (ball.maxSpeed - SKIP_SPEED), 0, 1)
        const peak = 0.3 + 0.7 * strength

        if(ball.speed() >= SKIP_SPEED){
            ball.vx *= SKIP_KEEP
            ball.vy *= SKIP_KEEP
            ball.launch(AIR_TIME * (0.5 + 0.5 * strength), peak)
        }
        else {
            this.ripples.push({ x: ball.x, y: ball.y, age: -0.15, size: 34 })
            ball.sink()
        }
    }

    override update(dt: number): void {
        for(const r of this.ripples) r.age += dt
        this.ripples = this.ripples.filter(r => r.age < RIPPLE_LIFE)
    }

    override display(ctx: CanvasRenderingContext2D): void {
        super.display(ctx)

        ctx.save()
        ctx.beginPath()
        this.shape.trace(ctx)
        ctx.clip()

        ctx.lineWidth = 2

        for(const r of this.ripples){
            if(r.age < 0) continue

            const t = r.age / RIPPLE_LIFE
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * (1 - t)})`

            ctx.beginPath()
            ctx.arc(r.x, r.y, 4 + r.size * t, 0, Math.PI * 2)
            ctx.stroke()
        }

        ctx.restore()
    }
}
