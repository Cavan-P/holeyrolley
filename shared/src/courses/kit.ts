import type { CourseObject, HoleData, MotionPath, Phase, ShapeData, Skin, Style, Vec } from '../course'
import { buildShape, objectBounds } from '../sim/data'

const FAR = 4000

type Point = [number, number]

export type HoleOptions = {
    name: string
    par: number
    path: Point[]
    width: number | number[]
    rails?: boolean
    voidEdge?: boolean
    smooth?: boolean
    tee?: number
    cup?: number
    cupSide?: number
    fairway?: boolean
    teeAt?: Vec
    cupAt?: Vec
}

type Solid = { skin?: Skin, color?: string, low?: boolean, hits?: number, phase?: Phase }

function styleOf(skin?: Skin, color?: string): { style?: Style } {
    if(!skin && !color) return {}
    return { style: { ...(skin ? { skin } : {}), ...(color ? { color } : {}) } }
}

function solidOf(s: Solid): { low?: boolean, hits?: number, phase?: Phase } {
    return { ...(s.low ? { low: true } : {}), ...(s.hits ? { hits: s.hits } : {}), ...(s.phase ? { phase: s.phase } : {}) }
}

const r1 = (n: number) => Math.round(n)

let tier = 0

export function setTier(n: number): void {
    tier = n
}

const widthScale = () => 1.15 - 0.035 * tier
const timeScale = () => 1.25 - 0.05 * tier

export class Route {
    id: string
    pts: Point[]
    halves: number[]
    lengths: number[]
    total: number
    square: boolean
    count = 0

