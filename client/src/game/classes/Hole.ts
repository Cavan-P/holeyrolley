import type { Ball } from './Ball'
import type { Collider } from './Collider'
import type { Cup } from './Cup'
import { type Surface, surfaceAt } from '../surfaces/Surface'
import type { Shape } from '../shapes/Shape'

type HoleOptions = {
    par: number
    tee: { x: number, y: number }
    course: Shape
    balls: Ball[]
    walls: Collider[]
    surfaces: Surface[]
    cup: Cup
}

export class Hole {
    par: number
    tee: { x: number, y: number }
    // The playable area's outline. Grass is only drawn inside it
    course: Shape

    balls: Ball[]
    walls: Collider[]
    surfaces: Surface[]
    cup: Cup

    constructor({ par, tee, course, balls, walls, surfaces, cup }: HoleOptions){
        this.par = par
        this.tee = tee
        this.course = course

        this.balls = balls
        this.walls = walls
        this.surfaces = surfaces
        this.cup = cup
    }

    update(dt: number): void {
        for(const w of this.walls) w.update?.(dt)
        for(const s of this.surfaces) s.update(dt)

        for(const ball of this.balls){
            const sf = surfaceAt(this.surfaces, ball.x, ball.y)
            ball.update(dt, this.walls, sf)
            this.cup.update(dt, ball)
        }
    }

    drawGround(ctx: CanvasRenderingContext2D, grass: CanvasPattern): void {
        const b = this.course.bounds()

        ctx.save()

        // Everything until restore() only shows up inside the course
        ctx.beginPath()
        this.course.trace(ctx)
        ctx.clip()

        ctx.fillStyle = grass
        ctx.fillRect(b.x, b.y, b.w, b.h)

        // A thick dark line along the outline. Only its inner half is inside the clip,
        // so it reads as a soft shadow where the grass meets the rails
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)'
        ctx.lineWidth = 36
        ctx.lineJoin = 'round'
        ctx.beginPath()
        this.course.trace(ctx)
        ctx.stroke()

        ctx.restore()
    }

    draw(ctx: CanvasRenderingContext2D, focus: Ball): void {
        for(const s of this.surfaces) s.display(ctx)
        for(const w of this.walls) w.display(ctx)
        this.cup.display(ctx)

        for(const ball of this.balls) ball.display(ctx)

        this.cup.drawFlag(ctx, focus)
    }
}
