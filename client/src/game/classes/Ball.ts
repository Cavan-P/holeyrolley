import type { Collider } from './Collider'
import { smooth } from '../utilities/smooth'
import type { Surface } from '../surfaces/Surface'

export const MIN_POWER = 0.05

const CUP_SINK_TIME = 0.35
const WATER_SINK_TIME = 0.6

export class Ball {
    x: number
    y: number

    color: string

    rad: number
    maxSpeed: number
    drag: number
    roll: number
    stopSpeed: number

    vx: number
    vy: number

    lastX: number
    lastY: number
    lastLayer: number

    cupX: number
    cupY: number

    holedTime: number

    airTime: number
    airTotal: number
    airPeak: number

    sinkTime: number

    strokes: number

    layer: number

    constructor(x: number, y: number, color: string){
        this.x = x
        this.y = y

        this.rad = 8
        this.maxSpeed = 1200
        this.drag = 0.9
        this.roll = 110
        this.stopSpeed = 6

        this.vx = 0
        this.vy = 0

        this.lastX = this.x
        this.lastY = this.y
        this.lastLayer = 0

        this.cupX = 0
        this.cupY = 0

        this.color = color

        this.holedTime = -1

        this.airTime = 0
        this.airTotal = 0
        this.airPeak = 0

        this.sinkTime = -1

        this.strokes = 0

        this.layer = 0
    }

    speed(): number {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    }

    shoot(dx: number, dy: number, power: number): boolean {
        if(power < MIN_POWER) return false

        this.lastX = this.x
        this.lastY = this.y
        this.lastLayer = this.layer

        this.vx = dx * power * this.maxSpeed
        this.vy = dy * power * this.maxSpeed

        this.strokes++

        return true
    }

    isMoving(){
        return this.speed() > this.stopSpeed
    }

    dropIn(x: number, y: number): void {
        this.holedTime = 0
        this.cupX = x
        this.cupY = y
    }

    holed(): boolean {
        return this.holedTime >= 0
    }

    resetToLast(): void {
        this.x = this.lastX
        this.y = this.lastY
        this.layer = this.lastLayer
        this.vx = 0
        this.vy = 0
        this.airTime = 0
    }

    sink(): void {
        this.sinkTime = 0
        this.vx = 0
        this.vy = 0
        this.airTime = 0
        this.strokes++
    }

    sinking(): boolean {
        return this.sinkTime >= 0
    }

    launch(seconds: number, peak: number): void {
        this.airTime = seconds
        this.airTotal = seconds
        this.airPeak = peak
    }

    airborne(): boolean {
        return this.airTime > 0
    }

    height(): number {
        if(!this.airborne()) return 0
        return this.airPeak * Math.sin(Math.PI * (1 - this.airTime / this.airTotal))
    }

    collide(w: Collider): void {
        const [cx, cy] = w.closestPoint(this.x, this.y)
        const dx = this.x - cx
        const dy = this.y - cy
        const d = Math.sqrt(dx * dx + dy * dy)
        const minD = this.rad + w.r

        if(d >= minD || !d) return

        const nx = dx / d
        const ny = dy / d

        this.x = cx + nx * minD
        this.y = cy + ny * minD

        const [wvx, wvy] = w.velocityAt?.(cx, cy) ?? [0, 0]
        const vn = (this.vx - wvx) * nx + (this.vy - wvy) * ny
        if(vn < 0){
            this.vx -= (1 + w.bounce) * vn * nx
            this.vy -= (1 + w.bounce) * vn * ny
            w.onHit?.(this, nx, ny)
        }
    }

    update(dt: number, walls: Collider[], ground: Surface | undefined): void {
        const sf = this.airborne() ? undefined : ground
        this.airTime = Math.max(0, this.airTime - dt)

        const drag = this.drag * (sf?.dragMul ?? 1)
        const roll = this.roll * (sf?.rollMul ?? 1)

        if(this.sinking()){
            this.sinkTime += dt

            if(this.sinkTime >= WATER_SINK_TIME){
                this.sinkTime = -1
                this.resetToLast()
            }

            return
        }

        if(this.holed()){
            this.holedTime += dt

            this.x += smooth(this.x, this.cupX, 25, dt)
            this.y += smooth(this.y, this.cupY, 25, dt)

            this.vx = 0
            this.vy = 0

            return
        }

        sf?.affect(this, dt)

        const pushed = sf?.pushes ?? false

        this.x += this.vx * dt
        this.y += this.vy * dt

        const s: number = this.speed()

        if(s > 0){
            const newS = Math.max(0, s - (s * drag + roll) * dt)
            if(newS < this.stopSpeed && !pushed){
                this.vx = 0
                this.vy = 0
            }
            else {
                this.vx *= newS / s
                this.vy *= newS / s
            }
        }

        for(let i = 0; i < 2; i++){
            for(const w of walls) this.collide(w)
        }
    }

    private sinkProgress(): number {
        if(this.holed()) return Math.min(1, this.holedTime / CUP_SINK_TIME)
        if(this.sinking()) return Math.min(1, this.sinkTime / WATER_SINK_TIME)
        return 0
    }

    finished(): boolean {
        return this.holed() && this.holedTime >= CUP_SINK_TIME
    }

    display(ctx: CanvasRenderingContext2D): void {
        const sink = this.sinkProgress()
        if(sink >= 1) return

        const h = this.height()

        ctx.save()
        ctx.globalAlpha = 1 - sink

        ctx.fillStyle = `rgba(0, 0, 0, ${0.22 - h * 0.08})`
        ctx.beginPath()
        ctx.ellipse(this.x + 2 + h * 5, this.y + 3 + h * 5, this.rad, this.rad * 0.8, 0, 0, 2 * Math.PI)
        ctx.fill()

        const r = this.rad * (1 + h * 0.35) * (1 - sink * 0.6)

        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.ellipse(this.x, this.y - h * 10, r, r, 0, 0, 2 * Math.PI)
        ctx.fill()

        ctx.restore()
    }
}