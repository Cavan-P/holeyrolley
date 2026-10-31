import { useEffect, useRef } from 'react'
import type { Cosmetics} from '@holey/shared'
import { Ball } from '../game/classes/Ball'
import { Cup } from '../game/classes/Cup'
import { burst, drawParticles, stepParticles, type Particle } from '../game/art/celebrations'
import { createGrassPattern } from '../game/art/grass'
import { getTheme } from '../game/art/themes'

type Props = {
    cosmetics: Cosmetics
    view: number
    className?: string
    animate?: boolean
}

const LOOP = 3.2
const ARRIVE = 1
const FADE_IN = 0.4

export function BallPreview({ cosmetics, view, className, animate }: Props){
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if(!canvas || !ctx) return

        const theme = getTheme('darkwood')
        const grass = createGrassPattern(ctx, theme.turf, theme.turfStripe)

        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr

        const scale = rect.width / view
        const viewH = rect.height / scale

        const startX = view * 0.18
        const cupX = view * 0.72
        const groundY = viewH * 0.72

        const ball = new Ball(animate ? startX : view / 2, animate ? groundY : viewH * 0.62, cosmetics)
        const cup = new Cup(cupX, groundY)

        let particles: Particle[] = []
        let burstDone = false
        let start = performance.now()
        let last = start
        let frame = 0

        const draw = (now: number) => {
            const dt = Math.min((now - last) / 1000, 0.05)
            last = now

            ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0)

            if(!animate){
                ctx.clearRect(0, 0, view, viewH)
                ball.display(ctx)
                return
            }

            let t = (now - start) / 1000
            if(t >= LOOP){
                start = now
                t = 0
                burstDone = false
            }

            ctx.fillStyle = grass
            ctx.fillRect(0, 0, view, viewH)
            cup.display(ctx)

            if(t < ARRIVE){
                const k = 1 - Math.pow(1 - t / ARRIVE, 3)
                ball.x = startX + (cupX - startX) * k
            }
            else if(!burstDone){
                burstDone = true
                particles.push(...burst(cosmetics.celebration, cupX, groundY))
            }

            const visible = t < ARRIVE || t > LOOP - FADE_IN
            if(visible){
                if(t > LOOP - FADE_IN) ball.x = startX

                ctx.save()
                ctx.globalAlpha = t > LOOP - FADE_IN ? (t - (LOOP - FADE_IN)) / FADE_IN : 1
                ball.display(ctx)
                ctx.restore()
            }

            cup.drawFlag(ctx, visible ? ball : null)

            particles = stepParticles(particles, dt)
            drawParticles(ctx, particles)

            frame = requestAnimationFrame(draw)
        }

        frame = requestAnimationFrame(draw)
        return () => cancelAnimationFrame(frame)
    }, [cosmetics.color, cosmetics.hat, cosmetics.celebration, animate, view])

    return <canvas ref={canvasRef} aria-hidden='true' className={className} />
}
