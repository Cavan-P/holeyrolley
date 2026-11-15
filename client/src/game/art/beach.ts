import { type Collider, type Skin, type Surface, Bumper, MovingCollider, Wall } from '@holey/shared'
import { applyTransform, traceShape } from '../draw'
import { drawWorldCollider, drawWorldDecor } from './worlds'
import { drawSpecial } from './special'
import { drawPropCollider, drawPropDecor } from './props'

function seeded(x: number, y: number): () => number {
    let s = Math.abs(Math.floor(x * 73856093) ^ Math.floor(y * 19349663)) % 2147483647 || 1
    return () => {
        s = s * 16807 % 2147483647
        return s / 2147483647
    }
}

export function drawSkinnedCollider(ctx: CanvasRenderingContext2D, c: Collider, skin: Skin, color: string, flashColor: string): void {
    if(drawSpecial(ctx, c, inner => drawSkinnedCollider(ctx, inner, skin, color, flashColor))) return
    if(c instanceof MovingCollider){
        ctx.save()
        applyTransform(ctx, c.transform)
        drawSkinnedCollider(ctx, c.inner, skin, color, flashColor)
        ctx.restore()
        return
    }
    if(!(c instanceof Wall)) return

    const len = Math.hypot(c.x2 - c.x1, c.y2 - c.y1)

    switch(skin){
        case 'crab':
            drawCrab(ctx, c, color)
            break
        case 'starfish':
            drawStarfish(ctx, c.x1, c.y1, c.r, c instanceof Bumper && c.flash > 0 ? flashColor : color)
            break
        case 'shell':
            drawShell(ctx, c.x1, c.y1, c.r)
            break
        case 'rock': {
            const count = Math.max(1, Math.ceil(len / (c.r * 1.4)))
            for(let i = 0; i <= (len ? count : 0); i++){
                const t = len ? i / count : 0
                drawRock(ctx, c.x1 + (c.x2 - c.x1) * t, c.y1 + (c.y2 - c.y1) * t, c.r * 1.15, color)
            }
            break
        }
        default:
            if(!drawWorldCollider(ctx, c, skin, color, flashColor)) drawPropCollider(ctx, c, skin, color, flashColor)
    }
}

function drawRock(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
    const rand = seeded(x, y)
    const points: [number, number][] = []
    const spin = rand() * Math.PI

    for(let i = 0; i < 8; i++){
        const a = spin + i / 8 * Math.PI * 2
        const d = r * (0.85 + rand() * 0.25)
        points.push([Math.cos(a) * d, Math.sin(a) * d])
    }

    const trace = (ox: number, oy: number, k: number) => {
        ctx.beginPath()
        points.forEach(([px, py], i) => i ? ctx.lineTo(x + ox + px * k, y + oy + py * k) : ctx.moveTo(x + ox + px * k, y + oy + py * k))
        ctx.closePath()
    }

    ctx.save()
    ctx.lineJoin = 'round'

    trace(3, 4, 1)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fill()

    trace(0, 0, 1)
    ctx.fillStyle = color
    ctx.fill()

    trace(-r * 0.2, -r * 0.25, 0.5)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fill()

    ctx.restore()
}

function drawShell(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    const rand = seeded(x, y)

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((rand() - 0.5) * 1.2)

    const by = r * 0.55
    const R = r * 1.3

    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
    ctx.beginPath()
    ctx.moveTo(3, by + 4)
    ctx.arc(3, by + 4, R, Math.PI * 1.17, Math.PI * 1.83)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#f7d6c8'
    ctx.beginPath()
    ctx.moveTo(0, by)
    ctx.arc(0, by, R, Math.PI * 1.17, Math.PI * 1.83)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = '#d9937f'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.beginPath()
    for(let i = 1; i < 7; i++){
        const a = Math.PI * (1.17 + 0.66 * i / 7)
        ctx.moveTo(0, by)
        ctx.lineTo(Math.cos(a) * R * 0.95, by + Math.sin(a) * R * 0.95)
    }
    ctx.stroke()

    ctx.fillStyle = '#e8b4a3'
    ctx.beginPath()
    ctx.roundRect(-r * 0.4, by - r * 0.15, r * 0.8, r * 0.35, 3)
    ctx.fill()

    ctx.restore()
}

function drawStarfish(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
    const rand = seeded(x, y)
    const outer = r * 1.35
    const inner = r * 0.55

    const rand0 = rand() * Math.PI

    const trace = (ox: number, oy: number) => {
        ctx.beginPath()
        for(let i = 0; i < 10; i++){
            const a = rand0 + i / 10 * Math.PI * 2
            const d = i % 2 ? inner : outer
            const px = x + ox + Math.cos(a) * d
            const py = y + oy + Math.sin(a) * d
            if(i) ctx.lineTo(px, py)
            else ctx.moveTo(px, py)
        }
        ctx.closePath()
    }

    ctx.save()
    ctx.lineJoin = 'round'
    ctx.lineWidth = r * 0.45

    trace(3, 4)
    ctx.fillStyle = ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)'
    ctx.fill()
    ctx.stroke()

    trace(0, 0)
    ctx.fillStyle = ctx.strokeStyle = color
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
    for(let i = 0; i < 5; i++){
        const a = rand0 + i / 5 * Math.PI * 2
        for(const k of [0.35, 0.7]){
            ctx.beginPath()
            ctx.arc(x + Math.cos(a) * outer * k, y + Math.sin(a) * outer * k, r * 0.09, 0, Math.PI * 2)
            ctx.fill()
        }
    }

    ctx.restore()
}

