import { Wall } from './Wall'
import type { Ball } from './Ball'

// Extra speed (pixels/second) added straight away from the bumper on every hit
const KICK = 260
// How fast the hit flash fades, per second
const FLASH_FADE = 5

// A springy wall that kicks the ball away and flashes when hit.
// Give it the same start and end point to make a round post
export class Bumper extends Wall {
    flash: number

    constructor(x1: number, y1: number, x2: number, y2: number, r: number){
        super(x1, y1, x2, y2, r, 1)
        this.flash = 0
    }

    onHit(ball: Ball, nx: number, ny: number): void {
        ball.vx += nx * KICK
        ball.vy += ny * KICK
        this.flash = 1
    }

    update(dt: number): void {
        this.flash = Math.max(0, this.flash - FLASH_FADE * dt)
    }

    override display(ctx: CanvasRenderingContext2D): void {
        const color = this.flash > 0 ? '#ffd23f' : '#ff5d5d'
        // Swells a little on a hit, then settles back
        const r = this.r + this.flash * 3

        ctx.save()

        // Some browsers (Safari) draw nothing for a zero-length line, even with round caps,
        // so round posts are drawn as a filled circle instead
        if(this.x1 === this.x2 && this.y1 === this.y2){
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(this.x1, this.y1, r, 0, Math.PI * 2)
            ctx.fill()
        }
        else {
            ctx.strokeStyle = color
            ctx.lineCap = 'round'
            ctx.lineWidth = r * 2

            ctx.beginPath()
            ctx.moveTo(this.x1, this.y1)
            ctx.lineTo(this.x2, this.y2)
            ctx.stroke()
        }

        ctx.restore()
    }
}
