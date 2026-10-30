import { Ball } from './classes/Ball'

export function startGame(canvas: HTMLCanvasElement): () => void {
    const ctx = canvas.getContext('2d')

    if(!ctx) throw new Error('2D canvas not supported')

    let frameId = 0
    const STEP = 1 /120
    let last = performance.now()
    let acc = 0

    const ball = new Ball(150, 100, '#FF0000')

    const mouse = {x: 0, y: 0}
    let aiming = false

    const toCanvas = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect()
        mouse.x = e.clientX - rect.left
        mouse.y = e.clientY - rect.top
    }

    const frame = (now: number) => {
        acc += Math.min((now - last) / 1000, 0.25)
        last = now

        while(acc >= STEP){
            ball.update(STEP)
            acc -= STEP
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ball.display(ctx)

        frameId = requestAnimationFrame(frame)
    }
    frameId = requestAnimationFrame(frame)

    const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize()

    const onDown = (e: PointerEvent) => {
        toCanvas(e)
        aiming = true
        canvas.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
        toCanvas(e)
    }
    const onUp = (e: PointerEvent) => {
        toCanvas(e)
        if(aiming) ball.release(mouse)
        aiming = false
    }

    
    window.addEventListener('resize', resize)

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    
    return () => {
        cancelAnimationFrame(frameId)

        window.removeEventListener('resize', resize)

        canvas.removeEventListener('pointerdown', onDown)
        canvas.removeEventListener('pointermove', onMove)
        canvas.removeEventListener('pointerup', onUp)
    }
}