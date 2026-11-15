import { Surface } from './Surface'
import type { Shape } from '../shapes/Shape'
import type { Ball } from '../Ball'
import { clamp } from '../math'

// A ball at least this fast skips off the water instead of sinking
const SKIP_SPEED = 300
// Fraction of speed kept after each skip
const SKIP_KEEP = 0.8
// Seconds the ball is in the air after a skip, before it touches the water again
const AIR_TIME = 0.25

export const RIPPLE_LIFE = 0.9

type Ripple = { x: number, y: number, age: number, size: number }

export class Water extends Surface {
    ripples: Ripple[]

    constructor(shape: Shape){
        super(shape)
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
}
