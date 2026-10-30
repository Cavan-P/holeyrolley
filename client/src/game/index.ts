import { Ball } from './classes/Ball'
import { Wall } from './classes/Wall'
import { Camera } from './classes/Camera'

import { createGrassPattern }from './art/grass'
import { drawAim } from './art/aim'
import { Cup } from './classes/Cup'

export function startGame(canvas: HTMLCanvasElement): () => void {
    const ctx = canvas.getContext('2d')

    if(!ctx) throw new Error('2D canvas not supported')

    let frameId = 0
    const STEP = 1 /120
    let last = performance.now()
    let acc = 0

    const ball = new Ball(150, 100, '#FF0000')
    const wall = new Wall(300, 300, 1000, 500, 3, 0.6)
    const camera = new Camera(0, 0, window.innerWidth, window.innerHeight)
    const grass = createGrassPattern(ctx)
    const cup = new Cup(1200, 1200)

    const mouse = {x: 0, y: 0}
    let aiming = false

    const frame = (now: number) => {
        acc += Math.min((now - last) / 1000, 0.25)
        last = now

        while(acc >= STEP){
            ball.update(STEP, [wall])
            cup.update(STEP, ball)
            camera.follow(ball, STEP)
            acc -= STEP
        }

        camera.begin(ctx)
        const worldMouse = camera.mouse(mouse)
        const visArea = camera.visibleRect()

        ctx.fillStyle = grass
        ctx.fillRect(visArea.x, visArea.y, visArea.w, visArea.h)

        wall.display(ctx)

        cup.display(ctx)

        ball.display(ctx)
        if(aiming) drawAim(ctx, ball, worldMouse)

        cup.drawFlag(ctx, ball)

        camera.end(ctx)

        frameId = requestAnimationFrame(frame)
    }
    frameId = requestAnimationFrame(frame)

    const toCanvas = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect()
        mouse.x = e.clientX - rect.left
        mouse.y = e.clientY - rect.top
    }

    const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        camera.viewW = window.innerWidth
        camera.viewH = window.innerHeight
    }
    resize()

    const onDown = (e: PointerEvent) => {
        toCanvas(e)
        if(!ball.isMoving()) aiming = true
        canvas.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
        toCanvas(e)
    }
    const onUp = (e: PointerEvent) => {
        toCanvas(e)
        if(aiming) ball.release(camera.mouse(mouse))
        aiming = false
    }
    const onCancel = () => {
        aiming = false
    }

    
    window.addEventListener('resize', resize)

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onCancel)
    
    return () => {
        cancelAnimationFrame(frameId)

        window.removeEventListener('resize', resize)

        canvas.removeEventListener('pointerdown', onDown)
        canvas.removeEventListener('pointermove', onMove)
        canvas.removeEventListener('pointerup', onUp)
        canvas.removeEventListener('pointercancel', onCancel)
    }
}