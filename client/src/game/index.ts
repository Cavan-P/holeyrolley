import type { CourseData } from '@holey/shared'
import { Camera } from './classes/Camera'
import { type Hole } from './classes/Hole'
import { type Ball } from './classes/Ball'

import { createGrassPattern } from './art/grass'
import { drawAim } from './art/aim'
import { getTheme } from './art/themes'

import { setupInput } from './input'
import { buildHole } from './build'

type GameEvents = {
    onStroke: (strokes: number) => void
    onHoleComplete: (result: HoleResult) => void
}

export type HoleResult = {
    hole: number,
    strokes: number,
    par: number,
    isLast: boolean
}

export function startGame(canvas: HTMLCanvasElement, course: CourseData, events: GameEvents, startHole: number = 0): {nextHole: () => void, dispose: () => void} {
    const ctx = canvas.getContext('2d')

    if(!ctx) throw new Error('2D canvas not supported')

    let frameId = 0
    const STEP = 1 /120
    let last = performance.now()
    let acc = 0

    let holeIndex = 0
    let hole: Hole
    let ball: Ball

    let lastStrokes = 0
    let reportedComplete = false
    const camera = new Camera(0, 0, window.innerWidth, window.innerHeight)

    const theme = getTheme(course.theme)

    const loadHole = (index: number) => {
        const data = course.holes[index]
        if(!data) return

        holeIndex = index

        hole = buildHole(data, course)

        const first = hole.balls[0]
        if(!first) throw new Error('Hole has no balls')

        ball = first
    
        
        camera.snapTo(ball.x, ball.y)
    
        lastStrokes = -1
        reportedComplete = false

    }

    loadHole(startHole)

    const grass = createGrassPattern(ctx, theme.turf, theme.turfStripe)

    const input = setupInput({
        canvas,
        camera,
        origin: () => ball,
        canAim: () => !ball.isMoving() && !ball.holed() && !ball.sinking(),
        onShoot: ({ dx, dy, power }) => ball.shoot(dx, dy, power)
    })

    const frame = (now: number) => {
        acc += Math.min((now - last) / 1000, 0.25)
        last = now

        while(acc >= STEP){
            hole.update(STEP)
            camera.follow(ball, STEP)
            acc -= STEP
        }

        if(ball.strokes !== lastStrokes){
            lastStrokes = ball.strokes
            events.onStroke(ball.strokes)
        }

        if(ball.finished() && !reportedComplete){
            reportedComplete = true
            events.onHoleComplete({
                hole: holeIndex + 1,
                strokes: ball.strokes,
                par: hole.par,
                isLast: holeIndex === course.holes.length - 1
            })
        }

        camera.begin(ctx)
        const visArea = camera.visibleRect()

        ctx.fillStyle = theme.scenery
        ctx.fillRect(visArea.x, visArea.y, visArea.w, visArea.h)

        hole.drawGround(ctx, grass)
        hole.draw(ctx, ball)

        const aim = input.aim()
        if(aim) drawAim(ctx, ball, aim)

        camera.end(ctx)

        frameId = requestAnimationFrame(frame)
    }
    frameId = requestAnimationFrame(frame)

    const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        camera.viewW = window.innerWidth
        camera.viewH = window.innerHeight
    }
    resize()

    window.addEventListener('resize', resize)

    return {
        nextHole: () => loadHole(holeIndex + 1),
        dispose: () => {
            cancelAnimationFrame(frameId)

            window.removeEventListener('resize', resize)

            input.dispose()
        }
    }
}
