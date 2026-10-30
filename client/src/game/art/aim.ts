import type { Ball } from '../classes/Ball'

export function drawAim(ctx: CanvasRenderingContext2D, ball: Ball, mouse: { x: number, y: number }): void {
    const { dx, dy, power } = ball.pull(mouse)
    if (power < 0.05) return

    const MAX_LEN = 120
    const len = power * MAX_LEN

    ctx.save()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.setLineDash([2, 8])

    ctx.beginPath()
    ctx.moveTo(ball.x, ball.y)
    ctx.lineTo(ball.x + dx * len, ball.y + dy * len)
    ctx.stroke()

    ctx.restore()
}