import { closestOnSegment } from './closestOnSegment'
import type { Collider } from './Collider'

export class Wall implements Collider {
    x1: number
    y1: number
    
    x2: number
    y2: number

    r: number

    bounce: number

    layer: number

    constructor(x1: number, y1: number, x2: number, y2: number, r: number, bounce: number, layer: number = 0){
        this.x1 = x1
        this.y1 = y1
        
        this.x2 = x2
        this.y2 = y2

        this.r = r
        
        this.bounce = bounce

        this.layer = layer
    }

    closestPoint(px: number, py: number): [number, number] {
        return closestOnSegment(px, py, this.x1, this.y1, this.x2, this.y2)
    }
}