import { type Skin, type Wall, Bumper } from '@holey/shared'

const now = () => performance.now() / 1000

function shadowed(ctx: CanvasRenderingContext2D, path: () => void, fill: string, dx = 3, dy = 4): void {
    ctx.save()
    ctx.translate(dx, dy)
    path()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
    ctx.fill()
    ctx.restore()
    path()
    ctx.fillStyle = fill
    ctx.fill()
}

function capsule(ctx: CanvasRenderingContext2D, w: Wall, grow = 0): void {
    const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1)
    const a = Math.atan2(w.y2 - w.y1, w.x2 - w.x1)
    const r = w.r + grow
    ctx.beginPath()
    if(!len){
        ctx.arc(w.x1, w.y1, r, 0, Math.PI * 2)
        return
    }
    ctx.arc(w.x1, w.y1, r, a + Math.PI / 2, a - Math.PI / 2)
    ctx.arc(w.x2, w.y2, r, a - Math.PI / 2, a + Math.PI / 2)
    ctx.closePath()
}

function along(w: Wall, step: number, fn: (x: number, y: number, i: number) => void): void {
    const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1)
    const n = Math.max(1, Math.round(len / step))
    for(let i = 0; i <= n; i++){
        const t = len ? i / n : 0
        fn(w.x1 + (w.x2 - w.x1) * t, w.y1 + (w.y2 - w.y1) * t, i)
    }
}

