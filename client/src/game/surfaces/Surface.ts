import type { Ball } from '../classes/Ball'
import type { Shape } from '../shapes/Shape'

export class Surface {
    shape: Shape
    color: string

    dragMul: number
    rollMul: number

    pushes: boolean

    layer: number

    constructor(shape: Shape, color: string, dragMul: number = 1, rollMul: number = 1){
        this.shape = shape
        this.color = color

        this.dragMul = dragMul
        this.rollMul = rollMul

        this.pushes = false
        this.layer = 0
    }

    affect(_ball: Ball, _dt: number): void {}

    update(_dt: number): void {}

    display(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color
        ctx.beginPath()
        this.shape.trace(ctx)
        ctx.fill()
    }
}

export function surfaceAt(surfaces: Surface[], x: number, y: number, layer: number = 0): Surface | undefined {
    return surfaces.findLast(s => s.layer === layer && s.shape.contains(x, y))
}