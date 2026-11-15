import { Surface } from './surfaces/Surface'
import { RectShape } from './shapes/RectShape'
import { TransformedShape } from './shapes/TransformedShape'
import { Transform } from './Transform'
import { Wall } from './Wall'
import type { Ball } from './Ball'

export const RAMP = 40
const RAIL_THICKNESS = 5

export class Bridge extends Surface {
    length: number
    width: number
    angle: number
    place: Transform
    rails: Wall[]

    constructor(ax: number, ay: number, bx: number, by: number, width: number, hasRails: boolean){
        const length = Math.hypot(bx - ax, by - ay)
        const angle = Math.atan2(by - ay, bx - ax)

        const place = new Transform(0, 0)
        place.set((ax + bx) / 2, (ay + by) / 2, angle, 0)

        super(new TransformedShape(new RectShape(-length / 2, -width / 2, length, width), place))

        this.length = length
        this.width = width
        this.angle = angle
        this.place = place
        this.layer = 1

        this.rails = []
        if(hasRails){
            for(const side of [-1, 1]){
                const [x1, y1] = place.toWorld(-length / 2, side * width / 2)
                const [x2, y2] = place.toWorld(length / 2, side * width / 2)
                this.rails.push(new Wall(x1, y1, x2, y2, RAIL_THICKNESS, 0.5, 1))
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
}
