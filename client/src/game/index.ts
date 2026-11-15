import { drawBackdrop } from './art/backdrop'
import { type Cosmetics, type CourseData, type Ball, clamp, lerp } from '@holey/shared'
import { Camera } from './classes/Camera'
import { type HoleView } from './classes/HoleView'

import { createGrassPattern } from './art/grass'
import { drawAim } from './art/aim'
import { drawMinimap } from './art/minimap'
import { getTheme } from './art/themes'

import { setupInput } from './input'
import { buildHole } from './build'
import { getPrefs } from '../settings/store'

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

export function startGame(canvas: HTMLCanvasElement, course: CourseData, events: GameEvents, cosmetics: Cosmetics, startHole: number = 0): {nextHole: () => void, replay: () => void, setOverview: (on: boolean) => void, dispose: () => void} {
    const ctx = canvas.getContext('2d')

    if(!ctx) throw new Error('2D canvas not supported')

    let frameId = 0
    const STEP = 1 /120
    let last = performance.now()
    let acc = 0

    let holeIndex = 0
    let view: HoleView
    let ball: Ball

    let overview = false

    let lastStrokes = 0
    let reportedComplete = false
    const camera = new Camera(0, 0, window.innerWidth, window.innerHeight)

    const theme = getTheme(course.theme)

    const loadHole = (index: number) => {
        const data = course.holes[index]
        if(!data) return

        holeIndex = index

        view = buildHole(data, course, cosmetics)

        const first = view.hole.balls[0]
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
        canAim: () => !ball.isMoving() && !ball.holed() && !ball.sinking() && !overview,
        onShoot: ({ dx, dy, power }) => ball.shoot(dx, dy, power)
    })

    const frame = (now: number) => {
        acc += Math.min((now - last) / 1000, 0.25)
        last = now

        while(acc >= STEP){
            view.update(STEP)

            if(overview){
                camera.targetX = view.hole.bounds.x + view.hole.bounds.w / 2
                camera.targetY = view.hole.bounds.y + view.hole.bounds.h / 2

                camera.targetZoom = camera.fitZoom(view.hole.bounds)
            }
            else {

                if(getPrefs().cameraFollow || !ball.isMoving()) camera.follow(ball, STEP)

                let t = clamp(ball.speed() / ball.maxSpeed, 0, 1)

                t *= t
                camera.targetZoom = getPrefs().reduceMotion ? 1 : lerp(1, 0.75, t)
            }
            
            camera.update(STEP)

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
                par: view.hole.par,
                isLast: holeIndex === course.holes.length - 1
            })
        }

        camera.begin(ctx)
        const visArea = camera.visibleRect()

        ctx.fillStyle = theme.scenery
        ctx.fillRect(visArea.x, visArea.y, visArea.w, visArea.h)
        drawBackdrop(ctx, theme, visArea, view.hole.time)

        view.drawGround(ctx, grass)
        view.draw(ctx, ball)

        const aim = input.aim()
        if(aim && getPrefs().aimGuide) drawAim(ctx, ball, aim)

        camera.end(ctx)

        if(getPrefs().minimap) drawMinimap(ctx, view, camera, theme)

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

    const onKeyDown = (e: KeyboardEvent) => {
        if(e.key === 'Tab'){
            e.preventDefault()
            overview = true
        }
    }
    const onKeyUp = (e: KeyboardEvent) => {
        if(e.key === 'Tab'){
            e.preventDefault()
            overview = false
        }
    }
    const onBlur = () => {
        overview = false
    }

    window.addEventListener('resize', resize)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return {
        nextHole: () => loadHole(holeIndex + 1),
        replay: () => loadHole(holeIndex),
        setOverview: (on: boolean) => { overview = on },
        dispose: () => {
            cancelAnimationFrame(frameId)

            window.removeEventListener('resize', resize)
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
            window.removeEventListener('blur', onBlur)

            input.dispose()
        }
    }
}
