import { Surface } from './Surface'
import type { Shape } from '../shapes/Shape'

export class Ice extends Surface {
    constructor(shape: Shape){
        super(shape, '#d6f1fb', 0.15, 0.1)
    }

    override display(ctx: CanvasRenderingContext2D): void {
        super.display(ctx)

        // A few diagonal streaks of shine across it
        const b = this.shape.bounds()

        ctx.save()
        ctx.beginPath()
        this.shape.trace(ctx)
        ctx.clip()

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.lineWidth = 6
        ctx.lineCap = 'round'

        ctx.beginPath()
        for(let x = b.x - b.h; x < b.x + b.w; x += 70){
            ctx.moveTo(x, b.y + b.h)
            ctx.lineTo(x + b.h * 0.6, b.y + b.h * 0.4)
        }
        ctx.stroke()

        ctx.restore()
    }
}
