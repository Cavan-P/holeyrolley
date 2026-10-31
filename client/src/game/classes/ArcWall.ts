import type { Collider } from './Collider'
import { angleInArc } from '../utilities/angles'

// A curved rail along part of a circle. Angles work like ArcShape's
export class ArcWall implements Collider {
    x: number
    y: number
    radius: number
    start: number
    end: number

    r: number
    bounce: number

    constructor(x: number, y: number, radius: number, start: number, end: number, r: number, bounce: number){
        this.x = x
        this.y = y
        this.radius = radius
        this.start = start
        this.end = end

        this.r = r
        this.bounce = bounce
    }

    closestPoint(px: number, py: number): [number, number] {
        const angle = Math.atan2(py - this.y, px - this.x)

        // Inside the arc's range: straight out from the center onto the curve
        if(angleInArc(angle, this.start, this.end)){
            return [this.x + Math.cos(angle) * this.radius, this.y + Math.sin(angle) * this.radius]
        }

        // Outside it: whichever end is nearer
        const ax = this.x + Math.cos(this.start) * this.radius
        const ay = this.y + Math.sin(this.start) * this.radius
        const bx = this.x + Math.cos(this.end) * this.radius
        const by = this.y + Math.sin(this.end) * this.radius

        return Math.hypot(px - ax, py - ay) <= Math.hypot(px - bx, py - by) ? [ax, ay] : [bx, by]
    }

    display(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = 'brown'
        ctx.lineCap = 'round'
        ctx.lineWidth = this.r * 2

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, this.start, this.end)
        ctx.stroke()
    }
}
