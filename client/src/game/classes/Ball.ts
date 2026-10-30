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

        this.color = color
    }

    private speed(): number {
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

    update(dt: number): void {
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
    }

    display(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath()
        ctx.ellipse(this.x, this.y, this.rad, this.rad, 0, 0, 2 * Math.PI)
        
        ctx.fillStyle = this.color
        ctx.fill()
    }
}