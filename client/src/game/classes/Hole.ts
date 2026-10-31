import type { Ball } from './Ball'
import type { Wall } from './Wall'
import type { Cup } from './Cup'
import { type Surface, surfaceAt } from '../surfaces/Surface'

type HoleOptions = {
    par: number
    tee: { x: number, y: number }
    balls: Ball[]
    walls: Wall[]
    surfaces: Surface[]
    cup: Cup
}

// Everything that makes up one hole of a course, and how it updates and draws
export class Hole {
    par: number
    tee: { x: number, y: number }

    balls: Ball[]
    walls: Wall[]
    surfaces: Surface[]
    cup: Cup

    constructor({ par, tee, balls, walls, surfaces, cup }: HoleOptions){
        this.par = par
        this.tee = tee

        this.balls = balls
        this.walls = walls
        this.surfaces = surfaces
        this.cup = cup
    }

    // One fixed physics step
    update(dt: number): void {
        for(const ball of this.balls){
            const sf = surfaceAt(this.surfaces, ball.x, ball.y)
            ball.update(dt, this.walls, sf)
            this.cup.update(dt, ball)
        }
    }

    // Draw order is layering: ground first, then things on it, then the flag on top.
    // `focus` is the ball the flag fades out for (the player's own)
    draw(ctx: CanvasRenderingContext2D, focus: Ball): void {
        for(const s of this.surfaces) s.display(ctx)
        for(const w of this.walls) w.display(ctx)
        this.cup.display(ctx)

        for(const ball of this.balls) ball.display(ctx)

        this.cup.drawFlag(ctx, focus)
    }
}
