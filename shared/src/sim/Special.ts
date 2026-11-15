import type { Ball } from './Ball'
import type { Collider } from './Collider'
import type { Phase } from '../course'
import type { Point } from './shapes/Shape'

export const BREAK_RESPAWN = 6
export const PHASE_WARN = 0.5

class Wrapper implements Collider {
    inner: Collider

    constructor(inner: Collider){
        this.inner = inner
    }

    get r(): number { return this.inner.r }
    get bounce(): number { return this.inner.bounce }
    get layer(): number { return this.inner.layer }
    get low(): boolean { return this.inner.low ?? false }

    closestPoint(px: number, py: number): [number, number] {
        return this.inner.closestPoint(px, py)
    }

    velocityAt(x: number, y: number): Point {
        return this.inner.velocityAt?.(x, y) ?? [0, 0]
    }

    active(): boolean {
        return this.inner.active?.() ?? true
    }

    setTime(t: number): void {
        this.inner.setTime?.(t)
    }

    update(dt: number): void {
        this.inner.update?.(dt)
    }

    onHit(ball: Ball, nx: number, ny: number): void {
        this.inner.onHit?.(ball, nx, ny)
    }
}

export class Low extends Wrapper {
    override get low(): boolean { return true }
}

export class Breakable extends Wrapper {
    hits: number
    left: number
    broken: number

    constructor(inner: Collider, hits: number){
        super(inner)
        this.hits = Math.max(1, Math.round(hits))
        this.left = this.hits
        this.broken = -1
    }

    override active(): boolean {
        return this.left > 0 && super.active()
    }

    override update(dt: number): void {
        super.update(dt)
        if(this.left > 0) return

        this.broken += dt
        if(this.broken >= BREAK_RESPAWN){
            this.left = this.hits
            this.broken = -1
        }
    }

    override onHit(ball: Ball, nx: number, ny: number): void {
        super.onHit(ball, nx, ny)
        this.left--
        if(this.left <= 0) this.broken = 0
    }
}

export class Phased extends Wrapper {
    phase: Phase
    time: number

    constructor(inner: Collider, phase: Phase){
        super(inner)
        this.phase = { on: Math.max(0.2, phase.on), off: Math.max(0.2, phase.off), offset: phase.offset }
        this.time = 0
    }

    cycle(): number {
        const period = this.phase.on + this.phase.off
        return (((this.time + this.phase.offset) % period) + period) % period
    }

    solid(): boolean {
        return this.cycle() < this.phase.on
    }

    progress(): number {
        const c = this.cycle()
        return c < this.phase.on ? c / this.phase.on : (c - this.phase.on) / this.phase.off
    }

    override active(): boolean {
        return this.solid() && super.active()
    }

    override setTime(t: number): void {
        super.setTime(t)
        this.time = t
    }
}
