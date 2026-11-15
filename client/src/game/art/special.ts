import { type Collider, type Portal, type Surface, Breakable, BREAK_RESPAWN, Conveyor, Low, MovingCollider, Phased, PHASE_WARN, Spring, Wall } from '@holey/shared'
import { applyTransform, traceShape } from '../draw'

const now = () => performance.now() / 1000

function withBase(ctx: CanvasRenderingContext2D, c: Collider, fn: (w: Wall) => void): void {
    if(c instanceof Breakable || c instanceof Phased || c instanceof Low){
        withBase(ctx, c.inner, fn)
        return
    }
    if(c instanceof MovingCollider){
        ctx.save()
        applyTransform(ctx, c.transform)
        withBase(ctx, c.inner, fn)
        ctx.restore()
        return
    }
    if(c instanceof Wall) fn(c)
}

export function drawSpecial(ctx: CanvasRenderingContext2D, c: Collider, drawInner: (inner: Collider) => void): boolean {
    if(c instanceof Low){
        drawInner(c.inner)
        return true
    }

    if(c instanceof Phased){
        const solid = c.solid()
        const p = c.progress()
        const remaining = (1 - p) * (solid ? c.phase.on : c.phase.off)
        const warn = remaining < PHASE_WARN && Math.floor(now() * 12) % 2 === 0

        ctx.save()
        ctx.globalAlpha *= solid ? (warn ? 0.55 : 1) : (warn ? 0.5 : 0.22)
        drawInner(c.inner)
        ctx.restore()
        return true
    }

    if(c instanceof Breakable){
        if(c.left > 0){
            drawInner(c.inner)
            const damage = 1 - c.left / c.hits
            if(damage > 0) withBase(ctx, c, w => drawCracks(ctx, w, damage))
            return true
        }

        const t = c.broken
        if(t < 0.6) withBase(ctx, c, w => drawShards(ctx, w, t / 0.6))

        ctx.save()
        ctx.globalAlpha *= 0.08 + 0.25 * Math.max(0, (t - BREAK_RESPAWN + 1.5) / 1.5)
        drawInner(c.inner)
        ctx.restore()
        return true
    }

    return false
}

function drawCracks(ctx: CanvasRenderingContext2D, w: Wall, damage: number): void {
    const mx = (w.x1 + w.x2) / 2
    const my = (w.y1 + w.y2) / 2
    const n = Math.ceil(damage * 4)

    ctx.save()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'
    ctx.beginPath()
    for(let i = 0; i < n; i++){
        const a = i * 2.4 + 0.5
        ctx.moveTo(mx, my)
        ctx.lineTo(mx + Math.cos(a) * w.r * 0.6, my + Math.sin(a) * w.r * 0.6)
        ctx.lineTo(mx + Math.cos(a + 0.4) * w.r * 0.95, my + Math.sin(a + 0.4) * w.r * 0.95)
    }
    ctx.stroke()
    ctx.restore()
}

function drawShards(ctx: CanvasRenderingContext2D, w: Wall, p: number): void {
    const mx = (w.x1 + w.x2) / 2
    const my = (w.y1 + w.y2) / 2

    ctx.save()
    ctx.fillStyle = `rgba(220, 245, 255, ${1 - p})`
    for(let i = 0; i < 8; i++){
        const a = i / 8 * Math.PI * 2 + 0.3
        const d = w.r * (0.5 + p * 2.2)
        const x = mx + Math.cos(a) * d
        const y = my + Math.sin(a) * d
        ctx.beginPath()
        ctx.moveTo(x, y - 4)
        ctx.lineTo(x + 4, y + 3)
        ctx.lineTo(x - 3, y + 4)
        ctx.closePath()
        ctx.fill()
    }
    ctx.restore()
}

export function drawSpring(ctx: CanvasRenderingContext2D, s: Surface, color: string): void {
    if(!(s instanceof Spring)) return
    const t = now()
    const b = s.shape.bounds()

    ctx.save()
    ctx.beginPath()
    traceShape(ctx, s.shape)
    ctx.fillStyle = color
    ctx.fill()
    ctx.clip()

    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    const max = Math.hypot(b.w, b.h) / 2

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)'
    ctx.lineWidth = 4
    for(let i = 0; i < 4; i++){
        const r = ((t * 0.8 + i / 4) % 1) * max
        ctx.globalAlpha = 1 - r / max
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.stroke()
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.beginPath()
    ctx.moveTo(cx, cy - 16)
    ctx.lineTo(cx + 12, cy)
    ctx.lineTo(cx + 5, cy)
    ctx.lineTo(cx + 5, cy + 12)
    ctx.lineTo(cx - 5, cy + 12)
    ctx.lineTo(cx - 5, cy)
    ctx.lineTo(cx - 12, cy)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
}

export function drawConveyor(ctx: CanvasRenderingContext2D, s: Surface, color: string): void {
    if(!(s instanceof Conveyor)) return
    const t = now()
    const b = s.shape.bounds()
    const speed = Math.hypot(s.vx, s.vy)
    const angle = Math.atan2(s.vy, s.vx)
    const SPACING = 40

    ctx.save()
    ctx.beginPath()
    traceShape(ctx, s.shape)
    ctx.fillStyle = color
    ctx.fill()
    ctx.clip()

    ctx.translate(b.x + b.w / 2, b.y + b.h / 2)
    ctx.rotate(angle)
    const reach = Math.hypot(b.w, b.h) / 2 + SPACING
    const off = (t * speed) % SPACING

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.lineWidth = 3
    ctx.beginPath()
    for(let x = -reach; x <= reach; x += SPACING / 2){
        ctx.moveTo(x + (off % (SPACING / 2)), -reach)
        ctx.lineTo(x + (off % (SPACING / 2)), reach)
    }
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255, 220, 90, 0.85)'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    for(let y = -reach; y <= reach; y += SPACING * 1.5){
        for(let x = -reach; x <= reach; x += SPACING){
            ctx.moveTo(x + off - 6, y - 9)
            ctx.lineTo(x + off + 4, y)
            ctx.lineTo(x + off - 6, y + 9)
        }
    }
    ctx.stroke()

    ctx.restore()
}

export function drawPortal(ctx: CanvasRenderingContext2D, p: Portal, color: string): void {
    const t = now()

    for(const [x, y, k] of [[p.ax, p.ay, 1], [p.bx, p.by, -1]] as const){
        ctx.save()
        const g = ctx.createRadialGradient(x, y, 2, x, y, p.radius * 1.4)
        g.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
        g.addColorStop(0.35, color)
        g.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, p.radius * 1.4, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        for(let i = 0; i < 3; i++){
            const a = t * 3 * k + i * Math.PI * 2 / 3
            ctx.beginPath()
            ctx.arc(x, y, p.radius * (0.55 + i * 0.15), a, a + 1.6)
            ctx.stroke()
        }
        ctx.restore()
    }

    ctx.save()
    ctx.setLineDash([4, 14])
    ctx.lineDashOffset = -t * 30
    ctx.strokeStyle = color
    ctx.globalAlpha = 0.25
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(p.ax, p.ay)
    ctx.lineTo(p.bx, p.by)
    ctx.stroke()
    ctx.restore()
}