export function drawPropCollider(ctx: CanvasRenderingContext2D, w: Wall, skin: Skin, color: string, flashColor: string): boolean {
    const t = now()
    const flash = w instanceof Bumper && w.flash > 0

    switch(skin){
        case 'iceblock': {
            shadowed(ctx, () => capsule(ctx, w, 2), 'rgba(190, 235, 255, 0.85)')
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
            ctx.lineWidth = 2
            capsule(ctx, w, 2)
            ctx.stroke()
            ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
            ctx.beginPath()
            ctx.arc(w.x1 - w.r * 0.35, w.y1 - w.r * 0.35, w.r * 0.25, 0, Math.PI * 2)
            ctx.fill()
            return true
        }

        case 'neon': {
            ctx.save()
            ctx.shadowColor = color
            ctx.shadowBlur = 16
            ctx.strokeStyle = color
            ctx.lineWidth = 3
            capsule(ctx, w)
            ctx.stroke()
            ctx.restore()
            capsule(ctx, w, -3)
            ctx.fillStyle = 'rgba(20, 16, 43, 0.85)'
            ctx.fill()
            return true
        }

        case 'ghost': {
            const bob = Math.sin(t * 2 + w.x1 * 0.01) * 2
            ctx.save()
            ctx.translate(0, bob)
            capsule(ctx, w, 2)
            ctx.fillStyle = 'rgba(235, 230, 255, 0.85)'
            ctx.shadowColor = 'rgba(200, 190, 255, 0.9)'
            ctx.shadowBlur = 14
            ctx.fill()
            ctx.restore()
            const mx = (w.x1 + w.x2) / 2
            const my = (w.y1 + w.y2) / 2 + bob
            ctx.fillStyle = '#2a2433'
            for(const s of [-1, 1]){
                ctx.beginPath()
                ctx.ellipse(mx + s * w.r * 0.4, my - w.r * 0.1, w.r * 0.16, w.r * 0.24, 0, 0, Math.PI * 2)
                ctx.fill()
            }
            return true
        }

        case 'fence': {
            ctx.strokeStyle = '#1a1520'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(w.x1, w.y1)
            ctx.lineTo(w.x2, w.y2)
            ctx.stroke()
            along(w, 14, (x, y) => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
                ctx.beginPath()
                ctx.arc(x + 2, y + 3, w.r * 0.7, 0, Math.PI * 2)
                ctx.fill()
                ctx.fillStyle = color
                ctx.beginPath()
                ctx.arc(x, y, w.r * 0.7, 0, Math.PI * 2)
                ctx.fill()
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
                ctx.beginPath()
                ctx.arc(x - 1, y - 1, w.r * 0.3, 0, Math.PI * 2)
                ctx.fill()
            })
            return true
        }

        case 'candycane': {
            shadowed(ctx, () => capsule(ctx, w), '#ffffff')
            ctx.save()
            capsule(ctx, w)
            ctx.clip()
            ctx.strokeStyle = color
            ctx.lineWidth = w.r * 0.9
            const minX = Math.min(w.x1, w.x2) - w.r * 2
            const maxX = Math.max(w.x1, w.x2) + w.r * 2
            const minY = Math.min(w.y1, w.y2) - w.r * 2
            const maxY = Math.max(w.y1, w.y2) + w.r * 2
            ctx.beginPath()
            for(let x = minX - (maxY - minY); x < maxX; x += w.r * 2){
                ctx.moveTo(x, maxY)
                ctx.lineTo(x + (maxY - minY), minY)
            }
            ctx.stroke()
            ctx.restore()
            return true
        }

        case 'gumball': {
            const r = w.r * (flash ? 1.15 : 1)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
            ctx.beginPath()
            ctx.arc(w.x1 + 3, w.y1 + 4, r, 0, Math.PI * 2)
            ctx.fill()
            const g = ctx.createRadialGradient(w.x1 - r * 0.35, w.y1 - r * 0.35, 1, w.x1, w.y1, r)
            g.addColorStop(0, '#ffffff')
            g.addColorStop(0.3, flash ? flashColor : color)
            g.addColorStop(1, flash ? flashColor : color)
            ctx.fillStyle = g
            ctx.beginPath()
            ctx.arc(w.x1, w.y1, r, 0, Math.PI * 2)
            ctx.fill()
            return true
        }

        case 'gear': {
            const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1)
            if(len){
                shadowed(ctx, () => capsule(ctx, w), '#7d838a')
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
                along(w, 20, (x, y) => {
                    ctx.beginPath()
                    ctx.arc(x, y, 2.5, 0, Math.PI * 2)
                    ctx.fill()
                })
                return true
            }
            const r = w.r
            const spin = t * 1.2
            ctx.save()
            ctx.translate(w.x1, w.y1)
            ctx.rotate(spin)
            const teeth = 10
            const path = () => {
                ctx.beginPath()
                for(let i = 0; i < teeth * 2; i++){
                    const a = i / (teeth * 2) * Math.PI * 2
                    const d = i % 2 ? r * 0.82 : r * 1.12
                    ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d)
                }
                ctx.closePath()
            }
            shadowed(ctx, path, color, 2, 3)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
            ctx.beginPath()
            ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
            return true
        }

        case 'girder': {
            shadowed(ctx, () => capsule(ctx, w), color)
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
            ctx.lineWidth = 2
            capsule(ctx, w, -w.r * 0.45)
            ctx.stroke()
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
            along(w, 18, (x, y) => {
                ctx.beginPath()
                ctx.arc(x, y, 1.8, 0, Math.PI * 2)
                ctx.fill()
            })
            return true
        }
    }

    return false
}

