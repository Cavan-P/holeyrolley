import { COURSES, buildHole, buildShape, objectBounds, surfaceAt, Water, Lava, Bridge, Faller, MovingCollider, Phased, Breakable, Low, type Collider, type HoleData, type Hole } from '../src/index'

const BALL = 8

function onFairway(hole: Hole, x: number, y: number): boolean {
    return hole.fairways.some(f => f.shape.contains(x, y))
}

function hazard(hole: Hole, x: number, y: number): boolean {
    const s = surfaceAt(hole.surfaces, x, y, 0)
    return s instanceof Water || s instanceof Lava
}

function blockedAt(hole: Hole, data: HoleData, x: number, y: number): boolean {
    if(!onFairway(hole, x, y)) return true
    if(hazard(hole, x, y)) return true
    for(const w of hole.walls){
        if(w.layer !== 0) continue
        const [cx, cy] = w.closestPoint(x, y)
        if(Math.hypot(cx - x, cy - y) < w.r + BALL) return true
    }
    return false
}

function straight(hole: Hole, data: HoleData): boolean {
    const { tee, cup } = data
    const d = Math.hypot(cup.x - tee.x, cup.y - tee.y)
    const steps = Math.ceil(d / 6)
    for(let i = 4; i < steps - 4; i++){
        const x = tee.x + (cup.x - tee.x) * i / steps
        const y = tee.y + (cup.y - tee.y) * i / steps
        if(blockedAt(hole, data, x, y)) return false
    }
    return true
}

function openLine(hole: Hole, data: HoleData): boolean {
    const { tee, cup } = data
    const seas = data.objects.filter(o => o.type === 'water' && o.style?.skin === 'ocean').map(o => buildShape((o as { shape: Parameters<typeof buildShape>[0] }).shape))
    const d = Math.hypot(cup.x - tee.x, cup.y - tee.y)
    for(let i = 1; i < d / 10; i++){
        const k = i * 10 / d
        const x = tee.x + (cup.x - tee.x) * k
        const y = tee.y + (cup.y - tee.y) * k
        if(!onFairway(hole, x, y) || seas.some(s => s.contains(x, y))) return false
    }
    return true
}

function fixed(w: Collider): boolean {
    return !(w instanceof Faller || w instanceof MovingCollider || w instanceof Phased || w instanceof Breakable || w instanceof Low)
}

// Grid search from tee to cup, treating moving/timed/breakable/low things as passable
function reachable(hole: Hole, data: HoleData): boolean {
    const CELL = 16
    const b = hole.bounds
    const cols = Math.ceil(b.w / CELL)
    const rows = Math.ceil(b.h / CELL)
    const walls = hole.walls.filter(w => w.layer === 0 && fixed(w))
    const bridges = hole.bridges
    const springs = data.objects.flatMap(o => o.type === 'spring' ? [objectBounds(o)] : [])
    const nearSpring = (x: number, y: number) => springs.some(s => Math.hypot(x - (s.x + s.w / 2), y - (s.y + s.h / 2)) < 480)
    const cache = new Map<number, boolean>()

    const open = (cx: number, cy: number): boolean => {
        const key = cy * cols + cx
        const hit = cache.get(key)
        if(hit !== undefined) return hit
        const x = b.x + (cx + 0.5) * CELL
        const y = b.y + (cy + 0.5) * CELL
        let ok: boolean
        if(bridges.some(br => br.shape.contains(x, y))) ok = true
        else {
            ok = onFairway(hole, x, y) && (!hazard(hole, x, y) || nearSpring(x, y))
            if(ok) for(const w of walls){
                const [px, py] = w.closestPoint(x, y)
                if(Math.hypot(px - x, py - y) < w.r + BALL - 2){ ok = false; break }
            }
        }
        cache.set(key, ok)
        return ok
    }

    const cell = (x: number, y: number): [number, number] => [Math.floor((x - b.x) / CELL), Math.floor((y - b.y) / CELL)]
    const [sx, sy] = cell(data.tee.x, data.tee.y)
    const [gx, gy] = cell(data.cup.x, data.cup.y)
    const seen = new Set<number>([sy * cols + sx])
    const queue: [number, number][] = [[sx, sy]]

    while(queue.length){
        const [x, y] = queue.shift()!
        if(Math.abs(x - gx) <= 1 && Math.abs(y - gy) <= 1) return true

        const next: [number, number][] = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]
        const wx = b.x + (x + 0.5) * CELL
        const wy = b.y + (y + 0.5) * CELL
        for(const p of hole.portals){
            if(Math.hypot(wx - p.ax, wy - p.ay) < p.radius) next.push(cell(p.bx, p.by))
            if(Math.hypot(wx - p.bx, wy - p.by) < p.radius) next.push(cell(p.ax, p.ay))
        }

        for(const [nx, ny] of next){
            if(nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
            const key = ny * cols + nx
            if(seen.has(key) || !open(nx, ny)) continue
            seen.add(key)
            queue.push([nx, ny])
        }
    }
    return false
}

