import type { Camera } from './classes/Camera'

type Point = { x: number, y: number }

export type Aim = { dx: number, dy: number, power: number }

const MAX_PULL = 140

export function aimFromMouse(ball: Point, mouse: Point): Aim {
    const px = ball.x - mouse.x
    const py = ball.y - mouse.y
    const len = Math.sqrt(px * px + py * py)
    if(!len) return { dx: 0, dy: 0, power: 0 }

    return { dx: px / len, dy: py / len, power: Math.min(len, MAX_PULL) / MAX_PULL }
}

type InputOptions = {
    canvas: HTMLCanvasElement
    camera: Camera

    origin: () => Point
    canAim: () => boolean
    onShoot: (aim: Aim) => void
}

export function setupInput({ canvas, camera, origin, canAim, onShoot }: InputOptions){
    const mouse = { x: 0, y: 0 }
    let aiming = false

    const toCanvas = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect()
        mouse.x = e.clientX - rect.left
        mouse.y = e.clientY - rect.top
    }

    const currentAim = (): Aim => aimFromMouse(origin(), camera.mouse(mouse))

    const onDown = (e: PointerEvent) => {
        toCanvas(e)
        if(canAim()) aiming = true
        canvas.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
        toCanvas(e)
    }
    const onUp = (e: PointerEvent) => {
        toCanvas(e)
        if(aiming) onShoot(currentAim())
        aiming = false
    }
    const onCancel = () => {
        aiming = false
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onCancel)

    return {
        aim: (): Aim | null => aiming ? currentAim() : null,

        dispose: () => {
            canvas.removeEventListener('pointerdown', onDown)
            canvas.removeEventListener('pointermove', onMove)
            canvas.removeEventListener('pointerup', onUp)
            canvas.removeEventListener('pointercancel', onCancel)
        }
    }
}
