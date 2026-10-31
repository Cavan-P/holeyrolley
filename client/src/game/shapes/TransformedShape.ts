import { Shape, type Bounds, type Point } from './Shape'
import type { Transform } from '../classes/Transform'

export class TransformedShape extends Shape {
    inner: Shape
    transform: Transform

    constructor(inner: Shape, transform: Transform){
        super()
        this.inner = inner
        this.transform = transform
    }

    contains(x: number, y: number): boolean {
        const [lx, ly] = this.transform.toLocal(x, y)
        return this.inner.contains(lx, ly)
    }

    trace(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        this.transform.apply(ctx)
        this.inner.trace(ctx)
        ctx.restore()
    }

    bounds(): Bounds {
        const pts = this.outline().flat()
        const xs = pts.map(p => p[0])
        const ys = pts.map(p => p[1])
        const minX = Math.min(...xs)
        const minY = Math.min(...ys)
        return { x: minX, y: minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY }
    }

    outline(): Point[][] {
        return this.inner.outline().map(loop => loop.map(([x, y]) => this.transform.toWorld(x, y)))
    }
}
