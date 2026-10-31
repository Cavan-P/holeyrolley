import type { HatId } from '@holey/shared'

export const HAT_NAMES: Record<HatId, string> = {
    none: 'No hat',
    cap: 'Cap',
    beanie: 'Beanie',
    party: 'Party hat',
    topHat: 'Top hat',
    crown: 'Crown'
}

const OUTLINE = 'rgba(0, 0, 0, 0.25)'

export function drawHat(ctx: CanvasRenderingContext2D, hat: HatId, x: number, y: number, r: number): void {
    if(hat === 'none') return

    ctx.save()
    ctx.translate(x, y - r * 0.55)
    ctx.scale(r / 10, r / 10)
    ctx.lineWidth = 1
    ctx.lineJoin = 'round'
    ctx.strokeStyle = OUTLINE

    switch(hat){
        case 'cap':
            ctx.fillStyle = '#2f6fd6'
            ctx.beginPath()
            ctx.ellipse(7, -2, 8, 2.2, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = '#3a86ff'
            ctx.beginPath()
            ctx.arc(0, -2, 8, Math.PI, Math.PI * 2)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = '#2f6fd6'
            ctx.beginPath()
            ctx.arc(0, -10, 1.6, 0, Math.PI * 2)
            ctx.fill()
            break

        case 'beanie':
            ctx.fillStyle = '#e85d75'
            ctx.beginPath()
            ctx.arc(0, -1, 9, Math.PI, Math.PI * 2)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = '#c94860'
            ctx.beginPath()
            ctx.roundRect(-9.5, -3, 19, 4, 2)
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.arc(0, -11, 3, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
            break

        case 'party':
            ctx.fillStyle = '#ffd23f'
            ctx.beginPath()
            ctx.moveTo(-6, -1)
            ctx.lineTo(6, -1)
            ctx.lineTo(0, -17)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            ctx.save()
            ctx.clip()
            ctx.strokeStyle = '#2ec4b6'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(-7, -4)
            ctx.lineTo(3, -12)
            ctx.moveTo(-3, 0)
            ctx.lineTo(7, -8)
            ctx.stroke()
            ctx.restore()

            ctx.fillStyle = '#f15bb5'
            ctx.beginPath()
            ctx.arc(0, -17, 2.5, 0, Math.PI * 2)
            ctx.fill()
            break

        case 'topHat':
            ctx.fillStyle = '#26262e'
            ctx.beginPath()
            ctx.roundRect(-6.5, -16, 13, 15, 1.5)
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = '#c0392b'
            ctx.fillRect(-6.5, -5.5, 13, 3)

            ctx.fillStyle = '#26262e'
            ctx.beginPath()
            ctx.ellipse(0, -1, 11, 2.5, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
            break

        case 'crown':
            ctx.fillStyle = '#ffd23f'
            ctx.strokeStyle = '#c99700'
            ctx.beginPath()
            ctx.moveTo(-8, -1)
            ctx.lineTo(8, -1)
            ctx.lineTo(9, -12)
            ctx.lineTo(4.5, -6.5)
            ctx.lineTo(0, -14)
            ctx.lineTo(-4.5, -6.5)
            ctx.lineTo(-9, -12)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = '#e85d75'
            ctx.beginPath()
            ctx.arc(0, -4, 1.6, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#3a86ff'
            ctx.beginPath()
            ctx.arc(-5, -3.5, 1.2, 0, Math.PI * 2)
            ctx.arc(5, -3.5, 1.2, 0, Math.PI * 2)
            ctx.fill()
            break
    }

    ctx.restore()
}