let problems = 0

for(const [id, course] of Object.entries(COURSES)){
    const notes: string[] = []

    course.holes.forEach((data, i) => {
        const { hole } = buildHole(data, null)
        const b = hole.bounds
        const issues: string[] = []
        const dist = Math.hypot(data.cup.x - data.tee.x, data.cup.y - data.tee.y)

        if(!reachable(hole, data)) issues.push('UNREACHABLE CUP')
        if(straight(hole, data) && !(id === 'darkwood' && i < 2)) issues.push('STRAIGHT SHOT')
        if(dist < 700 && b.w * b.h < 900_000 && !(id === 'darkwood' && i < 2)) issues.push(`small (${Math.round(b.w)}x${Math.round(b.h)})`)
        if(!onFairway(hole, data.tee.x, data.tee.y) || hazard(hole, data.tee.x, data.tee.y)) issues.push('tee off fairway/in hazard')
        if(!onFairway(hole, data.cup.x, data.cup.y) || hazard(hole, data.cup.x, data.cup.y)) issues.push('cup off fairway/in hazard')

        for(const o of data.objects){
            if(o.type === 'decor'){
                const ob = objectBounds(o)
                const corners = [[ob.x, ob.y], [ob.x + ob.w, ob.y], [ob.x, ob.y + ob.h], [ob.x + ob.w, ob.y + ob.h], [ob.x + ob.w / 2, ob.y + ob.h / 2]]
                if(corners.some(([x, y]) => onFairway(hole, x!, y!))) issues.push(`decor ${o.id} overlaps fairway`)
            }
            if((o.type === 'post' || o.type === 'bumper') && !o.motion){
                const c = o.type === 'post' ? o : o.a
                if(!onFairway(hole, c.x, c.y)) issues.push(`${o.id} off fairway`)
            }
            if(o.type === 'wall' && o.motion && o.motion.mode === 'loop'){
                const c = o.motion.pivot
                const reach = Math.max(...o.points.map(p => Math.hypot(p.x - c.x, p.y - c.y))) + o.thickness
                for(let k = 0; k < 16; k++){
                    const a = k / 16 * Math.PI * 2
                    if(!onFairway(hole, c.x + Math.cos(a) * reach, c.y + Math.sin(a) * reach)){
                        issues.push(`${o.id} sweeps off fairway`)
                        break
                    }
                }
            }
            if(o.type === 'bridge'){
                if(!onFairway(hole, o.a.x, o.a.y) || !onFairway(hole, o.b.x, o.b.y)) issues.push(`${o.id} end off fairway`)
            }
            if(o.type === 'portal'){
                if(!onFairway(hole, o.a.x, o.a.y) || !onFairway(hole, o.b.x, o.b.y)) issues.push(`${o.id} end off fairway`)
            }
        }

        if(issues.length){
            problems += issues.length
            notes.push(`  ${i + 1}. ${data.name} (${Math.round(b.w)}x${Math.round(b.h)}): ${issues.join('; ')}`)
        }
    })

    const par = course.holes.reduce((s, h) => s + h.par, 0)
    console.log(`${id} — ${course.name}, ${course.holes.length} holes, par ${par}${notes.length ? '' : ': ok'}`)
    for(const n of notes) console.log(n)
}

console.log(problems ? `\n${problems} issue(s)` : '\nall clear')
