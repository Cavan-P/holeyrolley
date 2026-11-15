import { useEffect, useRef } from 'react'
import { buildHole as buildSimHole, type CourseData } from '@holey/shared'
import { buildHole } from '../game/build'
import { getTheme } from '../game/art/themes'
import { createGrassPattern } from '../game/art/grass'
import { drawBackdrop } from '../game/art/backdrop'

type Props = {
    course: CourseData
    hole: number | 'showcase'
    className?: string
}

const PAD = 0.06

function showcase(course: CourseData, w: number, h: number): number {
    let best = 0
    let bestFill = 0

    course.holes.forEach((data, i) => {
        const b = buildSimHole(data, null).hole.bounds
        const scale = Math.min(w / b.w, h / b.h)
        const fill = b.w * b.h * scale * scale / (w * h) * Math.min(1, data.objects.length / 8)
        if(fill > bestFill){
            bestFill = fill
            best = i
        }
    })

    return best
}

export function HolePreview({ course, hole, className = '' }: Props){
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        const index = hole === 'showcase' ? showcase(course, canvas?.clientWidth ?? 1, canvas?.clientHeight ?? 1) : hole
        const data = course.holes[index]
        if(!canvas || !ctx || !data) return

        const theme = getTheme(course.theme)
        const view = buildHole(data, course, null)
        const grass = createGrassPattern(ctx, theme.turf, theme.turfStripe)

        const draw = () => {
            const w = canvas.clientWidth
            const h = canvas.clientHeight
            if(!w || !h) return

            const dpr = window.devicePixelRatio || 1
            canvas.width = w * dpr
            canvas.height = h * dpr

            const b = view.hole.bounds
            const scale = Math.min(w / b.w, h / b.h) * (1 - PAD * 2)
            const cx = b.x + b.w / 2
            const cy = b.y + b.h / 2

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.fillStyle = theme.scenery
            ctx.fillRect(0, 0, w, h)

            ctx.translate(w / 2, h / 2)
            ctx.scale(scale, scale)
            ctx.translate(-cx, -cy)

            drawBackdrop(ctx, theme, { x: cx - w / 2 / scale, y: cy - h / 2 / scale, w: w / scale, h: h / scale }, 0)
            view.drawGround(ctx, grass)
            view.draw(ctx)
        }

        draw()
        const observer = new ResizeObserver(draw)
        observer.observe(canvas)
        return () => observer.disconnect()
    }, [course, hole])

    return <canvas ref={canvasRef} aria-hidden='true' className={`block ${className}`} />
}
