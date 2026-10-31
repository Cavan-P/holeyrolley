import { Surface } from '../surfaces/Surface'
import { RectShape } from '../shapes/RectShape'
import { TransformedShape } from '../shapes/TransformedShape'
import { Transform } from './Transform'
import { Wall } from './Wall'
import type { Ball } from './Ball'

const RAMP = 40
const RAIL_THICKNESS = 5

export class Bridge extends Surface {
    length: number
    width: number
    angle: number
    place: Transform
    rails: Wall[]
    railColor: string

    constructor(ax: number, ay: number, bx: number, by: number, width: number, hasRails: boolean, color: string, railColor: string){
        const length = Math.hypot(bx - ax, by - ay)
        const angle = Math.atan2(by - ay, bx - ax)

        const place = new Transform(0, 0)
        place.set((ax + bx) / 2, (ay + by) / 2, angle, 0)

        super(new TransformedShape(new RectShape(-length / 2, -width / 2, length, width), place), color)

        this.length = length
        this.width = width
        this.angle = angle
        this.place = place
        this.railColor = railColor
        this.layer = 1

        this.rails = []
        if(hasRails){
            for(const side of [-1, 1]){
                const [x1, y1] = place.toWorld(-length / 2, side * width / 2)
                const [x2, y2] = place.toWorld(length / 2, side * width / 2)
                this.rails.push(new Wall(x1, y1, x2, y2, RAIL_THICKNESS, 0.5, railColor, 1))
            }
        }
    }

    tryLift(ball: Ball): void {
        if(ball.layer !== 0 || ball.airborne()) return

        const [lx, ly] = this.place.toLocal(ball.x, ball.y)
        const half = this.length / 2
        if(Math.abs(lx) > half || Math.abs(ly) > this.width / 2) return
        if(Math.abs(lx) < half - RAMP) return

        const along = ball.vx * Math.cos(this.angle) + ball.vy * Math.sin(this.angle)
        if(along * Math.sign(lx) < 0) ball.layer = 1
    }

    override display(ctx: CanvasRenderingContext2D): void {
        const L = this.length
        const W = this.width

        ctx.save()
        this.place.apply(ctx)

        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
        ctx.beginPath()
        ctx.roundRect(-L / 2 + 6, -W / 2 + 10, L, W, 6)
        ctx.fill()

        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.roundRect(-L / 2, -W / 2, L, W, 6)
        ctx.fill()

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.14)'
        ctx.lineWidth = 2
        ctx.beginPath()
        for(let x = -L / 2 + 14; x < L / 2; x += 14){
            ctx.moveTo(x, -W / 2 + 2)
            ctx.lineTo(x, W / 2 - 2)
        }
        ctx.stroke()

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
        ctx.fillRect(-L / 2, -W / 2, RAMP, W)
        ctx.fillRect(L / 2 - RAMP, -W / 2, RAMP, W)

        ctx.restore()
    }
}
