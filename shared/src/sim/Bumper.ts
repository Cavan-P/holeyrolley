import { Wall } from './Wall'
import type { Ball } from './Ball'

// How fast the hit flash fades, per second
const FLASH_FADE = 5

// A springy wall that kicks the ball away and flashes when hit.
// Give it the same start and end point to make a round post
export class Bumper extends Wall {
    flash: number
    // Extra speed (pixels/second) added straight away from the bumper on every hit
    kick: number

    constructor(x1: number, y1: number, x2: number, y2: number, r: number, kick: number = 260, layer: number = 0){
        super(x1, y1, x2, y2, r, 1, layer)
        this.flash = 0
        this.kick = kick
    }

    onHit(ball: Ball, nx: number, ny: number): void {
        ball.vx += nx * this.kick
        ball.vy += ny * this.kick
        this.flash = 1
    }

    update(dt: number): void {
        this.flash = Math.max(0, this.flash - FLASH_FADE * dt)
    }
}
