import { Surface } from './Surface'
import type { Shape } from '../shapes/Shape'

export class Ice extends Surface {
    constructor(shape: Shape){
        super(shape, 0.15, 0.1)
    }
}
