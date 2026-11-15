import {
    type Shape, type Transform, type Collider, type Surface,
    ArcShape, CircleShape, DonutShape, PolygonShape, RectShape, TransformedShape,
    Wall, ArcWall, Bumper, MovingCollider, Ball, Cup, Bridge, RAMP,
    Ice, Slope, Water, RIPPLE_LIFE, clamp, map
} from '@holey/shared'
import { drawHat } from './art/hats'

export function applyTransform(ctx: CanvasRenderingContext2D, t: Transform): void {
    ctx.translate(t.x + t.px, t.y + t.py)
    ctx.rotate(t.angle)
    ctx.translate(-t.px, -t.py)
}

export function traceShape(ctx: CanvasRenderingContext2D, shape: Shape): void {
    if(shape instanceof TransformedShape){
        ctx.save()
        applyTransform(ctx, shape.transform)
        traceShape(ctx, shape.inner)
        ctx.restore()
    }
    else if(shape instanceof RectShape){
        if(shape.radius > 0) ctx.roundRect(shape.x, shape.y, shape.w, shape.h, shape.radius)
        else ctx.rect(shape.x, shape.y, shape.w, shape.h)
    }
    else if(shape instanceof CircleShape){
        ctx.moveTo(shape.x + shape.r, shape.y)
        ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2)
    }
    else if(shape instanceof DonutShape){
        ctx.moveTo(shape.x + shape.outer, shape.y)
        ctx.arc(shape.x, shape.y, shape.outer, 0, Math.PI * 2)

        // Going round the inner circle the opposite way is what cuts the hole
        ctx.moveTo(shape.x + shape.inner, shape.y)
        ctx.arc(shape.x, shape.y, shape.inner, 0, Math.PI * 2, true)
    }
    else if(shape instanceof ArcShape){
        ctx.moveTo(shape.x + Math.cos(shape.start) * shape.outer, shape.y + Math.sin(shape.start) * shape.outer)
        ctx.arc(shape.x, shape.y, shape.outer, shape.start, shape.end)
        ctx.arc(shape.x, shape.y, shape.inner, shape.end, shape.start, true)
        ctx.closePath()
    }
    else if(shape instanceof PolygonShape){
        const [first, ...rest] = shape.points
        if(!first) return

        ctx.moveTo(first[0], first[1])
        for(const [x, y] of rest) ctx.lineTo(x, y)
        ctx.closePath()
    }
}

export function drawCollider(ctx: CanvasRenderingContext2D, c: Collider, color: string, flashColor: string = color): void {
    if(c instanceof MovingCollider){
        ctx.save()
        applyTransform(ctx, c.transform)
        drawCollider(ctx, c.inner, color, flashColor)
        ctx.restore()
    }
    else if(c instanceof Bumper) drawBumper(ctx, c, color, flashColor)
    else if(c instanceof Wall) drawWall(ctx, c, color)
    else if(c instanceof ArcWall) drawArcWall(ctx, c, color)
}

function drawWall(ctx: CanvasRenderingContext2D, w: Wall, color: string): void {
    // Safari draws nothing for a zero-length line, so round posts are filled circles
    if(w.x1 === w.x2 && w.y1 === w.y2){
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(w.x1, w.y1, w.r, 0, Math.PI * 2)
        ctx.fill()
        return
    }

    ctx.strokeStyle = color
    ctx.lineCap = 'round'

    ctx.beginPath()
    ctx.moveTo(w.x1, w.y1)
    ctx.lineTo(w.x2, w.y2)
    ctx.lineWidth = w.r * 2

    ctx.stroke()
}

function drawArcWall(ctx: CanvasRenderingContext2D, w: ArcWall, color: string): void {
    ctx.strokeStyle = color
    ctx.lineCap = 'round'
    ctx.lineWidth = w.r * 2

    ctx.beginPath()
    ctx.arc(w.x, w.y, w.radius, w.start, w.end)
    ctx.stroke()
}

function drawBumper(ctx: CanvasRenderingContext2D, b: Bumper, baseColor: string, flashColor: string): void {
    const color = b.flash > 0 ? flashColor : baseColor
    // Swells a little on a hit, then settles back
    const r = b.r + b.flash * 3

    ctx.save()

    // Some browsers (Safari) draw nothing for a zero-length line, even with round caps,
    // so round posts are drawn as a filled circle instead
    if(b.x1 === b.x2 && b.y1 === b.y2){
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(b.x1, b.y1, r, 0, Math.PI * 2)
        ctx.fill()
    }
    else {
        ctx.strokeStyle = color
        ctx.lineCap = 'round'
        ctx.lineWidth = r * 2

        ctx.beginPath()
        ctx.moveTo(b.x1, b.y1)
        ctx.lineTo(b.x2, b.y2)
        ctx.stroke()
    }

    ctx.restore()
}

export function drawSurface(ctx: CanvasRenderingContext2D, s: Surface, color: string): void {
    if(s instanceof Bridge){
        drawBridge(ctx, s, color)
        return
    }

    ctx.fillStyle = color
    ctx.beginPath()
    traceShape(ctx, s.shape)
    ctx.fill()

    if(s instanceof Ice) drawIce(ctx, s)
    else if(s instanceof Slope) drawSlope(ctx, s)
    else if(s instanceof Water) drawWater(ctx, s)
}

