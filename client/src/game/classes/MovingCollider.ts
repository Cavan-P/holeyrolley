import type { Collider } from './Collider'
import type { Transform } from './Transform'
import type { Ball } from './Ball'
import type { Point } from '../shapes/Shape'

export class MovingCollider implements Collider {
    inner: Collider
    transform: Transform

    constructor(inner: Collider, transform: Transform){
        this.inner = inner
        this.transform = transform
    }

    get r(): number { return this.inner.r }
    get bounce(): number { return this.inner.bounce }
    get layer(): number { return this.inner.layer }

    closestPoint(px: number, py: number): [number, number] {
        const [lx, ly] = this.transform.toLocal(px, py)
        const [cx, cy] = this.inner.closestPoint(lx, ly)
        return this.transform.toWorld(cx, cy)
    }

    velocityAt(x: number, y: number): Point {
        return this.transform.velocityAt(x, y)
    }

    update(dt: number): void {
        this.inner.update?.(dt)
    }

    onHit(ball: Ball, nx: number, ny: number): void {
        this.inner.onHit?.(ball, nx, ny)
    }

    display(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        this.transform.apply(ctx)
        this.inner.display(ctx)
        ctx.restore()
    }
}