function drawCrab(ctx: CanvasRenderingContext2D, w: Wall, color: string): void {
    const t = performance.now() / 1000
    const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1)
    const hl = len / 2 + w.r
    const d = w.r * 1.1

    ctx.save()
    ctx.translate((w.x1 + w.x2) / 2, (w.y1 + w.y2) / 2)
    ctx.rotate(Math.atan2(w.y2 - w.y1, w.x2 - w.x1))

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.beginPath()
    ctx.ellipse(3, 5, hl, d, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#b8402e'
    ctx.lineWidth = 3.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    for(const side of [-1, 1]){
        for(let i = 0; i < 3; i++){
            const wiggle = Math.sin(t * 16 + i * 2 + side) * 4
            const y0 = -d * 0.3 + i * d * 0.45
            ctx.moveTo(side * hl * 0.7, y0)
            ctx.lineTo(side * (hl + 8), y0 + wiggle - 4)
            ctx.lineTo(side * (hl + 14), y0 + wiggle + 6)
        }
    }
    ctx.stroke()

    ctx.lineWidth = 5
    ctx.beginPath()
    for(const side of [-1, 1]){
        ctx.moveTo(side * hl * 0.45, -d * 0.6)
        ctx.lineTo(side * hl * 0.65, -d - 8)
    }
    ctx.stroke()

    ctx.fillStyle = color
    for(const side of [-1, 1]){
        const snap = Math.max(0, Math.sin(t * 5 + side)) * 0.5
        ctx.beginPath()
        ctx.arc(side * hl * 0.65, -d - 12, 8, Math.PI * 0.5 + snap, Math.PI * 2.5 - snap)
        ctx.lineTo(side * hl * 0.65, -d - 12)
        ctx.fill()
    }

    ctx.beginPath()
    ctx.ellipse(0, 0, hl, d, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
    ctx.beginPath()
    ctx.ellipse(-hl * 0.15, -d * 0.3, hl * 0.6, d * 0.4, 0, 0, Math.PI * 2)
    ctx.fill()

    for(const side of [-1, 1]){
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(side * 6, -d + 1, 4.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#1b2a22'
        ctx.beginPath()
        ctx.arc(side * 6, -d, 2.2, 0, Math.PI * 2)
        ctx.fill()
    }

    ctx.restore()
}

export function drawSurf(ctx: CanvasRenderingContext2D, s: Surface): void {
    ctx.save()
    ctx.beginPath()
    traceShape(ctx, s.shape)
    ctx.clip()

    ctx.lineJoin = 'round'

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)'
    ctx.lineWidth = 70
    ctx.beginPath()
    traceShape(ctx, s.shape)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 7
    ctx.setLineDash([34, 20])
    ctx.lineDashOffset = -performance.now() / 1000 * 18
    ctx.beginPath()
    traceShape(ctx, s.shape)
    ctx.stroke()

    ctx.restore()
}

export function drawDecorSkin(ctx: CanvasRenderingContext2D, skin: Skin, w: number, h: number, color: string): void {
    const r = Math.min(w, h) / 2

    switch(skin){
        case 'palm': {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
            ctx.beginPath()
            ctx.arc(r * 0.25, r * 0.3, r * 0.9, 0, Math.PI * 2)
            ctx.fill()

            for(let i = 0; i < 7; i++){
                const a = i / 7 * Math.PI * 2
                ctx.save()
                ctx.rotate(a)
                ctx.fillStyle = i % 2 ? '#3f9b4b' : '#4fae58'
                ctx.beginPath()
                ctx.moveTo(0, 0)
                ctx.quadraticCurveTo(r * 0.5, -r * 0.32, r, 0)
                ctx.quadraticCurveTo(r * 0.5, r * 0.32, 0, 0)
                ctx.fill()
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.moveTo(0, 0)
                ctx.lineTo(r * 0.92, 0)
                ctx.stroke()
                ctx.restore()
            }

            ctx.fillStyle = '#7a5230'
            for(const [cx, cy] of [[-5, -3], [5, -2], [0, 5]]){
                ctx.beginPath()
                ctx.arc(cx!, cy!, r * 0.12, 0, Math.PI * 2)
                ctx.fill()
            }
            break
        }

        case 'umbrella': {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
            ctx.beginPath()
            ctx.arc(r * 0.3, r * 0.35, r, 0, Math.PI * 2)
            ctx.fill()

            for(let i = 0; i < 8; i++){
                ctx.fillStyle = i % 2 ? '#fffaf0' : color
                ctx.beginPath()
                ctx.moveTo(0, 0)
                ctx.arc(0, 0, r, i / 8 * Math.PI * 2, (i + 1) / 8 * Math.PI * 2)
                ctx.closePath()
                ctx.fill()
            }

            ctx.fillStyle = '#7a5230'
            ctx.beginPath()
            ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2)
            ctx.fill()
            break
        }

        case 'towel': {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
            ctx.beginPath()
            ctx.roundRect(-w / 2 + 3, -h / 2 + 4, w, h, 6)
            ctx.fill()

            ctx.save()
            ctx.beginPath()
            ctx.roundRect(-w / 2, -h / 2, w, h, 6)
            ctx.clip()

            const stripe = h / 6
            for(let i = 0; i < 6; i++){
                ctx.fillStyle = i % 2 ? '#fffaf0' : color
                ctx.fillRect(-w / 2, -h / 2 + i * stripe, w, stripe + 1)
            }
            ctx.restore()
            break
        }
        default:
            if(!drawWorldDecor(ctx, skin, w, h, color)) drawPropDecor(ctx, skin, w, h, color)
    }
}