export function drawPropDecor(ctx: CanvasRenderingContext2D, skin: Skin, w: number, h: number, color: string): boolean {
    const t = now()
    const r = Math.min(w, h) / 2

    const blob = (x: number, y: number, rad: number, fill: string) => {
        ctx.fillStyle = fill
        ctx.beginPath()
        ctx.arc(x, y, rad, 0, Math.PI * 2)
        ctx.fill()
    }

    switch(skin){
        case 'tree':
        case 'bush': {
            const big = skin === 'tree'
            blob(r * 0.25, r * 0.3, r * 0.9, 'rgba(0, 0, 0, 0.22)')
            const greens = big ? ['#1f3a1c', '#2f5a2a', '#3d6f35'] : ['#2f5a2a', '#46803c', '#5a9a4a']
            greens.forEach((c, i) => {
                const rr = r * (0.9 - i * 0.22)
                for(let k = 0; k < 6; k++){
                    const a = k / 6 * Math.PI * 2 + i * 0.7
                    blob(Math.cos(a) * rr * 0.4 - i * 3, Math.sin(a) * rr * 0.4 - i * 3, rr * 0.55, c)
                }
            })
            return true
        }

        case 'pine': {
            blob(r * 0.2, r * 0.25, r * 0.9, 'rgba(0, 0, 0, 0.15)')
            const layers = ['#2f5d50', '#3a6f5f', '#4a836f']
            layers.forEach((c, i) => {
                const rr = r * (0.95 - i * 0.28)
                ctx.fillStyle = c
                ctx.beginPath()
                for(let k = 0; k < 16; k++){
                    const a = k / 16 * Math.PI * 2 + i * 0.3
                    const d = k % 2 ? rr * 0.75 : rr
                    ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d)
                }
                ctx.closePath()
                ctx.fill()
                ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
                for(let k = 0; k < 8; k++){
                    const a = k / 8 * Math.PI * 2 + i
                    blob(Math.cos(a) * rr * 0.7, Math.sin(a) * rr * 0.7, rr * 0.1, 'rgba(255, 255, 255, 0.8)')
                }
            })
            return true
        }

        case 'snowman': {
            blob(r * 0.15, r * 0.2, r * 0.8, 'rgba(0, 0, 0, 0.12)')
            blob(0, r * 0.25, r * 0.6, '#ffffff')
            blob(0, -r * 0.35, r * 0.42, '#f6fbff')
            blob(-r * 0.12, -r * 0.42, r * 0.05, '#1b2a22')
            blob(r * 0.12, -r * 0.42, r * 0.05, '#1b2a22')
            ctx.fillStyle = '#ff9f1c'
            ctx.beginPath()
            ctx.moveTo(0, -r * 0.32)
            ctx.lineTo(r * 0.28, -r * 0.28)
            ctx.lineTo(0, -r * 0.24)
            ctx.fill()
            ctx.fillStyle = color
            ctx.fillRect(-r * 0.4, -r * 0.08, r * 0.8, r * 0.1)
            return true
        }

        case 'igloo': {
            blob(r * 0.15, r * 0.2, r * 0.95, 'rgba(0, 0, 0, 0.12)')
            blob(0, 0, r * 0.9, '#f2f8fc')
            ctx.strokeStyle = 'rgba(120, 160, 190, 0.5)'
            ctx.lineWidth = 2
            for(let k = 1; k < 4; k++){
                ctx.beginPath()
                ctx.arc(0, 0, r * 0.9 * k / 4, 0, Math.PI * 2)
                ctx.stroke()
            }
            ctx.fillStyle = '#2f4a60'
            ctx.beginPath()
            ctx.ellipse(0, r * 0.75, r * 0.25, r * 0.2, 0, 0, Math.PI * 2)
            ctx.fill()
            return true
        }

        case 'cabinet': {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
            ctx.fillRect(-w / 2 + 4, -h / 2 + 5, w, h)
            ctx.fillStyle = '#251d4a'
            ctx.fillRect(-w / 2, -h / 2, w, h)
            ctx.save()
            ctx.shadowColor = color
            ctx.shadowBlur = 14
            ctx.strokeStyle = color
            ctx.lineWidth = 3
            ctx.strokeRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6)
            ctx.restore()
            const flick = 0.75 + 0.25 * Math.sin(t * 9)
            ctx.fillStyle = `rgba(79, 209, 255, ${flick})`
            ctx.fillRect(-w * 0.32, -h * 0.35, w * 0.64, h * 0.35)
            blob(-w * 0.15, h * 0.2, Math.min(w, h) * 0.06, '#ff5d5d')
            blob(w * 0.15, h * 0.2, Math.min(w, h) * 0.06, '#ffe14f')
            return true
        }

        case 'slime': {
            const px = Math.min(w, h) / 11
            const frame = Math.floor(t * 2) % 2
            const rows = frame
                ? ['00011111000', '00111111100', '01111111110', '01101110110', '11111111111', '11111111111', '11011011011', '10010010010']
                : ['00000000000', '00011111000', '01111111110', '01101110110', '11111111111', '11111111111', '01101101101', '01001001001']
            ctx.save()
            ctx.shadowColor = color
            ctx.shadowBlur = 12
            ctx.fillStyle = color
            rows.forEach((row, y) => {
                for(let x = 0; x < row.length; x++){
                    if(row[x] === '1') ctx.fillRect((x - 5.5) * px, (y - 4) * px, px, px)
                }
            })
            ctx.restore()
            return true
        }

        case 'coin': {
            const squash = Math.abs(Math.cos(t * 2.5))
            ctx.fillStyle = '#c99a1c'
            ctx.beginPath()
            ctx.ellipse(0, 0, r * Math.max(0.12, squash), r, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#ffe14f'
            ctx.beginPath()
            ctx.ellipse(0, 0, r * 0.8 * Math.max(0.1, squash), r * 0.8, 0, 0, Math.PI * 2)
            ctx.fill()
            return true
        }

        case 'tombstone': {
            const path = () => {
                ctx.beginPath()
                ctx.moveTo(-w * 0.4, h * 0.45)
                ctx.lineTo(-w * 0.4, -h * 0.1)
                ctx.arc(0, -h * 0.1, w * 0.4, Math.PI, 0)
                ctx.lineTo(w * 0.4, h * 0.45)
                ctx.closePath()
            }
            shadowed(ctx, path, '#77708a')
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(0, -h * 0.25)
            ctx.lineTo(0, h * 0.15)
            ctx.moveTo(-w * 0.15, -h * 0.1)
            ctx.lineTo(w * 0.15, -h * 0.1)
            ctx.stroke()
            return true
        }

        case 'deadtree': {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
            ctx.lineCap = 'round'
            const branch = (x: number, y: number, a: number, len: number, width: number, depth: number, stroke: string) => {
                const x2 = x + Math.cos(a) * len
                const y2 = y + Math.sin(a) * len
                ctx.strokeStyle = stroke
                ctx.lineWidth = width
                ctx.beginPath()
                ctx.moveTo(x, y)
                ctx.lineTo(x2, y2)
                ctx.stroke()
                if(depth > 0){
                    branch(x2, y2, a - 0.5, len * 0.65, width * 0.65, depth - 1, stroke)
                    branch(x2, y2, a + 0.45, len * 0.6, width * 0.65, depth - 1, stroke)
                }
            }
            for(let k = 0; k < 5; k++) branch(4, 5, k / 5 * Math.PI * 2, r * 0.45, 7, 2, 'rgba(0, 0, 0, 0.25)')
            for(let k = 0; k < 5; k++) branch(0, 0, k / 5 * Math.PI * 2, r * 0.45, 7, 2, '#3b2f2a')
            return true
        }

        case 'pumpkin': {
            blob(r * 0.15, r * 0.2, r * 0.85, 'rgba(0, 0, 0, 0.25)')
            for(const dx of [-0.35, 0.35, 0]){
                ctx.fillStyle = dx ? '#e8731c' : '#ff8a1f'
                ctx.beginPath()
                ctx.ellipse(dx * r, 0, r * 0.5, r * 0.75, 0, 0, Math.PI * 2)
                ctx.fill()
            }
            const glow = 0.7 + 0.3 * Math.sin(t * 6)
            ctx.fillStyle = `rgba(255, 230, 120, ${glow})`
            for(const s of [-1, 1]){
                ctx.beginPath()
                ctx.moveTo(s * r * 0.3, -r * 0.2)
                ctx.lineTo(s * r * 0.15, -r * 0.05)
                ctx.lineTo(s * r * 0.45, -r * 0.05)
                ctx.fill()
            }
            ctx.beginPath()
            ctx.moveTo(-r * 0.35, r * 0.2)
            ctx.lineTo(r * 0.35, r * 0.2)
            ctx.lineTo(0, r * 0.4)
            ctx.fill()
            ctx.fillStyle = '#4a6b2a'
            ctx.fillRect(-r * 0.06, -r * 0.9, r * 0.12, r * 0.25)
            return true
        }

        case 'lollipop': {
            ctx.strokeStyle = '#fff6ea'
            ctx.lineWidth = r * 0.12
            ctx.lineCap = 'round'
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(r * 0.3, r * 0.95)
            ctx.stroke()
            blob(r * 0.12, r * 0.15, r * 0.65, 'rgba(0, 0, 0, 0.15)')
            blob(0, 0, r * 0.62, color)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
            ctx.lineWidth = r * 0.1
            ctx.beginPath()
            for(let a = 0; a < 12; a += 0.15){
                const d = a / 12 * r * 0.55
                ctx.lineTo(Math.cos(a + t * 0.5) * d, Math.sin(a + t * 0.5) * d)
            }
            ctx.stroke()
            return true
        }

        case 'cupcake': {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
            ctx.beginPath()
            ctx.arc(r * 0.15, r * 0.2, r * 0.85, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#c99a64'
            ctx.beginPath()
            ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2)
            ctx.fill()
            for(let i = 0; i < 3; i++) blob(0, 0, r * (0.7 - i * 0.2), i % 2 ? '#fff1f6' : color)
            blob(0, 0, r * 0.14, '#e8304a')
            return true
        }

        case 'gumdrop': {
            blob(r * 0.1, r * 0.15, r * 0.7, 'rgba(0, 0, 0, 0.15)')
            blob(0, 0, r * 0.68, color)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
            for(let i = 0; i < 9; i++){
                const a = i * 2.3
                ctx.fillRect(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, 3, 3)
            }
            blob(-r * 0.2, -r * 0.2, r * 0.15, 'rgba(255, 255, 255, 0.5)')
            return true
        }

        case 'gear': {
            ctx.rotate(t * 0.6)
            const teeth = 14
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
            ctx.beginPath()
            ctx.arc(4, 5, r * 0.95, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = color
            ctx.beginPath()
            for(let i = 0; i < teeth * 2; i++){
                const a = i / (teeth * 2) * Math.PI * 2
                const d = i % 2 ? r * 0.82 : r
                ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d)
            }
            ctx.closePath()
            ctx.fill()
            blob(0, 0, r * 0.55, 'rgba(0, 0, 0, 0.25)')
            blob(0, 0, r * 0.2, color)
            return true
        }

        case 'pipe': {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
            ctx.fillRect(-w / 2 + 4, -h * 0.2 + 5, w, h * 0.4)
            const g = ctx.createLinearGradient(0, -h * 0.2, 0, h * 0.2)
            g.addColorStop(0, '#9aa1a8')
            g.addColorStop(0.5, '#d0d5da')
            g.addColorStop(1, '#6b7178')
            ctx.fillStyle = g
            ctx.fillRect(-w / 2, -h * 0.2, w, h * 0.4)
            ctx.fillStyle = '#5a6066'
            ctx.fillRect(-w * 0.2, -h * 0.26, w * 0.08, h * 0.52)
            ctx.fillRect(w * 0.15, -h * 0.26, w * 0.08, h * 0.52)
            const puff = (t * 0.6) % 1
            blob(w * 0.45, -puff * h * 0.8, h * 0.1 * (1 + puff), `rgba(230, 230, 230, ${0.4 * (1 - puff)})`)
            return true
        }

        case 'barrel': {
            blob(r * 0.15, r * 0.2, r * 0.8, 'rgba(0, 0, 0, 0.3)')
            blob(0, 0, r * 0.8, color)
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)'
            ctx.lineWidth = 3
            for(const k of [0.75, 0.45]){
                ctx.beginPath()
                ctx.arc(0, 0, r * k, 0, Math.PI * 2)
                ctx.stroke()
            }
            ctx.fillStyle = '#1f2226'
            ctx.font = `900 ${r * 0.5}px sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('!', 0, 2)
            return true
        }
    }

    return false
}
