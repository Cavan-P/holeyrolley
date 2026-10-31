import { closestOnSegment } from '../utilities/closestOnSegment'
import type { Collider } from './Collider'

export class Wall implements Collider {
    x1: number
    y1: number
    
    x2: number
    y2: number

    r: number

    bounce: number

    constructor(x1: number, y1: number, x2: number, y2: number, r: number, bounce: number){
        this.x1 = x1
        this.y1 = y1
        
        this.x2 = x2
        this.y2 = y2

        this.r = r
        
        this.bounce = bounce
    }

    closestPoint(px: number, py: number): [number, number] {
        return closestOnSegment(px, py, this.x1, this.y1, this.x2, this.y2)
    }

    display(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = 'brown'
        ctx.lineCap = 'round'

        ctx.beginPath()
        ctx.moveTo(this.x1, this.y1)
        ctx.lineTo(this.x2, this.y2)
        ctx.lineWidth = this.r * 2

        ctx.stroke()
    }
}