    constructor(id: string, path: Point[], width: number | number[], square = true){
        this.id = id
        this.pts = path
        this.square = square
        this.halves = path.map((_, i) => (Array.isArray(width) ? width[i] ?? width[width.length - 1]! : width) * widthScale() / 2)
        this.lengths = [0]
        for(let i = 1; i < path.length; i++){
            const a = path[i - 1]!
            const b = path[i]!
            this.lengths.push(this.lengths[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1]))
        }
        this.total = this.lengths[this.lengths.length - 1]!
    }

    next(kind: string): string {
        return `${this.id}-${kind}-${++this.count}`
    }

    private seg(t: number): { i: number, f: number } {
        const d = Math.max(0, Math.min(1, t)) * this.total
        let i = 1
        while(i < this.lengths.length - 1 && this.lengths[i]! < d) i++
        const span = this.lengths[i]! - this.lengths[i - 1]!
        return { i, f: span ? (d - this.lengths[i - 1]!) / span : 0 }
    }

    dir(t: number): Point {
        const { i } = this.seg(t)
        const a = this.pts[i - 1]!
        const b = this.pts[i]!
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
        return [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
    }

    half(t: number): number {
        const { i, f } = this.seg(t)
        return this.halves[i - 1]! + (this.halves[i]! - this.halves[i - 1]!) * f
    }

    // side: -1..1 across the corridor (left to right); beyond 1 is outside it
    p(t: number, side = 0, extra = 0): Vec {
        const { i, f } = this.seg(t)
        const a = this.pts[i - 1]!
        const b = this.pts[i]!
        const [dx, dy] = this.dir(t)
        const off = side * this.half(t) + Math.sign(side) * extra
        return { x: r1(a[0] + (b[0] - a[0]) * f - dy * off), y: r1(a[1] + (b[1] - a[1]) * f + dx * off) }
    }

    angle(t: number): number {
        const [dx, dy] = this.dir(t)
        return Math.atan2(dy, dx)
    }

    // Both edges of the corridor, mitred at the corners, scaled from the center line
    edges(scale = 1): { left: Vec[], right: Vec[], startCap: Vec, endCap: Vec } {
        const n = this.pts.length
        const left: Vec[] = []
        const right: Vec[] = []

        for(let i = 0; i < n; i++){
            const p = this.pts[i]!
            const prev = this.pts[Math.max(0, i - 1)]!
            const next = this.pts[Math.min(n - 1, i + 1)]!
            const inLen = Math.hypot(p[0] - prev[0], p[1] - prev[1]) || 1
            const outLen = Math.hypot(next[0] - p[0], next[1] - p[1]) || 1
            const din: Point = i ? [(p[0] - prev[0]) / inLen, (p[1] - prev[1]) / inLen] : [(next[0] - p[0]) / outLen, (next[1] - p[1]) / outLen]
            const dout: Point = i < n - 1 ? [(next[0] - p[0]) / outLen, (next[1] - p[1]) / outLen] : din
            let tx = din[0] + dout[0]
            let ty = din[1] + dout[1]
            const tl = Math.hypot(tx, ty) || 1
            tx /= tl
            ty /= tl
            const nx = -ty
            const ny = tx
            const miter = Math.min(1.8, 1 / Math.max(0.35, nx * -din[1] + ny * din[0]))
            const h = this.halves[i]! * miter * scale
            left.push({ x: r1(p[0] + nx * h), y: r1(p[1] + ny * h) })
            right.push({ x: r1(p[0] - nx * h), y: r1(p[1] - ny * h) })
        }

        const dense = (line: Vec[]): Vec[] => {
            const out: Vec[] = []
            for(let i = 0; i < line.length; i++){
                const a = line[i]!
                out.push(a)
                const b = line[i + 1]
                if(!b) continue
                const k = Math.floor(Math.hypot(b.x - a.x, b.y - a.y) / 90)
                for(let j = 2; j < k - 1; j++) out.push({ x: r1(a.x + (b.x - a.x) * j / k), y: r1(a.y + (b.y - a.y) * j / k) })
            }
            return out
        }

        const s = this.pts[0]!
        const e = this.pts[n - 1]!
        const [sdx, sdy] = this.dir(0)
        const [edx, edy] = this.dir(1)

        if(this.square){
            const back = this.halves[0]! * 0.35
            const fwd = this.halves[n - 1]! * 0.35
            for(const side of [left, right]){
                side[0] = { x: r1(side[0]!.x - sdx * back), y: r1(side[0]!.y - sdy * back) }
                side[n - 1] = { x: r1(side[n - 1]!.x + edx * fwd), y: r1(side[n - 1]!.y + edy * fwd) }
            }
        }

        return {
            left: dense(left),
            right: dense(right),
            startCap: { x: r1(s[0] - sdx * this.halves[0]! * 0.85), y: r1(s[1] - sdy * this.halves[0]! * 0.85) },
            endCap: { x: r1(e[0] + edx * this.halves[n - 1]! * 0.85), y: r1(e[1] + edy * this.halves[n - 1]! * 0.85) }
        }
    }

    outline(): Vec[] {
        const { left, right, startCap, endCap } = this.edges()
        return this.square ? [...left, ...right.reverse()] : [startCap, ...left, endCap, ...right.reverse()]
    }

    // A rectangle across the corridor at t, `depth` long along the path
    band(t: number, depth: number, overhang = 1.25): ShapeData {
        const c = this.p(t)
        const [dx, dy] = this.dir(t)
        const w = this.half(t) * overhang
        const d = depth / 2
        return { type: 'polygon', points: [
            { x: r1(c.x - dx * d - dy * w), y: r1(c.y - dy * d + dx * w) },
            { x: r1(c.x + dx * d - dy * w), y: r1(c.y + dy * d + dx * w) },
            { x: r1(c.x + dx * d + dy * w), y: r1(c.y + dy * d - dx * w) },
            { x: r1(c.x - dx * d + dy * w), y: r1(c.y - dy * d - dx * w) }
        ] }
    }

    // A patch along the corridor from t0 to t1, between two sides
    strip(t0: number, t1: number, s0 = -1.2, s1 = 1.2, steps = 6): ShapeData {
        const a: Vec[] = []
        const b: Vec[] = []
        for(let k = 0; k <= steps; k++){
            const t = t0 + (t1 - t0) * k / steps
            a.push(this.p(t, s0))
            b.push(this.p(t, s1))
        }
        return { type: 'polygon', points: [...a, ...b.reverse()] }
    }

    circle(t: number, side: number, r: number): ShapeData {
        const c = this.p(t, side)
        return { type: 'circle', x: c.x, y: c.y, r }
    }

    area(type: 'sand' | 'ice' | 'water' | 'lava', shape: ShapeData, skin?: Skin, motion?: MotionPath): CourseObject {
        return { id: this.next(type), type, layer: 0, shape, ...styleOf(skin), ...(motion ? { motion } : {}) }
    }

    slope(shape: ShapeData, along: number, across = 0): CourseObject {
        const [dx, dy] = this.dir(0.5)
        return { id: this.next('slope'), type: 'slope', layer: 0, shape, push: { x: r1(dx * along - dy * across), y: r1(dy * along + dx * across) } }
    }

    slopeAt(t: number, depth: number, along: number, across = 0): CourseObject {
        const [dx, dy] = this.dir(t)
        return { id: this.next('slope'), type: 'slope', layer: 0, shape: this.band(t, depth, 1.1), push: { x: r1(dx * along - dy * across), y: r1(dy * along + dx * across) } }
    }

    post(t: number, side: number, radius = 16, s: Solid = {}): CourseObject {
        const c = this.p(t, side)
        return { id: this.next('post'), type: 'post', layer: 0, x: c.x, y: c.y, radius, bounce: 0.75, ...solidOf(s), ...styleOf(s.skin, s.color) }
    }

    bumper(t: number, side: number, radius = 18, s: Solid = {}): CourseObject {
        const c = this.p(t, side)
        return { id: this.next('bumper'), type: 'bumper', layer: 0, a: c, b: { ...c }, radius, kick: 240, ...solidOf(s), ...styleOf(s.skin, s.color) }
    }

    // A wall across the corridor at t from side `from` to side `to`
    across(t: number, from: number, to: number, thickness = 10, s: Solid = {}, motion?: MotionPath): CourseObject {
        const edge = (v: number) => Math.max(-1.02, Math.min(1.02, v))
        return { id: this.next('wall'), type: 'wall', layer: 0, closed: false, thickness, bounce: 0.6, points: [this.p(t, edge(from)), this.p(t, edge(to))], ...solidOf(s), ...styleOf(s.skin, s.color), ...(motion ? { motion } : {}) }
    }

    // A wall running along the corridor at a fixed side
    lengthwise(t0: number, t1: number, side: number, thickness = 10, s: Solid = {}): CourseObject {
        return { id: this.next('wall'), type: 'wall', layer: 0, closed: false, thickness, bounce: 0.6, points: [this.p(t0, side), this.p(t1, side)], ...solidOf(s), ...styleOf(s.skin, s.color) }
    }

    // Slides back and forth across the corridor
    slide(t: number, travel: number, seconds: number): MotionPath {
        const c = this.p(t)
        const [dx, dy] = this.dir(t)
        return {
            mode: 'pingpong', pivot: c,
            keys: [
                { t: 0, x: 0, y: 0, angle: 0, ease: 'smooth' },
                { t: seconds * timeScale(), x: r1(-dy * travel), y: r1(dx * travel), angle: 0, ease: 'smooth' }
            ]
        }
    }

    spin(t: number, side: number, seconds: number): MotionPath {
        const c = this.p(t, side)
        return {
            mode: 'loop', pivot: c,
            keys: [
                { t: 0, x: 0, y: 0, angle: 0, ease: 'linear' },
                { t: Math.abs(seconds) * timeScale(), x: 0, y: 0, angle: seconds > 0 ? Math.PI * 2 : -Math.PI * 2, ease: 'linear' }
            ]
        }
    }

    spinner(t: number, side: number, half: number, seconds: number, s: Solid = {}): CourseObject {
        const c = this.p(t, side)
        const a = this.angle(t) + Math.PI / 2
        return {
            id: this.next('spinner'), type: 'wall', layer: 0, closed: false, thickness: 9, bounce: 0.7,
            points: [{ x: r1(c.x - Math.cos(a) * half), y: r1(c.y - Math.sin(a) * half) }, { x: r1(c.x + Math.cos(a) * half), y: r1(c.y + Math.sin(a) * half) }],
            ...solidOf(s), ...styleOf(s.skin, s.color),
            motion: this.spin(t, side, seconds)
        }
    }

    bridge(t0: number, t1: number, side: number, width: number, rails: boolean, color?: string): CourseObject {
        return { id: this.next('bridge'), type: 'bridge', layer: 1, a: this.p(t0, side), b: this.p(t1, side), width, rails, ...styleOf(undefined, color) }
    }

    fairway(shape: ShapeData, rails = true): CourseObject {
        return { id: this.next('fairway'), type: 'fairway', layer: 0, rails, shape }
    }

    // Rails round everything but one side, for holes with open water/void along that side
    edgeRails(open: 1 | -1, thickness = 6, color?: string): CourseObject {
        const { left, right, startCap, endCap } = this.edges()
        const closed = open === 1 ? right : left
        const openSide = open === 1 ? left : right
        const out = (p: Vec, from: Vec) => {
            const d = Math.hypot(p.x - from.x, p.y - from.y) || 1
            return { x: r1(p.x + (p.x - from.x) / d * 40), y: r1(p.y + (p.y - from.y) / d * 40) }
        }
        const s = this.p(0)
        const e = this.p(1)
        const pts = this.square
            ? [out(openSide[0]!, s), ...closed, out(openSide[openSide.length - 1]!, e)]
            : [out(openSide[0]!, s), startCap, ...closed, endCap, out(openSide[openSide.length - 1]!, e)]
        return { id: this.next('rails'), type: this.square ? 'wall' : 'curveWall', layer: 0, closed: false, thickness, bounce: 0.6, points: pts, ...styleOf(undefined, color) }
    }

    // Open water/lava beyond one side of a north-running hole
    shore(open: 1 | -1, inset = 0.78, type: 'water' | 'lava' = 'water', skin?: Skin): CourseObject {
        const { left, right } = this.edges(inset)
        const line = (open === 1 ? left : right).map((p, i) => ({ x: p.x + r1(Math.sin(i * 1.7 + p.y * 0.01) * 12), y: p.y }))
        const first = line[0]!
        const last = line[line.length - 1]!
        const out = open * FAR
        return {
            id: this.next('shore'), type, layer: 0, ...styleOf(skin),
            shape: { type: 'polygon', points: [{ x: first.x, y: first.y + FAR }, ...line, { x: last.x, y: last.y - FAR }, { x: out, y: last.y - FAR }, { x: out, y: first.y + FAR }] }
        }
    }

    decor(t: number, side: number, size: number, skin: Skin, color?: string, extra = 0): CourseObject {
        const c = this.p(t, side, extra + size / 2)
        return { id: this.next('decor'), type: 'decor', layer: 0, x: c.x - size / 2, y: c.y - size / 2, w: size, h: size, rotation: 0, ...styleOf(skin, color) }
    }
}

