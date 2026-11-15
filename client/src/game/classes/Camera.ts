import { type Bounds, Ball, clamp, smooth } from '@holey/shared'

export class Camera {
    x: number
    y: number
    zoom: number

    targetX: number
    targetY: number
    targetZoom: number

    viewW: number
    viewH: number

    speed: number
    zoomSpeed: number

    lookahead: number

    bounds: {minX: number, maxX: number, minY: number, maxY: number} | null

    leadX: number
    leadY: number
    leadSpeed: number

    constructor(x: number, y: number, viewW: number, viewH: number){
        this.x = x
        this.y = y

        this.zoom = 1
        this.viewW = viewW
        this.viewH = viewH

        this.speed = 5
        this.zoomSpeed = 3
        this.lookahead = 0.25
        this.bounds = null

        this.leadX = 0
        this.leadY = 0
        this.leadSpeed = 1.5

        this.targetX = x
        this.targetY = y
        this.targetZoom = 1
    }

    snapTo(x: number, y: number): void {
        this.x = x
        this.y = y

        this.targetX = x
        this.targetY = y

        this.zoom = 1
        this.targetZoom = 1
    }

    clampTarget(tx: number, ty: number): [number, number] {
        if(!this.bounds) return [tx, ty]

        const hw = this.viewW / 2 / this.zoom
        const hh = this.viewH / 2 / this.zoom

        tx = this.bounds.maxX - this.bounds.minX < hw * 2 ? (this.bounds.minX + this.bounds.maxX) / 2 : clamp(tx, this.bounds.minX + hw, this.bounds.maxX - hw)
        ty = this.bounds.maxY - this.bounds.minY < hh * 2 ? (this.bounds.minY + this.bounds.maxY) / 2 : clamp(ty, this.bounds.minY + hh, this.bounds.maxY - hh)

        return [tx, ty]
    }

    fitZoom(rect: Bounds): number {
        const size = Math.min(this.viewW / rect.w, this.viewH / rect.h)
        return Math.min(1, size)
    }

    follow(ball: Ball, dt: number): void {
        this.leadX += smooth(this.leadX, ball.vx * this.lookahead, this.leadSpeed, dt)
        this.leadY += smooth(this.leadY, ball.vy * this.lookahead, this.leadSpeed, dt)

        const [tx, ty] = this.clampTarget(ball.x + this.leadX, ball.y + this.leadY)

        this.targetX = tx
        this.targetY = ty
    }

    update(dt: number): void {
        this.x += smooth(this.x, this.targetX, this.speed, dt)
        this.y += smooth(this.y, this.targetY, this.speed, dt)

        let logZoom = Math.log(this.zoom)
        logZoom += smooth(logZoom, Math.log(this.targetZoom), this.zoomSpeed, dt)
        this.zoom = Math.exp(logZoom)
    }

    begin(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        ctx.translate(this.viewW / 2, this.viewH / 2)
        ctx.scale(this.zoom, this.zoom)
        ctx.translate(-this.x, -this.y)
    }

    end(ctx: CanvasRenderingContext2D): void {
        ctx.restore()
    }

    mouse(mouse: {x: number, y: number }): {x: number, y: number} {
        return {
            x: (mouse.x - this.viewW / 2) / this.zoom + this.x,
            y: (mouse.y - this.viewH / 2) / this.zoom + this.y
        }
    }

    visibleRect(): {x: number, y: number, w: number, h: number} {
        return {
            x: this.x - this.viewW / 2 / this.zoom,
            y: this.y - this.viewH / 2 / this.zoom,
            w: (this.viewW / 2 / this.zoom) * 2,
            h: (this.viewH / 2 / this.zoom) * 2
        }
    }
}