import { Surface } from './Surface'
import type { Shape } from '../shapes/Shape'

export class Sand extends Surface {
    constructor(shape: Shape){
        super(shape, 3, 2.5)
    }
}