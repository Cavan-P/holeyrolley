import type { Ball } from './Ball'
import type { Transform } from './Transform'

export const MAX_MAGNET = 600

export class Magnet {
    x: number
    y: number
    radius: number
    strength: number
    layer: number
    transform: Transform | null

    constructor(x: number, y: number, radius: number, strength: number, layer: number, transform: Transform | null){
        this.x = x
        this.y = y
        this.radius = radius
        this.strength = Math.max(-MAX_MAGNET, Math.min(MAX_MAGNET, strength))
        this.layer = layer
        this.transform = transform
    }

    center(): [number, number] {
        return this.transform ? this.transform.toWorld(this.x, this.y) : [this.x, this.y]
    }

    pull(ball: Ball, dt: number): void {
        const [cx, cy] = this.center()
        const dx = cx - ball.x
        const dy = cy - ball.y
        const d = Math.hypot(dx, dy)
        if(d >= this.radius || d < 1) return

        const a = this.strength * (1 - d / this.radius) * dt
        ball.vx += dx / d * a
        ball.vy += dy / d * a
    }
}
