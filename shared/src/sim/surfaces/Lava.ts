import type { Ball } from '../Ball'
import type { Shape } from '../shapes/Shape'
import { Surface } from './Surface'

export class Lava extends Surface {
    constructor(shape: Shape){
        super(shape)
    }

    override affect(ball: Ball, _dt: number): void {
        ball.sink()
    }
}
