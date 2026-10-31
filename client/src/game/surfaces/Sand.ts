import { Surface } from './Surface'
import type { Shape } from '../shapes/Shape'

export class Sand extends Surface {
    constructor(shape: Shape){
        super(shape, '#e8d28a', 3, 2.5)
    }
}