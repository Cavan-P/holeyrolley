import { type Ball, MIN_POWER } from '../classes/Ball'
import type { Aim } from '../input'
import { lerpColor } from '../utilities/lerpColor'

export function drawAim(ctx: CanvasRenderingContext2D, ball: Ball, aim: Aim): void {
    const { dx, dy, power } = aim
    if (power < MIN_POWER) return

    const MAX_LEN = 150
    const len = power * MAX_LEN

    ctx.save()
    ctx.strokeStyle = lerpColor('#FFFFFF', '#FF0000', power)
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.setLineDash([2, 8])

    ctx.beginPath()
    ctx.moveTo(ball.x, ball.y)
    ctx.lineTo(ball.x + dx * len, ball.y + dy * len)
    ctx.stroke()

    ctx.restore()
}
