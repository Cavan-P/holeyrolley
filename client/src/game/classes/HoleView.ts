import type { Ball, Hole } from '@holey/shared'
import type { Drawable } from './Drawable'
import { burst, drawParticles, stepParticles, type Particle } from '../art/celebrations'
import { getPrefs } from '../../settings/store'
import { traceShape, drawBall, drawCup, drawFlag, readCupColors, type CupColors } from '../draw'

export type LayerDrawables = { ground: Drawable[], solid: Drawable[] }

export class HoleView {
    hole: Hole
    drawables: [LayerDrawables, LayerDrawables]
    particles: Particle[]
    cupColors: CupColors

    constructor(hole: Hole, drawables: [LayerDrawables, LayerDrawables]){
        this.hole = hole
        this.drawables = drawables
        this.particles = []
        this.cupColors = readCupColors()
    }

    update(dt: number): void {
        const wasHoled = this.hole.balls.map(b => b.holed())

        this.hole.update(dt)

        this.hole.balls.forEach((ball, i) => {
            if(!wasHoled[i] && ball.holed() && !getPrefs().reduceMotion)
                this.particles.push(...burst(ball.cosmetics.celebration, this.hole.cup.x, this.hole.cup.y))
        })

        this.particles = stepParticles(this.particles, dt)
    }

    drawGround(ctx: CanvasRenderingContext2D, grass: CanvasPattern): void {
        for(const f of this.hole.fairways){
            const b = f.shape.bounds()

            ctx.save()

            ctx.beginPath()
            traceShape(ctx, f.shape)
            ctx.clip()

            ctx.fillStyle = f.color ?? grass
            ctx.fillRect(b.x, b.y, b.w, b.h)

            ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)'
            ctx.lineWidth = 36
            ctx.lineJoin = 'round'
            ctx.beginPath()
            traceShape(ctx, f.shape)
            ctx.stroke()

            ctx.restore()
        }
    }

    draw(ctx: CanvasRenderingContext2D, focus?: Ball): void {
        const [ground, raised] = this.drawables

        for(const d of ground.ground) d.display(ctx)
        for(const d of ground.solid) d.display(ctx)
        drawCup(ctx, this.hole.cup, this.cupColors)
        for(const ball of this.hole.balls) if(ball.layer === 0) drawBall(ctx, ball)

        for(const d of raised.ground) d.display(ctx)
        for(const d of raised.solid) d.display(ctx)
        for(const ball of this.hole.balls) if(ball.layer === 1) drawBall(ctx, ball)

        drawParticles(ctx, this.particles)

        drawFlag(ctx, this.hole.cup, focus ?? null)
    }
}
