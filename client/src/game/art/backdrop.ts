import type { Theme } from './themes'

type Area = { x: number, y: number, w: number, h: number }

const CELL = 160

function hash(a: number, b: number, salt: number): number {
    const n = Math.sin(a * 127.1 + b * 311.7 + salt * 74.7) * 43758.5453
    return n - Math.floor(n)
}

export function drawBackdrop(ctx: CanvasRenderingContext2D, theme: Theme, area: Area, time: number): void {
    if(!theme.backdrop) return

    const x0 = Math.floor(area.x / CELL) - 1
    const y0 = Math.floor(area.y / CELL) - 1
    const x1 = Math.ceil((area.x + area.w) / CELL) + 1
    const y1 = Math.ceil((area.y + area.h) / CELL) + 1

    ctx.save()

    for(let cx = x0; cx <= x1; cx++){
        for(let cy = y0; cy <= y1; cy++){
            switch(theme.backdrop){
                case 'stars': drawStars(ctx, cx, cy, time); break
                case 'embers': drawEmbers(ctx, cx, cy, time); break
                case 'snow': drawSnow(ctx, cx, cy, time); break
                case 'grid': drawGrid(ctx, cx, cy, time); break
                case 'fog': drawFog(ctx, cx, cy, time); break
                case 'sprinkles': drawSprinkles(ctx, cx, cy); break
                case 'plates': drawPlates(ctx, cx, cy); break
            }
        }
    }

    ctx.restore()
}

function drawStars(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number): void {
    for(let i = 0; i < 3; i++){
        const x = (cx + hash(cx, cy, i)) * CELL
        const y = (cy + hash(cy, cx, i + 9)) * CELL
        const size = 0.8 + hash(cx, cy, i + 20) * 2
        const twinkle = 0.55 + 0.45 * Math.sin(time * (1 + hash(cx, cy, i + 30) * 2) + i * 2.1 + cx)

        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * (0.4 + hash(cx, cy, i + 40) * 0.6)})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
    }

    if(hash(cx, cy, 99) > 0.93){
        const x = (cx + 0.5) * CELL
        const y = (cy + 0.5) * CELL
        const g = ctx.createRadialGradient(x, y, 0, x, y, CELL)
        g.addColorStop(0, hash(cx, cy, 98) > 0.5 ? 'rgba(160, 110, 255, 0.18)' : 'rgba(90, 180, 255, 0.16)')
        g.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = g
        ctx.fillRect(x - CELL, y - CELL, CELL * 2, CELL * 2)
    }
}

function drawEmbers(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number): void {
    if(hash(cx, cy, 5) > 0.6){
        ctx.strokeStyle = 'rgba(255, 110, 40, 0.28)'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.beginPath()
        let x = (cx + hash(cx, cy, 6)) * CELL
        let y = (cy + hash(cx, cy, 7)) * CELL
        ctx.moveTo(x, y)
        for(let i = 0; i < 4; i++){
            x += (hash(cx, cy, 10 + i) - 0.5) * 70
            y += (hash(cx, cy, 20 + i) - 0.3) * 50
            ctx.lineTo(x, y)
        }
        ctx.stroke()
    }

    for(let i = 0; i < 2; i++){
        const speed = 18 + hash(cx, cy, i + 50) * 30
        const x = (cx + hash(cx, cy, i + 60)) * CELL + Math.sin(time * 1.3 + i + cy) * 8
        const rise = (time * speed + hash(cx, cy, i + 70) * CELL) % CELL
        const y = (cy + 1) * CELL - rise
        const life = rise / CELL

        ctx.fillStyle = `rgba(255, ${140 + Math.round(life * 80)}, 60, ${0.75 * (1 - life)})`
        ctx.beginPath()
        ctx.arc(x, y, 1.5 + hash(cx, cy, i + 80) * 2, 0, Math.PI * 2)
        ctx.fill()
    }
}

function drawSnow(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number): void {
    if(hash(cx, cy, 3) > 0.7){
        ctx.fillStyle = 'rgba(190, 215, 235, 0.35)'
        ctx.beginPath()
        ctx.ellipse((cx + 0.5) * CELL, (cy + 0.6) * CELL, CELL * 0.45, CELL * 0.18, 0, 0, Math.PI * 2)
        ctx.fill()
    }

    for(let i = 0; i < 3; i++){
        const speed = 25 + hash(cx, cy, i + 50) * 30
        const fall = (time * speed + hash(cx, cy, i + 70) * CELL) % CELL
        const x = (cx + hash(cx, cy, i + 60)) * CELL + Math.sin(time * 0.9 + i * 2 + cy) * 10
        const y = cy * CELL + fall

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.beginPath()
        ctx.arc(x, y, 1.5 + hash(cx, cy, i + 80) * 2.2, 0, Math.PI * 2)
        ctx.fill()
    }
}

