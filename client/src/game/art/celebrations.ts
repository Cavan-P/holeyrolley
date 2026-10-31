import type { CelebrationId } from '@holey/shared'

export const CELEBRATION_NAMES: Record<CelebrationId, string> = {
    confetti: 'Confetti',
    sparkles: 'Sparkles',
    leaves: 'Falling leaves',
    bubbles: 'Bubbles'
}

type ParticleShape = 'strip' | 'star' | 'leaf' | 'bubble'

export type Particle = {
    x: number
    y: number
    vx: number
    vy: number
    age: number
    life: number
    size: number
    color: string
    angle: number
    spin: number
    shape: ParticleShape
}

type Recipe = {
    count: number
    shape: ParticleShape
    colors: string[]
    speed: [number, number]
    size: [number, number]
    life: [number, number]
    gravity: number
    drag: number
    sway: number
}

const RECIPES: Record<CelebrationId, Recipe> = {
    confetti: {
        count: 40, shape: 'strip', colors: ['#ff5d5d', '#ffd23f', '#3a86ff', '#2ec4b6', '#f15bb5'],
        speed: [160, 300], size: [4, 7], life: [1.1, 1.6], gravity: 420, drag: 0.15, sway: 0
    },
    sparkles: {
        count: 22, shape: 'star', colors: ['#fff6e0', '#ffd23f', '#ffe58a'],
        speed: [140, 280], size: [4, 8], life: [0.7, 1.2], gravity: 0, drag: 0.2, sway: 0
    },
    leaves: {
        count: 18, shape: 'leaf', colors: ['#6cc04a', '#3d8a2c', '#ff9f1c', '#c4672b'],
        speed: [120, 260], size: [5, 8], life: [1.4, 2], gravity: 160, drag: 0.08, sway: 60
    },
    bubbles: {
        count: 16, shape: 'bubble', colors: ['#d6f1fb', '#ffffff', '#9fd8f5'],
        speed: [40, 120], size: [3, 7], life: [1.2, 1.9], gravity: -90, drag: 0.3, sway: 25
    }
}

const RECIPES_BY_SHAPE: Record<ParticleShape, Recipe> = {
    strip: RECIPES.confetti,
    star: RECIPES.sparkles,
    leaf: RECIPES.leaves,
    bubble: RECIPES.bubbles
}

const between = ([a, b]: [number, number]) => a + Math.random() * (b - a)

export function burst(id: CelebrationId, x: number, y: number): Particle[] {
    const r = RECIPES[id]
    const out: Particle[] = []

    for(let i = 0; i < r.count; i++){
        const dir = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4
        const speed = between(r.speed)

        out.push({
            x, y,
            vx: Math.cos(dir) * speed,
            vy: Math.sin(dir) * speed,
            age: 0,
            life: between(r.life),
            size: between(r.size),
            color: r.colors[i % r.colors.length] ?? '#ffffff',
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 12,
            shape: r.shape
        })
    }

    return out
}

export function stepParticles(particles: Particle[], dt: number): Particle[] {
    for(const p of particles){
        const r = RECIPES_BY_SHAPE[p.shape]

        p.age += dt
        p.vy += r.gravity * dt
        p.vx *= Math.pow(r.drag, dt)
        p.vy *= Math.pow(r.drag, dt)
        p.x += (p.vx + Math.sin(p.age * 6 + p.angle) * r.sway) * dt
        p.y += p.vy * dt
        p.angle += p.spin * dt
    }

    return particles.filter(p => p.age < p.life)
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
    for(const p of particles){
        const fade = Math.min(1, (p.life - p.age) / 0.3)
        const s = p.size

        ctx.save()
        ctx.globalAlpha = fade
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)

        switch(p.shape){
            case 'strip':
                ctx.fillStyle = p.color
                ctx.scale(1, Math.cos(p.age * 9 + p.angle))
                ctx.fillRect(-s / 2, -s / 4, s, s / 2)
                break

            case 'star': {
                const twinkle = 0.6 + 0.4 * Math.sin(p.age * 20 + p.angle)
                ctx.scale(twinkle, twinkle)
                ctx.fillStyle = p.color
                ctx.beginPath()
                for(let i = 0; i < 8; i++){
                    const r = i % 2 === 0 ? s : s * 0.3
                    const a = (i / 8) * Math.PI * 2
                    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
                }
                ctx.closePath()
                ctx.fill()
                break
            }

            case 'leaf':
                ctx.fillStyle = p.color
                ctx.beginPath()
                ctx.ellipse(0, 0, s, s * 0.45, 0, 0, Math.PI * 2)
                ctx.fill()
                break

            case 'bubble':
                ctx.strokeStyle = p.color
                ctx.lineWidth = 1.5
                ctx.beginPath()
                ctx.arc(0, 0, s, 0, Math.PI * 2)
                ctx.stroke()
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
                ctx.beginPath()
                ctx.arc(-s * 0.35, -s * 0.35, s * 0.25, 0, Math.PI * 2)
                ctx.fill()
                break
        }

        ctx.restore()
    }
}
