import { Shape } from './Shape'
import { angleInArc } from '../utilities/angles'

// A curved band: the part of a donut between two angles.
// Angles are radians, 0 = pointing right, increasing clockwise on screen
export class ArcShape extends Shape {
    x: number
    y: number
    inner: number
    outer: number
    start: number
    end: number

    constructor(x: number, y: number, inner: number, outer: number, start: number, end: number){
        super()
        this.x = x
        this.y = y
        this.inner = inner
        this.outer = outer
        this.start = start
        this.end = end
    }

    contains(x: number, y: number): boolean {
        const d = Math.hypot(x - this.x, y - this.y)
        if(d < this.inner || d > this.outer) return false

        return angleInArc(Math.atan2(y - this.y, x - this.x), this.start, this.end)
    }

    trace(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.x + Math.cos(this.start) * this.outer, this.y + Math.sin(this.start) * this.outer)
        ctx.arc(this.x, this.y, this.outer, this.start, this.end)
        ctx.arc(this.x, this.y, this.inner, this.end, this.start, true)
        ctx.closePath()
    }

    // The whole circle's box. Bigger than needed for short arcs, but always contains it
    bounds(): { x: number, y: number, w: number, h: number } {
        return { x: this.x - this.outer, y: this.y - this.outer, w: this.outer * 2, h: this.outer * 2 }
    }
}