function drawIce(ctx: CanvasRenderingContext2D, s: Ice): void {
    // A few diagonal streaks of shine across it
    const b = s.shape.bounds()

    ctx.save()
    ctx.beginPath()
    traceShape(ctx, s.shape)
    ctx.clip()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'

    ctx.beginPath()
    for(let x = b.x - b.h; x < b.x + b.w; x += 70){
        ctx.moveTo(x, b.y + b.h)
        ctx.lineTo(x + b.h * 0.6, b.y + b.h * 0.4)
    }
    ctx.stroke()

    ctx.restore()
}

function drawSlope(ctx: CanvasRenderingContext2D, s: Slope): void {
    const SPACING = 48
    const speed = Math.hypot(s.fx, s.fy) * 0.15

    const b = s.shape.bounds()
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2

    const reach = Math.hypot(b.w, b.h) / 2 + SPACING

    const offset = (performance.now() / 1000 * speed) % SPACING

    ctx.save()

    ctx.beginPath()
    traceShape(ctx, s.shape)
    ctx.clip()

    ctx.translate(cx, cy)
    ctx.rotate(Math.atan2(s.fy, s.fx))

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    for(let y = -reach; y <= reach; y += SPACING){
        for(let x = -reach; x <= reach; x += SPACING){
            drawArrow(ctx, x + offset, y)
        }
    }

    ctx.restore()
}

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.beginPath()
    ctx.moveTo(x - 10, y)
    ctx.lineTo(x + 10, y)
    ctx.moveTo(x + 4, y - 6)
    ctx.lineTo(x + 10, y)
    ctx.lineTo(x + 4, y + 6)
    ctx.stroke()
}

function drawWater(ctx: CanvasRenderingContext2D, s: Water): void {
    ctx.save()
    ctx.beginPath()
    traceShape(ctx, s.shape)
    ctx.clip()

    ctx.lineWidth = 2

    for(const r of s.ripples){
        if(r.age < 0) continue

        const t = r.age / RIPPLE_LIFE
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * (1 - t)})`

        ctx.beginPath()
        ctx.arc(r.x, r.y, 4 + r.size * t, 0, Math.PI * 2)
        ctx.stroke()
    }

    ctx.restore()
}

function drawBridge(ctx: CanvasRenderingContext2D, bridge: Bridge, color: string): void {
    const L = bridge.length
    const W = bridge.width

    ctx.save()
    applyTransform(ctx, bridge.place)

    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
    ctx.beginPath()
    ctx.roundRect(-L / 2 + 6, -W / 2 + 10, L, W, 6)
    ctx.fill()

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(-L / 2, -W / 2, L, W, 6)
    ctx.fill()

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.14)'
    ctx.lineWidth = 2
    ctx.beginPath()
    for(let x = -L / 2 + 14; x < L / 2; x += 14){
        ctx.moveTo(x, -W / 2 + 2)
        ctx.lineTo(x, W / 2 - 2)
    }
    ctx.stroke()

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(-L / 2, -W / 2, RAMP, W)
    ctx.fillRect(L / 2 - RAMP, -W / 2, RAMP, W)

    ctx.restore()
}

export function drawBall(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const sink = ball.sinkProgress()
    if(sink >= 1) return

    const h = ball.height()

    ctx.save()
    ctx.globalAlpha = 1 - sink

    ctx.fillStyle = `rgba(0, 0, 0, ${0.22 - h * 0.08})`
    ctx.beginPath()
    ctx.ellipse(ball.x + 2 + h * 5, ball.y + 3 + h * 5, ball.rad, ball.rad * 0.8, 0, 0, 2 * Math.PI)
    ctx.fill()

    const r = ball.rad * (1 + h * 0.35) * (1 - sink * 0.6)

    ctx.fillStyle = ball.color
    ctx.beginPath()
    ctx.ellipse(ball.x, ball.y - h * 10, r, r, 0, 0, 2 * Math.PI)
    ctx.fill()

    drawHat(ctx, ball.cosmetics.hat, ball.x, ball.y - h * 10, r)

    ctx.restore()
}

export type CupColors = { holeRim: string, hole: string }

export function readCupColors(): CupColors {
    const css = getComputedStyle(document.documentElement)
    return {
        holeRim: css.getPropertyValue('--color-hole').trim(),
        hole: css.getPropertyValue('--color-hole-in').trim()
    }
}

export function drawCup(ctx: CanvasRenderingContext2D, cup: Cup, colors: CupColors): void {

    ctx.fillStyle = colors.holeRim
    ctx.beginPath()
    ctx.ellipse(cup.x, cup.y, cup.r + 3, cup.r + 3, 0, 0, Math.PI * 2)

    ctx.fill()

    ctx.fillStyle = colors.hole
    ctx.beginPath()
    ctx.ellipse(cup.x, cup.y, cup.r, cup.r, 0, 0, Math.PI * 2)

    ctx.fill()
}

export function drawFlag(ctx: CanvasRenderingContext2D, cup: Cup, ball: Ball | null): void {
    const d = ball ? Math.hypot(ball.x - cup.x, ball.y - cup.y) : Infinity
    const a = clamp(map(d, 30, 90, 60, 255), 60, 255) / 255

    ctx.save()

    ctx.strokeStyle = `rgba(244, 239, 223, ${a})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(cup.x, cup.y)
    ctx.lineTo(cup.x, cup.y - 50)
    ctx.stroke()

    ctx.fillStyle = `rgba(242, 181, 68, ${a})`
    ctx.beginPath()
    ctx.moveTo(cup.x, cup.y - 50)
    ctx.lineTo(cup.x + 26, cup.y - 42)
    ctx.lineTo(cup.x, cup.y - 34)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
}
