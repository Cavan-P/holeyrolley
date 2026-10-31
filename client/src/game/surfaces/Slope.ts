import { Surface } from './Surface'
import type { Shape } from '../shapes/Shape'
import type { Ball } from '../classes/Ball'

export class Slope extends Surface {
    fx: number
    fy: number

    constructor(shape: Shape, fx: number, fy: number){
        super(shape, '#5fae3f')
        this.fx = fx
        this.fy = fy

        this.pushes = true
    }

    override affect(ball: Ball, dt: number): void {
        ball.vx += this.fx * dt
        ball.vy += this.fy * dt
    }

    override display(ctx: CanvasRenderingContext2D): void {
        super.display(ctx)
    
        const SPACING = 48
        const speed = Math.hypot(this.fx, this.fy) * 0.15
    
        const b = this.shape.bounds()
        const cx = b.x + b.w / 2
        const cy = b.y + b.h / 2

        const reach = Math.hypot(b.w, b.h) / 2 + SPACING
    
        const offset = (performance.now() / 1000 * speed) % SPACING
    
        ctx.save()
    
        ctx.beginPath()
        this.shape.trace(ctx)
        ctx.clip()
    
        ctx.translate(cx, cy)
        ctx.rotate(Math.atan2(this.fy, this.fx))
    
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
    
        for(let y = -reach; y <= reach; y += SPACING){
            for(let x = -reach; x <= reach; x += SPACING){
                this.drawArrow(ctx, x + offset, y)
            }
        }
    
        ctx.restore()
    }
    
    private drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.beginPath()
        ctx.moveTo(x - 10, y)
        ctx.lineTo(x + 10, y)
        ctx.moveTo(x + 4, y - 6)
        ctx.lineTo(x + 10, y)
        ctx.lineTo(x + 4, y + 6)
        ctx.stroke()
    }
}