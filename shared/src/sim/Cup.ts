import type { Ball } from './Ball'

export class Cup {
    x: number
    y: number
    r: number
    gravity: number
    captureSpeed: number

    constructor(x: number, y: number, r: number = 13){
        this.x = x
        this.y = y
        this.r = r
        this.gravity = 1500
        this.captureSpeed = 320
    }

    update(dt: number, ball: Ball): void {
        if(ball.holed() || ball.airborne() || ball.sinking()) return

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
}