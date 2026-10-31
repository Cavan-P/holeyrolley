import { Shape } from './Shape'

export class DonutShape extends Shape {
    x: number
    y: number
    inner: number
    outer: number

    constructor(x: number, y: number, inner: number, outer: number){
        super()
        this.x = x
        this.y = y
        this.inner = inner
        this.outer = outer
    }

    contains(x: number, y: number): boolean {
        const d = Math.hypot(x - this.x, y - this.y)
        return d >= this.inner && d <= this.outer
    }

    trace(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.x + this.outer, this.y)
        ctx.arc(this.x, this.y, this.outer, 0, Math.PI * 2)

        // Going round the inner circle the opposite way is what cuts the hole
        ctx.moveTo(this.x + this.inner, this.y)
        ctx.arc(this.x, this.y, this.inner, 0, Math.PI * 2, true)
    }

    bounds(): { x: number, y: number, w: number, h: number } {
        return { x: this.x - this.outer, y: this.y - this.outer, w: this.outer * 2, h: this.outer * 2 }
    }
}
