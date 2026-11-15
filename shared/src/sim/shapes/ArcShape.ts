import { Shape, arcPoints, type Point } from './Shape'
import { angleInArc, normalizeAngle } from '../angles'

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

    // The whole circle's box. Bigger than needed for short arcs, but always contains it
    bounds(): { x: number, y: number, w: number, h: number } {
        return { x: this.x - this.outer, y: this.y - this.outer, w: this.outer * 2, h: this.outer * 2 }
    }

    outline(): Point[][] {
        const end = this.start + normalizeAngle(this.end - this.start)
        return [[
            ...arcPoints(this.x, this.y, this.outer, this.start, end, 32),
            ...arcPoints(this.x, this.y, this.inner, end, this.start, 24)
        ]]
    }
}
