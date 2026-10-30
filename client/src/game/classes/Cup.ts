import { Ball } from './Ball'
import { clamp, map } from '../utilities/math'

export class Cup {
    x: number
    y: number
    r: number
    gravity: number
    captureSpeed: number

    holeRim: string
    hole: string

    constructor(x: number, y: number, r: number = 13){
        this.x = x
        this.y = y
        this.r = r
        this.gravity = 1500
        this.captureSpeed = 320

        const css = getComputedStyle(document.documentElement)
        this.holeRim = css.getPropertyValue('--color-hole').trim()
        this.hole = css.getPropertyValue('--color-hole-in').trim()
    }

    update(dt: number, ball: Ball): void {
        if(ball.holed()) return

        const dx = ball.x - this.x
        const dy = ball.y - this.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if(d >= this.r) return

        const allowed = this.captureSpeed * (1 - 0.5 * d / this.r)

        if(ball.speed() < allowed){
            ball.dropIn(this.x, this.y)
            return
        }

        if(d > 0){
            ball.vx -= dx / d * this.gravity * dt
            ball.vy -= dy / d * this.gravity * dt
        }
    }

    display(ctx: CanvasRenderingContext2D): void {

        ctx.fillStyle = this.holeRim
        ctx.beginPath()
        ctx.ellipse(this.x, this.y, this.r + 3, this.r + 3, 0, 0, Math.PI * 2)

        ctx.fill()

        ctx.fillStyle = this.hole
        ctx.beginPath()
        ctx.ellipse(this.x, this.y, this.r, this.r, 0, 0, Math.PI * 2)

        ctx.fill()
    }

    drawFlag(ctx: CanvasRenderingContext2D, ball: Ball): void {
        const d = Math.hypot(ball.x - this.x, ball.y - this.y)
        const a = clamp(map(d, 30, 90, 60, 255), 60, 255) / 255
    
        ctx.save()
    
        ctx.strokeStyle = `rgba(244, 239, 223, ${a})`
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x, this.y - 50)
        ctx.stroke()
    
        ctx.fillStyle = `rgba(242, 181, 68, ${a})`
        ctx.beginPath()
        ctx.moveTo(this.x, this.y - 50)
        ctx.lineTo(this.x + 26, this.y - 42)
        ctx.lineTo(this.x, this.y - 34)
        ctx.closePath()
        ctx.fill()
    
        ctx.restore()
    }
}