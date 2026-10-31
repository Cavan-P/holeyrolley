import { Shape, arcPoints, type Point } from './Shape'
import { clamp } from '../utilities/math'

export class RectShape extends Shape {
    x: number
    y: number
    w: number
    h: number

    // Corner radius. 0 = sharp corners
    radius: number

    constructor(x: number, y: number, w: number, h: number, radius: number = 0){
        super()
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.radius = clamp(radius, 0, Math.min(w, h) / 2)
    }

    contains(x: number, y: number): boolean {
        const r = this.radius

        // Shrink the rect by the radius, find the nearest point on that, and check
        // we're within the radius of it. With r = 0 this is a plain rect check
        const nx = clamp(x, this.x + r, this.x + this.w - r)
        const ny = clamp(y, this.y + r, this.y + this.h - r)
        return Math.hypot(x - nx, y - ny) <= r
    }

    trace(ctx: CanvasRenderingContext2D): void {
        if(this.radius > 0) ctx.roundRect(this.x, this.y, this.w, this.h, this.radius)
        else ctx.rect(this.x, this.y, this.w, this.h)
    }

    bounds(): { x: number, y: number, w: number, h: number } {
        return { x: this.x, y: this.y, w: this.w, h: this.h }
    }

    outline(): Point[][] {
        const { x, y, w, h, radius: r } = this
        if(r <= 0) return [[[x, y], [x + w, y], [x + w, y + h], [x, y + h]]]

        return [[
            ...arcPoints(x + w - r, y + r, r, -Math.PI / 2, 0, 6),
            ...arcPoints(x + w - r, y + h - r, r, 0, Math.PI / 2, 6),
            ...arcPoints(x + r, y + h - r, r, Math.PI / 2, Math.PI, 6),
            ...arcPoints(x + r, y + r, r, Math.PI, Math.PI * 1.5, 6)
        ]]
    }
}
