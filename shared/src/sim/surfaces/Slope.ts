import { Surface } from './Surface'
import type { Shape } from '../shapes/Shape'
import type { Ball } from '../Ball'

export class Slope extends Surface {
    fx: number
    fy: number

    constructor(shape: Shape, fx: number, fy: number){
        super(shape)
        this.fx = fx
        this.fy = fy

        this.pushes = true
    }

    override affect(ball: Ball, dt: number): void {
        ball.vx += this.fx * dt
        ball.vy += this.fy * dt
    }
}