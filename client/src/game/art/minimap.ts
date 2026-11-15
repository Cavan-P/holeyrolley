import type { HoleView } from '../classes/HoleView'
import type { Camera } from '../classes/Camera'
import { traceShape } from '../draw'
import type { Theme } from './themes'

const MAX_SIZE = 200
const MARGIN = 16

export function drawMinimap(ctx: CanvasRenderingContext2D, view: HoleView, camera: Camera, theme: Theme): void {
    const hole = view.hole
    const b = hole.bounds
    const scale = Math.min(MAX_SIZE / b.w, MAX_SIZE / b.h)
    const w = b.w * scale
    const h = b.h * scale

    ctx.save()
    ctx.translate(camera.viewW - w - MARGIN, camera.viewH - h - MARGIN)

    ctx.beginPath()
    ctx.roundRect(0, 0, w, h, 12)
    ctx.fillStyle = theme.scenery
    ctx.fill()
    ctx.save()
    ctx.clip()

    ctx.scale(scale, scale)
    ctx.translate(-b.x, -b.y)

    for(const f of hole.fairways){
        ctx.beginPath()
        traceShape(ctx, f.shape)
        ctx.fillStyle = f.color ?? theme.turf
        ctx.fill()
    }

    view.draw(ctx)

    // Divide by scale so dots and lines stay a fixed size on screen
    for(const ball of hole.balls){
        if(ball.holed()) continue

        ctx.beginPath()
        ctx.arc(ball.x, ball.y, 4.5 / scale, 0, Math.PI * 2)
        ctx.fillStyle = ball.color
        ctx.fill()
        ctx.lineWidth = 1.5 / scale
        ctx.strokeStyle = 'white'
        ctx.stroke()
    }

    // Trim the view to the map so its outline doesn't get cut off at the edges
    const v = camera.visibleRect()
    const inset = 1 / scale
    const left = Math.max(v.x, b.x + inset)
    const top = Math.max(v.y, b.y + inset)
    const right = Math.min(v.x + v.w, b.x + b.w - inset)
    const bottom = Math.min(v.y + v.h, b.y + b.h - inset)

    if(right > left && bottom > top){
        ctx.lineWidth = 1.5 / scale
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
        ctx.strokeRect(left, top, right - left, bottom - top)
    }

    ctx.restore()

    ctx.beginPath()
    ctx.roundRect(0, 0, w, h, 12)
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.stroke()

    ctx.restore()
}