function drawGrid(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number): void {
    const pulse = 0.25 + 0.12 * Math.sin(time * 1.5 + (cx + cy) * 0.4)

    ctx.strokeStyle = (cx + cy) % 2 ? `rgba(255, 79, 216, ${pulse})` : `rgba(79, 209, 255, ${pulse})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx * CELL, cy * CELL)
    ctx.lineTo((cx + 1) * CELL, cy * CELL)
    ctx.moveTo(cx * CELL, cy * CELL)
    ctx.lineTo(cx * CELL, (cy + 1) * CELL)
    ctx.stroke()

    if(hash(cx, cy, 9) > 0.85){
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.fillRect((cx + hash(cx, cy, 10)) * CELL, (cy + hash(cx, cy, 11)) * CELL, 3, 3)
    }
}

function drawFog(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number): void {
    if(hash(cx, cy, 2) > 0.55){
        const x = (cx + 0.5) * CELL + Math.sin(time * 0.15 + cy) * 60
        const y = (cy + 0.5) * CELL
        const g = ctx.createRadialGradient(x, y, 0, x, y, CELL * 1.1)
        g.addColorStop(0, 'rgba(180, 170, 200, 0.12)')
        g.addColorStop(1, 'rgba(180, 170, 200, 0)')
        ctx.fillStyle = g
        ctx.fillRect(x - CELL * 1.1, y - CELL * 1.1, CELL * 2.2, CELL * 2.2)
    }

    if(hash(cx, cy, 4) > 0.75){
        const glow = 0.4 + 0.6 * Math.max(0, Math.sin(time * 2 + hash(cx, cy, 5) * 10))
        ctx.fillStyle = `rgba(200, 255, 140, ${glow * 0.8})`
        ctx.beginPath()
        ctx.arc((cx + hash(cx, cy, 6)) * CELL + Math.sin(time + cx) * 12, (cy + hash(cx, cy, 7)) * CELL + Math.cos(time * 0.8 + cy) * 10, 2.2, 0, Math.PI * 2)
        ctx.fill()
    }
}

const SPRINKLES = ['#ff5d8f', '#ffd23f', '#4fd1ff', '#8fe3c0', '#9b5de5', '#ffffff']

function drawSprinkles(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.lineCap = 'round'
    ctx.lineWidth = 5
    for(let i = 0; i < 6; i++){
        const x = (cx + hash(cx, cy, i)) * CELL
        const y = (cy + hash(cy, cx, i + 9)) * CELL
        const a = hash(cx, cy, i + 20) * Math.PI
        ctx.strokeStyle = SPRINKLES[Math.floor(hash(cx, cy, i + 30) * SPRINKLES.length)]!
        ctx.beginPath()
        ctx.moveTo(x - Math.cos(a) * 6, y - Math.sin(a) * 6)
        ctx.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6)
        ctx.stroke()
    }
}

function drawPlates(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const x = cx * CELL
    const y = cy * CELL

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)'
    ctx.lineWidth = 3
    ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
    for(const [px, py] of [[10, 10], [CELL - 10, 10], [10, CELL - 10], [CELL - 10, CELL - 10]]){
        ctx.beginPath()
        ctx.arc(x + px!, y + py!, 3, 0, Math.PI * 2)
        ctx.fill()
    }

    if(hash(cx, cy, 8) > 0.85){
        ctx.save()
        ctx.beginPath()
        ctx.rect(x + 20, y + CELL / 2 - 10, CELL - 40, 20)
        ctx.clip()
        for(let k = -2; k < 10; k++){
            ctx.fillStyle = k % 2 ? '#e8b23a' : '#1f2226'
            ctx.beginPath()
            ctx.moveTo(x + 20 + k * 16, y + CELL / 2 + 10)
            ctx.lineTo(x + 36 + k * 16, y + CELL / 2 - 10)
            ctx.lineTo(x + 52 + k * 16, y + CELL / 2 - 10)
            ctx.lineTo(x + 36 + k * 16, y + CELL / 2 + 10)
            ctx.fill()
        }
        ctx.restore()
    }
}
