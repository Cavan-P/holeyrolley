import { Surface } from './Surface'
import type { Shape } from '../shapes/Shape'
import type { Ball } from '../classes/Ball'

export class Sand extends Surface {
    constructor(shape: Shape){
        super(shape, '#e8d28a', 3, 2.5)
    }
}