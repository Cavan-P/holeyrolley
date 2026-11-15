import type { Ball } from './Ball'

export class Portal {
    ax: number
    ay: number
    bx: number
    by: number
    radius: number
    layer: number

    constructor(ax: number, ay: number, bx: number, by: number, radius: number, layer: number){
        this.ax = ax
        this.ay = ay
        this.bx = bx
        this.by = by
        this.radius = radius
        this.layer = layer
    }

    check(ball: Ball): void {
        const da = Math.hypot(ball.x - this.ax, ball.y - this.ay)
        const db = Math.hypot(ball.x - this.bx, ball.y - this.by)

        if(ball.portal === this){
            if(da > this.radius + ball.rad && db > this.radius + ball.rad) ball.portal = null
            return
        }

        if(da < this.radius){
            ball.x = this.bx + (ball.x - this.ax)
            ball.y = this.by + (ball.y - this.ay)
            ball.portal = this
        }
        else if(db < this.radius){
            ball.x = this.ax + (ball.x - this.bx)
            ball.y = this.ay + (ball.y - this.by)
            ball.portal = this
        }
    }
}
