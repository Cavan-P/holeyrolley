import type { MotionPath } from '@holey/shared'
import type { Ball } from './Ball'
import type { Collider } from './Collider'
import type { Cup } from './Cup'
import type { Bridge } from './Bridge'
import type { Drawable } from './Drawable'
import type { Transform } from './Transform'
import { type Surface, surfaceAt } from '../surfaces/Surface'
import type { Shape } from '../shapes/Shape'
import type { Theme } from '../art/themes'
import { evaluateMotion } from '../utilities/motion'

// Something that follows a motion path. Its colliders/shapes all share the transform
export type Mover = { transform: Transform, path: MotionPath }

export type Fairway = { shape: Shape, color: string | null }

// What gets drawn on one layer: ground-level things (surfaces, decks) first, then solid things on top
export type LayerDrawables = { ground: Drawable[], solid: Drawable[] }

type HoleOptions = {
    par: number
    tee: { x: number, y: number }
    theme: Theme
    fairways: Fairway[]
    balls: Ball[]
    walls: Collider[]
    surfaces: Surface[]
    bridges: Bridge[]
    movers: Mover[]
    drawables: [LayerDrawables, LayerDrawables]
    cup: Cup
}

export class Hole {
    par: number
    tee: { x: number, y: number }
    theme: Theme
    // Seconds since the hole started. Drives everything on a motion path
    time: number

    fairways: Fairway[]
    balls: Ball[]
    walls: Collider[]
    surfaces: Surface[]
    bridges: Bridge[]
    movers: Mover[]
    drawables: [LayerDrawables, LayerDrawables]
    cup: Cup

    private wallsByLayer: [Collider[], Collider[]]

    constructor(o: HoleOptions){
        this.par = o.par
        this.tee = o.tee
        this.theme = o.theme
        this.time = 0

        this.fairways = o.fairways
        this.balls = o.balls
        this.walls = o.walls
        this.surfaces = o.surfaces
        this.bridges = o.bridges
        this.movers = o.movers
        this.drawables = o.drawables
        this.cup = o.cup

        this.wallsByLayer = [o.walls.filter(w => w.layer === 0), o.walls.filter(w => w.layer === 1)]

        this.setTime(0)
    }

    // Puts every moving object where it should be at time t
    setTime(t: number, dt: number = 0): void {
        this.time = t
        for(const m of this.movers){
            const p = evaluateMotion(m.path, t)
            m.transform.set(p.x, p.y, p.angle, dt)
        }
    }

    update(dt: number): void {
        this.setTime(this.time + dt, dt)

        for(const w of this.walls) w.update?.(dt)
        for(const s of this.surfaces) s.update(dt)

        for(const ball of this.balls){
            for(const b of this.bridges) b.tryLift(ball)

            const layer = ball.layer === 1 ? 1 : 0
            const sf = surfaceAt(this.surfaces, ball.x, ball.y, layer)
            ball.update(dt, this.wallsByLayer[layer], sf)

            // Rolled off the end of a deck: back down to the ground
            if(ball.layer === 1 && !ball.airborne() && !this.bridges.some(b => b.shape.contains(ball.x, ball.y))){
                ball.layer = 0
            }

            if(ball.layer === 0) this.cup.update(dt, ball)
        }
    }

    drawGround(ctx: CanvasRenderingContext2D, grass: CanvasPattern): void {
        for(const f of this.fairways){
            const b = f.shape.bounds()

            ctx.save()

            // Everything until restore() only shows up inside this fairway
            ctx.beginPath()
            f.shape.trace(ctx)
            ctx.clip()

            ctx.fillStyle = f.color ?? grass
            ctx.fillRect(b.x, b.y, b.w, b.h)

            // A thick dark line along the outline. Only its inner half is inside the clip,
            // so it reads as a soft shadow where the grass meets the rails
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)'
            ctx.lineWidth = 36
            ctx.lineJoin = 'round'
            ctx.beginPath()
            f.shape.trace(ctx)
            ctx.stroke()

            ctx.restore()
        }
    }

    // `focus` is the ball the flag fades out for. Leave it out (e.g. in the editor) to always show the flag
    draw(ctx: CanvasRenderingContext2D, focus?: Ball): void {
        const [ground, raised] = this.drawables

        for(const d of ground.ground) d.display(ctx)
        for(const d of ground.solid) d.display(ctx)
        this.cup.display(ctx)
        for(const ball of this.balls) if(ball.layer === 0) ball.display(ctx)

        for(const d of raised.ground) d.display(ctx)
        for(const d of raised.solid) d.display(ctx)
        for(const ball of this.balls) if(ball.layer === 1) ball.display(ctx)

        this.cup.drawFlag(ctx, focus ?? null)
    }
}
