import type { Point } from '../shapes/Shape'

export class Transform {
    x: number
    y: number
    angle: number

    px: number
    py: number

    private prevX: number
    private prevY: number
    private prevAngle: number
    private dt: number

    constructor(px: number, py: number){
        this.x = 0
        this.y = 0
        this.angle = 0
        this.px = px
        this.py = py

        this.prevX = 0
        this.prevY = 0
        this.prevAngle = 0
        this.dt = 0
    }

    set(x: number, y: number, angle: number, dt: number): void {
        this.prevX = this.x
        this.prevY = this.y
        this.prevAngle = this.angle
        this.dt = dt

        this.x = x
        this.y = y
        this.angle = angle
    }

    toWorld(lx: number, ly: number): Point {
        return place(lx, ly, this.x, this.y, this.angle, this.px, this.py)
    }

    toLocal(wx: number, wy: number): Point {
        const dx = wx - this.x - this.px
        const dy = wy - this.y - this.py
        const c = Math.cos(-this.angle)
        const s = Math.sin(-this.angle)
        return [this.px + dx * c - dy * s, this.py + dx * s + dy * c]
    }

    velocityAt(wx: number, wy: number): Point {
        if(this.dt <= 0) return [0, 0]

        const [lx, ly] = this.toLocal(wx, wy)
        const [ox, oy] = place(lx, ly, this.prevX, this.prevY, this.prevAngle, this.px, this.py)
        return [(wx - ox) / this.dt, (wy - oy) / this.dt]
    }

    apply(ctx: CanvasRenderingContext2D): void {
        ctx.translate(this.x + this.px, this.y + this.py)
        ctx.rotate(this.angle)
        ctx.translate(-this.px, -this.py)
    }
}

function place(lx: number, ly: number, x: number, y: number, angle: number, px: number, py: number): Point {
    const dx = lx - px
    const dy = ly - py
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    return [px + dx * c - dy * s + x, py + dx * s + dy * c + y]
}
