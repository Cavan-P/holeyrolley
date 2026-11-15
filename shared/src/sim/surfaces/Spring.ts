import type { Ball } from '../Ball'
import type { Shape } from '../shapes/Shape'
import { Surface } from './Surface'

export class Spring extends Surface {
    power: number

    constructor(shape: Shape, power: number){
        super(shape)
        this.power = Math.max(0.2, Math.min(2, power))
    }

    override affect(ball: Ball, _dt: number): void {
        if(ball.speed() < 40) return

        const boost = 1 + this.power * 0.25
        ball.vx *= boost
        ball.vy *= boost
        ball.launch(0.3 + this.power * 0.3, 0.7 + this.power * 0.4)
    }
}
