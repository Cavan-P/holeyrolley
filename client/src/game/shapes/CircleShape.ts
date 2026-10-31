import { Shape } from './Shape'

export class CircleShape extends Shape {
    x: number
    y: number
    r: number

    constructor(x: number, y: number, r: number){
        super()
        this.x = x
        this.y = y
        this.r = r
    }

    contains(x: number, y: number): boolean {
        return Math.hypot(x - this.x, y - this.y) <= this.r
    }

    trace(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.x + this.r, this.y)
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    }

    bounds(): { x: number, y: number, w: number, h: number } {
        return { x: this.x - this.r, y: this.y - this.r, w: this.r * 2, h: this.r * 2 }
    }
}