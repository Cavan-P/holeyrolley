import { Wall } from './Wall'
import { smooth } from '../utilities/smooth'

export class Ball {
    x: number
    y: number

    color: string

    rad: number
    maxSpeed: number
    maxPull: number
    drag: number
    roll: number
    stopSpeed: number

    vx: number
    vy: number

    lastX: number
    lastY: number

    cupX: number
    cupY: number

    holedTime: number

    constructor(x: number, y: number, color: string){
        this.x = x
        this.y = y

        this.rad = 8
        this.maxSpeed = 950
        this.maxPull = 140
        this.drag = 0.9
        this.roll = 110
        this.stopSpeed = 6

        this.vx = 0
        this.vy = 0

        this.lastX = this.x
        this.lastY = this.y

        this.cupX = 0
        this.cupY = 0

        this.color = color

        this.holedTime = -1
    }

    speed(): number {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    }

    pull(mouse: { x: number, y: number}): {dx: number, dy: number, power: number}{
        const px: number = this.x - mouse.x
        const py: number = this.y - mouse.y
        const len: number = Math.sqrt(px * px + py * py)
        if(!len) return { dx: 0, dy: 0, power: 0 }

        return { dx: px / len, dy: py / len, power: Math.min(len, this.maxPull) / this.maxPull }
    }

    release(mouse: { x: number, y: number}): boolean {
        const { dx, dy, power } = this.pull(mouse)

        if(power < 0.05) return false

        this.lastX = this.x
        this.lastY = this.y

        this.vx = dx * power * this.maxSpeed
        this.vy = dy * power * this.maxSpeed

        return true
    }

    isMoving(){
        return this.speed() > 0
    }

    dropIn(x: number, y: number): void {
        this.holedTime = 0
        this.cupX = x
        this.cupY = y
    }

    holed(): boolean {
        return this.holedTime >= 0
    }

    collide(w: Wall): void {
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

        const vn = this.vx * nx + this.vy * ny
        if(vn < 0){
            this.vx -= (1 + w.bounce) * vn * nx
            this.vy -= (1 + w.bounce) * vn * ny
        }
    }

    update(dt: number, walls: Wall[]): void {
        if(this.holed()){
            this.holedTime += dt

            this.x += smooth(this.x, this.cupX, 25, dt)
            this.y += smooth(this.y, this.cupY, 25, dt)

            this.vx = 0
            this.vy = 0
        }

        this.x += this.vx * dt
        this.y += this.vy * dt

        const s: number = this.speed()

        if(s > 0){
            const newS = Math.max(0, s - (s * this.drag + this.roll) * dt)
            if(newS < this.stopSpeed){
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

    display(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath()
        ctx.ellipse(this.x, this.y, this.rad, this.rad, 0, 0, 2 * Math.PI)
        
        ctx.fillStyle = this.color
        ctx.fill()
    }
}