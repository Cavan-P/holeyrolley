import { Shape } from './Shape'

export class RectShape extends Shape {
    x: number
    y: number
    w: number
    h: number

    constructor(x: number, y: number, w: number, h: number){
        super()
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    contains(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
    }

    trace(ctx: CanvasRenderingContext2D): void {
        ctx.rect(this.x, this.y, this.w, this.h)
    }

    bounds(): { x: number, y: number, w: number, h: number } {
        return { x: this.x, y: this.y, w: this.w, h: this.h }
    }
}