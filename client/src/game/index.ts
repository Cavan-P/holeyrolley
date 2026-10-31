import { Camera } from './classes/Camera'

import { createGrassPattern } from './art/grass'
import { drawAim } from './art/aim'

import { setupInput } from './input'
import { createTestHole } from './holes/testHole'

const SCENERY = '#4e8f3c'

export function startGame(canvas: HTMLCanvasElement): () => void {
    const ctx = canvas.getContext('2d')

    if(!ctx) throw new Error('2D canvas not supported')

    let frameId = 0
    const STEP = 1 /120
    let last = performance.now()
    let acc = 0

    const hole = createTestHole()

    const ball = hole.balls[0]
    if(!ball) throw new Error('Hole has no balls')

    const camera = new Camera(0, 0, window.innerWidth, window.innerHeight)
    camera.snapTo(ball.x, ball.y)

    const grass = createGrassPattern(ctx)

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

        camera.begin(ctx)
        const visArea = camera.visibleRect()

        // Scenery outside the course, then the course's grass on top
        ctx.fillStyle = SCENERY
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

    return () => {
        cancelAnimationFrame(frameId)

        window.removeEventListener('resize', resize)

        input.dispose()
    }
}
