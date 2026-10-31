import { type Point } from './Shape'
import { PolygonShape } from './PolygonShape'
import { smoothPoints } from '../utilities/spline'

export class CurveShape extends PolygonShape {
    controls: Point[]

    constructor(controls: Point[]){
        super(smoothPoints(controls, true))
        this.controls = controls
    }
}
