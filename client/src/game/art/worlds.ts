import { type Faller, type Magnet, type Skin, type Surface, type Wall, Bumper, FALL_STAY, FALL_WARN } from '@holey/shared'
import { traceShape } from '../draw'

const now = () => performance.now() / 1000

function hash(a: number, b: number, salt: number): number {
    const n = Math.sin(a * 127.1 + b * 311.7 + salt * 74.7) * 43758.5453
    return n - Math.floor(n)
}

function lump(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, seed: number): void {
    ctx.beginPath()
    for(let i = 0; i < 9; i++){
        const a = i / 9 * Math.PI * 2 + seed
        const d = r * (0.84 + hash(x, y, i + seed) * 0.26)
        const px = x + Math.cos(a) * d
        const py = y + Math.sin(a) * d
        if(i) ctx.lineTo(px, py)
        else ctx.moveTo(px, py)
    }
    ctx.closePath()
}

export function drawLava(ctx: CanvasRenderingContext2D, s: Surface, color: string): void {
    const t = now()
    const b = s.shape.bounds()

    ctx.save()
    ctx.beginPath()
    traceShape(ctx, s.shape)
    ctx.fillStyle = color
    ctx.fill()
    ctx.clip()

    ctx.fillStyle = 'rgba(255, 220, 120, 0.25)'
    for(let x = b.x; x < b.x + b.w; x += 46){
        for(let y = b.y; y < b.y + b.h; y += 46){
            const wob = Math.sin(t * 0.8 + x * 0.03 + y * 0.02) * 6
            ctx.beginPath()
            ctx.ellipse(x + 20 + wob, y + 20, 16, 9, 0.4, 0, Math.PI * 2)
            ctx.fill()
        }
    }

    for(let x = b.x; x < b.x + b.w; x += 38){
        for(let y = b.y; y < b.y + b.h; y += 38){
            const h = hash(x, y, 3)
            if(h > 0.45) continue
            const px = x + hash(x, y, 4) * 38
            const py = y + hash(x, y, 5) * 38
            if(!s.shape.contains(px, py)) continue

            const p = (t * (0.5 + h) + h * 7) % 1
            ctx.strokeStyle = `rgba(255, 230, 140, ${0.9 * (1 - p)})`
            ctx.fillStyle = `rgba(255, 200, 90, ${0.6 * (1 - p)})`
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(px, py, 3 + p * 9, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
        }
    }

    ctx.strokeStyle = 'rgba(50, 18, 10, 0.55)'
    ctx.lineWidth = 16
    ctx.lineJoin = 'round'
    ctx.beginPath()
    traceShape(ctx, s.shape)
    ctx.stroke()

    ctx.restore()
}

export function drawZeroG(ctx: CanvasRenderingContext2D, s: Surface, color: string): void {
    const t = now()
    const b = s.shape.bounds()

    ctx.save()
    ctx.beginPath()
    traceShape(ctx, s.shape)
    ctx.globalAlpha = 0.35
    ctx.fillStyle = color
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.clip()

    ctx.strokeStyle = 'rgba(190, 240, 255, 0.35)'
    ctx.lineWidth = 2
    ctx.beginPath()
    const off = (t * 12) % 40
    for(let x = b.x - 40 + off; x < b.x + b.w + 40; x += 40){
        ctx.moveTo(x, b.y)
        ctx.lineTo(x, b.y + b.h)
    }
    for(let y = b.y - 40 + off; y < b.y + b.h + 40; y += 40){
        ctx.moveTo(b.x, y)
        ctx.lineTo(b.x + b.w, y)
    }
    ctx.stroke()

    ctx.strokeStyle = 'rgba(190, 240, 255, 0.8)'
    ctx.lineWidth = 3
    ctx.setLineDash([12, 10])
    ctx.lineDashOffset = -t * 20
    ctx.beginPath()
    traceShape(ctx, s.shape)
    ctx.stroke()

    ctx.restore()
}

export function drawMagnet(ctx: CanvasRenderingContext2D, m: Magnet, color: string, skin: Skin | undefined): void {
    const t = now()
    const [x, y] = m.center()
    const pull = m.strength >= 0

    ctx.save()

    for(let i = 0; i < 4; i++){
        const p = (t * 0.45 + i / 4) % 1
        const r = m.radius * (pull ? 1 - p : p)
        const a = Math.sin(p * Math.PI) * 0.35
        ctx.strokeStyle = pull ? `rgba(201, 75, 255, ${a})` : `rgba(124, 242, 255, ${a})`
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, Math.max(1, r), 0, Math.PI * 2)
        ctx.stroke()
    }

    ctx.setLineDash([6, 10])
    ctx.lineDashOffset = t * 10
    ctx.strokeStyle = pull ? 'rgba(201, 75, 255, 0.3)' : 'rgba(124, 242, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, m.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    if(skin === 'planet') drawPlanetBody(ctx, x, y, 26, color, t)
    else if(pull){
        const g = ctx.createRadialGradient(x, y, 2, x, y, 30)
        g.addColorStop(0, '#000000')
        g.addColorStop(0.45, '#05010a')
        g.addColorStop(0.6, color)
        g.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, 30, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = 'rgba(255, 200, 255, 0.6)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, 15, t * 2, t * 2 + Math.PI * 1.2)
        ctx.stroke()
    }
    else {
        const g = ctx.createRadialGradient(x, y, 2, x, y, 26)
        g.addColorStop(0, '#ffffff')
        g.addColorStop(0.4, '#7cf2ff')
        g.addColorStop(1, 'rgba(124, 242, 255, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, 26, 0, Math.PI * 2)
        ctx.fill()
    }

    ctx.restore()
}

function drawPlanetBody(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, t: number): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.arc(x + 4, y + 5, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.clip()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
    for(let i = -2; i <= 2; i++){
        ctx.fillRect(x - r, y + i * r * 0.36 + Math.sin(t + i) * 2, r * 2, r * 0.14)
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.beginPath()
    ctx.arc(x + r * 0.45, y + r * 0.35, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    ctx.strokeStyle = 'rgba(255, 236, 200, 0.75)'
    ctx.lineWidth = r * 0.16
    ctx.beginPath()
    ctx.ellipse(x, y, r * 1.6, r * 0.42, -0.35, Math.PI * 1.05, Math.PI * 1.95 + Math.PI)
    ctx.stroke()
}

export function drawFaller(ctx: CanvasRenderingContext2D, f: Faller, skin: Skin | undefined): void {
    const meteor = skin === 'meteor'
    const time = f.time

    ctx.save()

    for(const i of f.nearby()){
        if(time < i.t){
            const p = 1 - (i.t - time) / FALL_WARN

            ctx.fillStyle = `rgba(0, 0, 0, ${0.12 + p * 0.25})`
            ctx.beginPath()
            ctx.ellipse(i.x, i.y, f.size * (0.5 + p * 0.7), f.size * (0.35 + p * 0.5), 0, 0, Math.PI * 2)
            ctx.fill()

            ctx.strokeStyle = meteor ? `rgba(124, 242, 255, ${0.3 + p * 0.5})` : `rgba(255, 90, 40, ${0.3 + p * 0.5})`
            ctx.lineWidth = 3
            ctx.setLineDash([8, 7])
            ctx.beginPath()
            ctx.arc(i.x, i.y, f.size * 1.6, 0, Math.PI * 2)
            ctx.stroke()
            ctx.setLineDash([])

            const h = (1 - p) * 520
            const rx = i.x + h * 0.45
            const ry = i.y - h

            const trail = ctx.createLinearGradient(rx, ry, rx + 90, ry - 200)
            trail.addColorStop(0, meteor ? 'rgba(190, 240, 255, 0.85)' : 'rgba(255, 160, 60, 0.85)')
            trail.addColorStop(1, 'rgba(255, 255, 255, 0)')
            ctx.strokeStyle = trail
            ctx.lineWidth = f.size * 1.2
            ctx.lineCap = 'round'
            ctx.beginPath()
            ctx.moveTo(rx, ry)
            ctx.lineTo(rx + 90, ry - 200)
            ctx.stroke()

            drawFallenRock(ctx, rx, ry, f.size, meteor, 1, i.t)
        }
        else {
            const age = time - i.t
            const fade = Math.min(1, (FALL_STAY - age) / 0.6)

            if(age < 0.45){
                const p = age / 0.45
                ctx.strokeStyle = meteor ? `rgba(200, 245, 255, ${1 - p})` : `rgba(255, 170, 70, ${1 - p})`
                ctx.lineWidth = 5
                ctx.beginPath()
                ctx.arc(i.x, i.y, f.size * (1 + p * 2.5), 0, Math.PI * 2)
                ctx.stroke()
            }

            drawFallenRock(ctx, i.x, i.y, f.size, meteor, fade, i.t)
        }
    }

    ctx.restore()
}

function drawFallenRock(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, meteor: boolean, alpha: number, seed: number): void {
    ctx.save()
    ctx.globalAlpha *= Math.max(0, alpha)

    lump(ctx, x + 3, y + 4, r, seed)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.fill()

    lump(ctx, x, y, r, seed)
    ctx.fillStyle = meteor ? '#6d6a7c' : '#3a2e2b'
    ctx.fill()

    if(meteor){
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
        for(const [cx, cy, cr] of [[-0.3, -0.2, 0.25], [0.3, 0.25, 0.18]] as const){
            ctx.beginPath()
            ctx.arc(x + cx * r, y + cy * r, cr * r, 0, Math.PI * 2)
            ctx.fill()
        }
    }
    else {
        ctx.strokeStyle = '#ff7a2a'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x - r * 0.5, y - r * 0.1)
        ctx.lineTo(x - r * 0.05, y + r * 0.15)
        ctx.lineTo(x + r * 0.45, y - r * 0.2)
        ctx.moveTo(x - r * 0.05, y + r * 0.15)
        ctx.lineTo(x + r * 0.05, y + r * 0.55)
        ctx.stroke()
    }

    ctx.restore()
}

export function drawWorldCollider(ctx: CanvasRenderingContext2D, w: Wall, skin: Skin, color: string, flashColor: string): boolean {
    const t = now()
    const flash = w instanceof Bumper && w.flash > 0

    switch(skin){
        case 'asteroid':
        case 'basalt': {
            const r = w.r * 1.12
            const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1)
            const count = len ? Math.ceil(len / (w.r * 1.4)) : 0
            for(let k = 0; k <= count; k++){
                const p = count ? k / count : 0
                const x = w.x1 + (w.x2 - w.x1) * p
                const y = w.y1 + (w.y2 - w.y1) * p

                lump(ctx, x + 3, y + 4, r, x)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
                ctx.fill()
                lump(ctx, x, y, r, x)
                ctx.fillStyle = color
                ctx.fill()

                if(skin === 'asteroid'){
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
                    ctx.beginPath()
                    ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.25, 0, Math.PI * 2)
                    ctx.arc(x + r * 0.35, y + r * 0.3, r * 0.17, 0, Math.PI * 2)
                    ctx.fill()
                }
                else {
                    ctx.strokeStyle = `rgba(255, 110, 40, ${0.6 + Math.sin(t * 2 + x) * 0.25})`
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.moveTo(x - r * 0.5, y)
                    ctx.lineTo(x, y + r * 0.2)
                    ctx.lineTo(x + r * 0.4, y - r * 0.3)
                    ctx.stroke()
                }
            }
            return true
        }

        case 'pulsar': {
            const r = w.r * (flash ? 1.25 : 1)
            const g = ctx.createRadialGradient(w.x1, w.y1, 1, w.x1, w.y1, r * 2.2)
            g.addColorStop(0, '#ffffff')
            g.addColorStop(0.35, flash ? flashColor : color)
            g.addColorStop(1, 'rgba(124, 242, 255, 0)')
            ctx.fillStyle = g
            ctx.beginPath()
            ctx.arc(w.x1, w.y1, r * 2.2, 0, Math.PI * 2)
            ctx.fill()

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
            ctx.lineWidth = 2
            ctx.beginPath()
            for(let k = 0; k < 4; k++){
                const a = t * 1.5 + k * Math.PI / 2
                ctx.moveTo(w.x1 + Math.cos(a) * r * 1.1, w.y1 + Math.sin(a) * r * 1.1)
                ctx.lineTo(w.x1 + Math.cos(a) * r * 2, w.y1 + Math.sin(a) * r * 2)
            }
            ctx.stroke()
            return true
        }

        case 'geyser': {
            const r = w.r
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
            ctx.beginPath()
            ctx.arc(w.x1 + 3, w.y1 + 4, r * 1.25, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#4a3a36'
            ctx.beginPath()
            ctx.arc(w.x1, w.y1, r * 1.25, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = flash ? flashColor : color
            ctx.beginPath()
            ctx.arc(w.x1, w.y1, r * 0.7, 0, Math.PI * 2)
            ctx.fill()

            for(let k = 0; k < 3; k++){
                const p = (t * 0.7 + k / 3) % 1
                ctx.fillStyle = `rgba(230, 225, 220, ${0.35 * (1 - p)})`
                ctx.beginPath()
                ctx.arc(w.x1 + Math.sin(t + k) * 6, w.y1 - p * r * 3, r * (0.5 + p * 0.8), 0, Math.PI * 2)
                ctx.fill()
            }
            return true
        }

        case 'ufo': {
            const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1)
            const hl = len / 2 + w.r
            const d = w.r

            ctx.save()
            ctx.translate((w.x1 + w.x2) / 2, (w.y1 + w.y2) / 2)
            ctx.rotate(Math.atan2(w.y2 - w.y1, w.x2 - w.x1))

            ctx.fillStyle = 'rgba(124, 242, 255, 0.12)'
            ctx.beginPath()
            ctx.ellipse(0, 0, hl * 1.3, d * 2.2, 0, 0, Math.PI * 2)
            ctx.fill()

            ctx.fillStyle = '#9aa3c7'
            ctx.beginPath()
            ctx.ellipse(0, 0, hl, d, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
            ctx.beginPath()
            ctx.ellipse(0, -d * 0.3, hl * 0.8, d * 0.4, 0, 0, Math.PI * 2)
            ctx.fill()

            ctx.fillStyle = 'rgba(124, 242, 255, 0.85)'
            ctx.beginPath()
            ctx.ellipse(0, 0, hl * 0.32, d * 0.75, 0, 0, Math.PI * 2)
            ctx.fill()

            for(let k = 0; k < 6; k++){
                const on = Math.floor(t * 6 + k) % 3 === 0
                ctx.fillStyle = on ? '#ffe08a' : '#5a6188'
                ctx.beginPath()
                ctx.arc(-hl * 0.8 + k * hl * 0.32, d * 0.55, 2.5, 0, Math.PI * 2)
                ctx.fill()
            }

            ctx.restore()
            return true
        }
    }

    return false
}

export function drawWorldDecor(ctx: CanvasRenderingContext2D, skin: Skin, w: number, h: number, color: string): boolean {
    const t = now()
    const r = Math.min(w, h) / 2

    switch(skin){
        case 'planet':
            drawPlanetBody(ctx, 0, 0, r * 0.62, color, t * 0.2)
            return true

        case 'satellite': {
            ctx.rotate(t * 0.15)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
            ctx.fillRect(-r + 4, -r * 0.18 + 5, r * 2, r * 0.36)
            for(const side of [-1, 1]){
                ctx.fillStyle = '#2f5fbf'
                ctx.fillRect(side > 0 ? r * 0.3 : -r, -r * 0.2, r * 0.7, r * 0.4)
                ctx.strokeStyle = 'rgba(190, 220, 255, 0.6)'
                ctx.lineWidth = 1
                for(let k = 1; k < 4; k++){
                    const x = (side > 0 ? r * 0.3 : -r) + k * r * 0.7 / 4
                    ctx.beginPath()
                    ctx.moveTo(x, -r * 0.2)
                    ctx.lineTo(x, r * 0.2)
                    ctx.stroke()
                }
            }
            ctx.fillStyle = '#d8dcef'
            ctx.fillRect(-r * 0.28, -r * 0.28, r * 0.56, r * 0.56)
            ctx.strokeStyle = '#d8dcef'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(0, -r * 0.28)
            ctx.lineTo(0, -r * 0.6)
            ctx.stroke()
            ctx.fillStyle = Math.floor(t * 2) % 2 ? '#ff5d5d' : '#5a1e1e'
            ctx.beginPath()
            ctx.arc(0, -r * 0.62, 3, 0, Math.PI * 2)
            ctx.fill()
            return true
        }

        case 'rocket': {
            const flick = 0.8 + Math.sin(t * 30) * 0.2
            ctx.fillStyle = '#ffb347'
            ctx.beginPath()
            ctx.moveTo(-r * 0.18, r * 0.55)
            ctx.lineTo(0, r * (0.55 + 0.45 * flick))
            ctx.lineTo(r * 0.18, r * 0.55)
            ctx.fill()

            ctx.fillStyle = color
            for(const side of [-1, 1]){
                ctx.beginPath()
                ctx.moveTo(side * r * 0.22, r * 0.2)
                ctx.lineTo(side * r * 0.45, r * 0.6)
                ctx.lineTo(side * r * 0.22, r * 0.55)
                ctx.fill()
            }

            ctx.fillStyle = '#eef0fa'
            ctx.beginPath()
            ctx.moveTo(0, -r)
            ctx.quadraticCurveTo(r * 0.35, -r * 0.5, r * 0.25, r * 0.55)
            ctx.lineTo(-r * 0.25, r * 0.55)
            ctx.quadraticCurveTo(-r * 0.35, -r * 0.5, 0, -r)
            ctx.fill()

            ctx.fillStyle = color
            ctx.beginPath()
            ctx.moveTo(0, -r)
            ctx.quadraticCurveTo(r * 0.2, -r * 0.75, r * 0.3, -r * 0.5)
            ctx.lineTo(-r * 0.3, -r * 0.5)
            ctx.quadraticCurveTo(-r * 0.2, -r * 0.75, 0, -r)
            ctx.fill()

            ctx.fillStyle = '#7cf2ff'
            ctx.beginPath()
            ctx.arc(0, -r * 0.15, r * 0.12, 0, Math.PI * 2)
            ctx.fill()
            return true
        }

        case 'volcano': {
            const rings = ['#3f2d29', '#4d3832', '#5a433b']
            rings.forEach((c, k) => {
                ctx.fillStyle = c
                ctx.beginPath()
                ctx.ellipse(0, 0, r * (1 - k * 0.22), r * (0.9 - k * 0.2), 0, 0, Math.PI * 2)
                ctx.fill()
            })

            const g = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 0.35)
            g.addColorStop(0, '#ffe08a')
            g.addColorStop(0.5, '#ff6a1f')
            g.addColorStop(1, '#5a1e10')
            ctx.fillStyle = g
            ctx.beginPath()
            ctx.ellipse(0, 0, r * 0.3, r * 0.25, 0, 0, Math.PI * 2)
            ctx.fill()

            ctx.strokeStyle = 'rgba(255, 106, 31, 0.6)'
            ctx.lineWidth = 3
            ctx.beginPath()
            for(let k = 0; k < 3; k++){
                const a = 1.2 + k * 0.9
                ctx.moveTo(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.25)
                ctx.quadraticCurveTo(Math.cos(a + 0.2) * r * 0.6, Math.sin(a + 0.2) * r * 0.55, Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.75)
            }
            ctx.stroke()

            drawSmoke(ctx, 0, 0, r * 0.35, t)
            return true
        }

        case 'vent': {
            ctx.strokeStyle = '#ff6a1f'
            ctx.lineWidth = 3
            ctx.lineCap = 'round'
            ctx.beginPath()
            ctx.moveTo(-r * 0.6, r * 0.1)
            ctx.lineTo(-r * 0.1, -r * 0.1)
            ctx.lineTo(r * 0.2, r * 0.15)
            ctx.lineTo(r * 0.6, -r * 0.05)
            ctx.stroke()
            drawSmoke(ctx, 0, 0, r * 0.3, t)
            return true
        }
    }

    return false
}

function drawSmoke(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number): void {
    for(let k = 0; k < 4; k++){
        const p = (t * 0.25 + k / 4) % 1
        ctx.fillStyle = `rgba(120, 110, 105, ${0.35 * (1 - p)})`
        ctx.beginPath()
        ctx.arc(x + Math.sin(t * 0.7 + k) * size * 0.6 + p * size * 1.5, y - p * size * 5, size * (0.6 + p * 1.4), 0, Math.PI * 2)
        ctx.fill()
    }
}
