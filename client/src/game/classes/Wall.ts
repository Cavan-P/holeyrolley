import { closestOnSegment } from '../utilities/closestOnSegment'
import type { Collider } from './Collider'

export class Wall implements Collider {
    x1: number
    y1: number
    
    x2: number
    y2: number

    r: number

    bounce: number

    color: string
    layer: number

    constructor(x1: number, y1: number, x2: number, y2: number, r: number, bounce: number, color: string = '#8b4a2b', layer: number = 0){
        this.x1 = x1
        this.y1 = y1
        
        this.x2 = x2
        this.y2 = y2

        this.r = r
        
        this.bounce = bounce

        this.color = color
        this.layer = layer
    }

    closestPoint(px: number, py: number): [number, number] {
        return closestOnSegment(px, py, this.x1, this.y1, this.x2, this.y2)
    }

    display(ctx: CanvasRenderingContext2D): void {
        // Safari draws nothing for a zero-length line, so round posts are filled circles
        if(this.x1 === this.x2 && this.y1 === this.y2){
            ctx.fillStyle = this.color
            ctx.beginPath()
            ctx.arc(this.x1, this.y1, this.r, 0, Math.PI * 2)
            ctx.fill()
            return
        }

        ctx.strokeStyle = this.color
        ctx.lineCap = 'round'

        ctx.beginPath()
        ctx.moveTo(this.x1, this.y1)
        ctx.lineTo(this.x2, this.y2)
        ctx.lineWidth = this.r * 2

        ctx.stroke()
    }
}