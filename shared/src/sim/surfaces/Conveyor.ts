import type { Ball } from '../Ball'
import type { Shape } from '../shapes/Shape'
import { Surface } from './Surface'

const GRIP = 4

export class Conveyor extends Surface {
    vx: number
    vy: number

    constructor(shape: Shape, vx: number, vy: number){
        super(shape)
        this.vx = vx
        this.vy = vy
        this.pushes = true
    }

    override affect(ball: Ball, dt: number): void {
        const k = Math.min(1, GRIP * dt)
        ball.vx += (this.vx - ball.vx) * k
        ball.vy += (this.vy - ball.vy) * k
    }
}
