import type { Ball } from './Ball'
import type { Point } from '../shapes/Shape'

export interface Collider {
    r: number
    bounce: number
    layer: number

    closestPoint(px: number, py: number): [number, number]
    display(ctx: CanvasRenderingContext2D): void

    update?(dt: number): void
    onHit?(ball: Ball, nx: number, ny: number): void
    velocityAt?(x: number, y: number): Point
}
