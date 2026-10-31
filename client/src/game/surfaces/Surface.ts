import type { Ball } from '../classes/Ball'
import type { Shape } from '../shapes/Shape'

export class Surface {
    shape: Shape
    color: string

    dragMul: number
    rollMul: number

    pushes: boolean

    constructor(shape: Shape, color: string, dragMul: number = 1, rollMul: number = 1){
        this.shape = shape
        this.color = color

        this.dragMul = dragMul
        this.rollMul = rollMul

        this.pushes = false
    }

    // Extra forces while the ball is on this surface (slopes, conveyors, ...).
    // Does nothing by default; subclasses override it.
    affect(_ball: Ball, _dt: number): void {}

    // Runs every physics step whether or not a ball is on it (timers, animations).
    // Does nothing by default
    update(_dt: number): void {}

    display(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color
        ctx.beginPath()
        this.shape.trace(ctx)
        ctx.fill()
    }
}

// The surface the point is on. Later surfaces in the list sit on top of earlier ones.
export function surfaceAt(surfaces: Surface[], x: number, y: number): Surface | undefined {
    return surfaces.findLast(s => s.shape.contains(x, y))
}