export function routeHole(o: HoleOptions, build: (r: Route) => CourseObject[]): HoleData {
    const id = o.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const r = new Route(id, o.path, o.width, !o.smooth)
    const fairway: CourseObject = {
        id: `${id}-fairway`, type: 'fairway', layer: 0, rails: o.rails ?? true,
        shape: { type: o.smooth ? 'curve' : 'polygon', points: r.outline() }
    }

    const objects = o.fairway === false ? build(r) : [fairway, ...build(r)]
    const lanes = objects.filter(x => x.type === 'fairway').map(x => buildShape((x as { shape: ShapeData }).shape))

    const clear = (x: CourseObject) => {
        if(x.type !== 'decor') return true
        const b = objectBounds(x)
        const pad = 24
        const probes = [[b.x - pad, b.y - pad], [b.x + b.w + pad, b.y - pad], [b.x - pad, b.y + b.h + pad], [b.x + b.w + pad, b.y + b.h + pad], [b.x + b.w / 2, b.y + b.h / 2], [b.x + b.w / 2, b.y - pad], [b.x + b.w / 2, b.y + b.h + pad], [b.x - pad, b.y + b.h / 2], [b.x + b.w + pad, b.y + b.h / 2]]
        return !probes.some(([px, py]) => lanes.some(l => l.contains(px!, py!)))
    }

    return {
        name: o.name,
        par: o.par,
        ...(o.voidEdge ? { voidEdge: true } : {}),
        tee: o.teeAt ?? r.p(o.tee ?? 0.03),
        cup: o.cupAt ?? r.p(o.cup ?? 0.96, o.cupSide ?? 0),
        objects: objects.filter(clear)
    }
}

