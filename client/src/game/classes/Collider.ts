import type { Ball } from './Ball'

// Anything the ball bounces off. Ball.collide only needs the closest point on it,
// its thickness and bounciness, so walls of any shape can share the same collision code
export interface Collider {
    r: number
    bounce: number

    closestPoint(px: number, py: number): [number, number]
    display(ctx: CanvasRenderingContext2D): void

    update?(dt: number): void
    // Called when the ball hits it, with the direction pointing from the collider to the ball
    onHit?(ball: Ball, nx: number, ny: number): void
}