export function difficulty(h: HoleData): number {
    let score = 0
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity

    for(const o of h.objects){
        if(o.type === 'fairway' && o.shape.type !== 'rect' && o.shape.type !== 'circle' && o.shape.type !== 'donut' && o.shape.type !== 'arc'){
            for(const p of o.shape.points){
                minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x)
                minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y)
            }
        }
        const moving = o.motion ? 2 : 0
        switch(o.type){
            case 'water': score += o.style?.skin === 'ocean' ? 3 : 1.4; break
            case 'lava': score += 1.6 + moving; break
            case 'slope': score += 1; break
            case 'sand': score += 0.4; break
            case 'ice': score += 0.8; break
            case 'post': score += 0.4 + moving + (o.hits ? 0.6 : 0) + (o.phase ? 1.2 : 0); break
            case 'bumper': score += 0.5 + (o.phase ? 1 : 0); break
            case 'wall': case 'curveWall': case 'arcWall':
                if(!o.id.includes('rails')) score += 0.6 + moving + (o.hits ? 0.8 : 0) + (o.phase ? 1.4 : 0)
                break
            case 'bridge': score += o.rails ? 0.6 : 2; break
            case 'faller': score += 2.2 / Math.max(0.6, o.every) * 1.5; break
            case 'magnet': score += Math.abs(o.strength) / 250; break
            case 'portal': score += 1; break
            case 'spring': score += 0.8; break
            case 'conveyor': score += 1; break
        }
    }

    if(h.voidEdge) score += 4
    if(Number.isFinite(minX)) score += Math.hypot(maxX - minX, maxY - minY) / 600
    return score + h.par
}

export function ordered(holes: HoleData[]): HoleData[] {
    return holes.map(h => [difficulty(h), h] as const).sort((a, b) => a[0] - b[0]).map(([, h]) => h)
}
