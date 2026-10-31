import type { CourseObject, HoleData, ObjectType, ShapeData, ShapeType, Vec, WallObject, CurveWallObject } from '@holey/shared'
import { buildShape, objectBounds, boundsCenter, wallPath } from '../game/data'
import { closestOnSegment } from '../game/utilities/closestOnSegment'
import { ArcWall } from '../game/classes/ArcWall'
import { Bridge } from '../game/classes/Bridge'
import { normalizeAngle } from '../game/utilities/angles'

export type ToolId = 'select' | 'fairway' | 'sand' | 'ice' | 'water' | 'slope' | 'wall' | 'curveWall'
    | 'arcWall' | 'bumper' | 'post' | 'bridge' | 'decor' | 'tee' | 'cup'

export type Gesture = 'drag' | 'points' | 'click'

export type ToolInfo = { id: ToolId, label: string, key: string, group: string }

export const TOOLS: ToolInfo[] = [
    { id: 'select', label: 'Select', key: 'v', group: 'Edit' },

    { id: 'fairway', label: 'Fairway', key: 'f', group: 'Areas' },
    { id: 'sand', label: 'Sand', key: 's', group: 'Areas' },
    { id: 'ice', label: 'Ice', key: 'i', group: 'Areas' },
    { id: 'water', label: 'Water', key: 'q', group: 'Areas' },
    { id: 'slope', label: 'Slope', key: 'l', group: 'Areas' },

    { id: 'wall', label: 'Wall', key: 'w', group: 'Walls' },
    { id: 'curveWall', label: 'Curved wall', key: 'c', group: 'Walls' },
    { id: 'arcWall', label: 'Arc wall', key: 'a', group: 'Walls' },
    { id: 'bumper', label: 'Bumper', key: 'b', group: 'Walls' },
    { id: 'post', label: 'Post', key: 'p', group: 'Walls' },

    { id: 'bridge', label: 'Bridge', key: 'r', group: 'Other' },
    { id: 'decor', label: 'Decor / image', key: 'd', group: 'Other' },
    { id: 'tee', label: 'Tee', key: 't', group: 'Other' },
    { id: 'cup', label: 'Cup', key: 'h', group: 'Other' }
]

export const AREA_TOOLS: ToolId[] = ['fairway', 'sand', 'ice', 'water', 'slope']

export const SHAPE_KINDS: { id: ShapeType, label: string }[] = [
    { id: 'rect', label: 'Rect' },
    { id: 'circle', label: 'Circle' },
    { id: 'donut', label: 'Donut' },
    { id: 'arc', label: 'Arc' },
    { id: 'polygon', label: 'Polygon' },
    { id: 'curve', label: 'Curve' }
]

export function gestureFor(tool: ToolId, shapeKind: ShapeType): Gesture | null {
    if(tool === 'select') return null
    if(tool === 'post' || tool === 'tee' || tool === 'cup') return 'click'
    if(tool === 'wall' || tool === 'curveWall') return 'points'
    if(AREA_TOOLS.includes(tool) && (shapeKind === 'polygon' || shapeKind === 'curve')) return 'points'
    return 'drag'
}

export const TYPE_LABELS: Record<ObjectType, string> = {
    fairway: 'Fairway', sand: 'Sand', ice: 'Ice', water: 'Water', slope: 'Slope',
    wall: 'Wall', curveWall: 'Curved wall', arcWall: 'Arc wall', bumper: 'Bumper', post: 'Post',
    bridge: 'Bridge', decor: 'Decor'
}

export function newId(type: string): string {
    return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function newHole(n: number): HoleData {
    return {
        name: `Hole ${n}`,
        par: 3,
        tee: { x: 150, y: 300 },
        cup: { x: 1050, y: 300 },
        objects: [
            { id: newId('fairway'), type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 100, w: 1200, h: 400, radius: 60 } }
        ]
    }
}

const dist = (a: Vec, b: Vec) => Math.hypot(b.x - a.x, b.y - a.y)
const angleOf = (a: Vec, b: Vec) => Math.atan2(b.y - a.y, b.x - a.x)

function shapeFrom(kind: ShapeType, start: Vec, end: Vec, points: Vec[]): ShapeData | null {
    const r = dist(start, end)

    switch(kind){
        case 'rect': {
            const w = Math.abs(end.x - start.x)
            const h = Math.abs(end.y - start.y)
            if(w < 8 || h < 8) return null
            return { type: 'rect', x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), w, h, radius: 0 }
        }
        case 'circle':
            return r < 6 ? null : { type: 'circle', x: start.x, y: start.y, r }
        case 'donut':
            return r < 12 ? null : { type: 'donut', x: start.x, y: start.y, inner: r * 0.55, outer: r }
        case 'arc': {
            if(r < 12) return null
            const a = angleOf(start, end)
            return { type: 'arc', x: start.x, y: start.y, inner: r * 0.55, outer: r, start: a - Math.PI / 4, end: a + Math.PI / 4 }
        }
        case 'polygon':
        case 'curve':
            return points.length < 3 ? null : { type: kind, points: points.map(p => ({ ...p })) }
    }
}

export function createObject(tool: ToolId, shapeKind: ShapeType, start: Vec, end: Vec, points: Vec[], closed: boolean): CourseObject | null {
    const base = { id: newId(tool), layer: 0 as const }

    if(AREA_TOOLS.includes(tool)){
        const shape = shapeFrom(shapeKind, start, end, points)
        if(!shape) return null

        if(tool === 'fairway') return { ...base, type: 'fairway', shape, rails: true }
        if(tool === 'slope') return { ...base, type: 'slope', shape, push: { x: 150, y: 0 } }
        return { ...base, type: tool as 'sand' | 'ice' | 'water', shape }
    }

    switch(tool){
        case 'wall':
        case 'curveWall':
            if(points.length < 2) return null
            return { ...base, type: tool, points: points.map(p => ({ ...p })), closed, thickness: 6, bounce: 0.6 }
        case 'arcWall': {
            const r = dist(start, end)
            if(r < 12) return null
            const a = angleOf(start, end)
            return { ...base, type: 'arcWall', x: start.x, y: start.y, radius: r, start: a - Math.PI / 4, end: a + Math.PI / 4, thickness: 6, bounce: 0.6 }
        }
        case 'bumper':
            // A click (or tiny drag) makes a round bumper, a longer drag makes a bar
            return dist(start, end) < 8
                ? { ...base, type: 'bumper', a: { ...start }, b: { ...start }, radius: 14, kick: 260 }
                : { ...base, type: 'bumper', a: { ...start }, b: { ...end }, radius: 10, kick: 260 }
        case 'post':
            return { ...base, type: 'post', x: start.x, y: start.y, radius: 10, bounce: 0.6 }
        case 'bridge':
            if(dist(start, end) < 100) return null
            return { ...base, layer: 1, type: 'bridge', a: { ...start }, b: { ...end }, width: 90, rails: true }
        case 'decor': {
            const w = Math.abs(end.x - start.x)
            const h = Math.abs(end.y - start.y)
            if(w < 8 || h < 8) return null
            return { ...base, type: 'decor', x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), w, h, rotation: 0 }
        }
        default:
            return null
    }
}


const shiftVec = (v: Vec, dx: number, dy: number): Vec => ({ x: v.x + dx, y: v.y + dy })

function shiftShape(s: ShapeData, dx: number, dy: number): ShapeData {
    if(s.type === 'polygon' || s.type === 'curve') return { ...s, points: s.points.map(p => shiftVec(p, dx, dy)) }
    return { ...s, x: s.x + dx, y: s.y + dy }
}

export function moveObject(o: CourseObject, dx: number, dy: number): CourseObject {
    const motion = o.motion ? { ...o.motion, pivot: shiftVec(o.motion.pivot, dx, dy) } : undefined
    const moved = { ...o, ...(motion ? { motion } : {}) } as CourseObject

    switch(moved.type){
        case 'fairway':
        case 'sand':
        case 'ice':
        case 'water':
        case 'slope':
            return { ...moved, shape: shiftShape(moved.shape, dx, dy) }
        case 'wall':
        case 'curveWall':
            return { ...moved, points: moved.points.map(p => shiftVec(p, dx, dy)) }
        case 'arcWall':
        case 'post':
        case 'decor':
            return { ...moved, x: moved.x + dx, y: moved.y + dy }
        case 'bumper':
        case 'bridge':
            return { ...moved, a: shiftVec(moved.a, dx, dy), b: shiftVec(moved.b, dx, dy) }
    }
}

export type Handle = { key: string, x: number, y: number, kind: 'point' | 'insert' | 'size' | 'angle' | 'pivot' }

function pointHandles(points: Vec[], closed: boolean): Handle[] {
    const handles: Handle[] = points.map((p, i) => ({ key: `p${i}`, x: p.x, y: p.y, kind: 'point' }))
    const count = closed ? points.length : points.length - 1

    for(let i = 0; i < count; i++){
        const a = points[i]
        const b = points[(i + 1) % points.length]
        if(a && b) handles.push({ key: `m${i}`, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, kind: 'insert' })
    }

    return handles
}

const polar = (x: number, y: number, r: number, a: number) => ({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r })

function arcMid(start: number, end: number): number {
    return start + normalizeAngle(end - start) / 2
}

function shapeHandles(s: ShapeData): Handle[] {
    switch(s.type){
        case 'rect':
            return [
                { key: 'c0', x: s.x, y: s.y, kind: 'size' },
                { key: 'c1', x: s.x + s.w, y: s.y, kind: 'size' },
                { key: 'c2', x: s.x + s.w, y: s.y + s.h, kind: 'size' },
                { key: 'c3', x: s.x, y: s.y + s.h, kind: 'size' }
            ]
        case 'circle':
            return [{ key: 'r', x: s.x + s.r, y: s.y, kind: 'size' }]
        case 'donut':
            return [
                { key: 'outer', x: s.x + s.outer, y: s.y, kind: 'size' },
                { key: 'inner', x: s.x - s.inner, y: s.y, kind: 'size' }
            ]
        case 'arc': {
            const mid = arcMid(s.start, s.end)
            return [
                { key: 'outer', ...polar(s.x, s.y, s.outer, mid), kind: 'size' },
                { key: 'inner', ...polar(s.x, s.y, s.inner, mid), kind: 'size' },
                { key: 'start', ...polar(s.x, s.y, s.outer, s.start), kind: 'angle' },
                { key: 'end', ...polar(s.x, s.y, s.outer, s.end), kind: 'angle' }
            ]
        }
        case 'polygon':
        case 'curve':
            return pointHandles(s.points, true)
    }
}

export function getHandles(o: CourseObject): Handle[] {
    let handles: Handle[]

    switch(o.type){
        case 'fairway':
        case 'sand':
        case 'ice':
        case 'water':
        case 'slope':
            handles = shapeHandles(o.shape)
            break
        case 'wall':
        case 'curveWall':
            handles = pointHandles(o.points, o.closed)
            break
        case 'arcWall': {
            const mid = arcMid(o.start, o.end)
            handles = [
                { key: 'r', ...polar(o.x, o.y, o.radius, mid), kind: 'size' },
                { key: 'start', ...polar(o.x, o.y, o.radius, o.start), kind: 'angle' },
                { key: 'end', ...polar(o.x, o.y, o.radius, o.end), kind: 'angle' }
            ]
            break
        }
        case 'bumper':
            handles = o.a.x === o.b.x && o.a.y === o.b.y
                ? [{ key: 'r', x: o.a.x + o.radius, y: o.a.y, kind: 'size' }]
                : [{ key: 'a', x: o.a.x, y: o.a.y, kind: 'point' }, { key: 'b', x: o.b.x, y: o.b.y, kind: 'point' }]
            break
        case 'post':
            handles = [{ key: 'r', x: o.x + o.radius, y: o.y, kind: 'size' }]
            break
        case 'bridge':
            handles = [{ key: 'a', x: o.a.x, y: o.a.y, kind: 'point' }, { key: 'b', x: o.b.x, y: o.b.y, kind: 'point' }]
            break
        case 'decor':
            handles = [
                { key: 'c0', x: o.x, y: o.y, kind: 'size' },
                { key: 'c1', x: o.x + o.w, y: o.y, kind: 'size' },
                { key: 'c2', x: o.x + o.w, y: o.y + o.h, kind: 'size' },
                { key: 'c3', x: o.x, y: o.y + o.h, kind: 'size' }
            ]
            break
    }

    if(o.motion) handles.push({ key: 'pivot', x: o.motion.pivot.x, y: o.motion.pivot.y, kind: 'pivot' })
    return handles
}

function dragCorner(box: { x: number, y: number, w: number, h: number }, key: string, p: Vec) {
    const corners = [
        { x: box.x, y: box.y }, { x: box.x + box.w, y: box.y },
        { x: box.x + box.w, y: box.y + box.h }, { x: box.x, y: box.y + box.h }
    ]
    const i = Number(key.slice(1))
    const opposite = corners[(i + 2) % 4] ?? corners[0]!
    return {
        x: Math.min(p.x, opposite.x), y: Math.min(p.y, opposite.y),
        w: Math.max(4, Math.abs(p.x - opposite.x)), h: Math.max(4, Math.abs(p.y - opposite.y))
    }
}

function setPoint(points: Vec[], key: string, p: Vec): Vec[] {
    const i = Number(key.slice(1))
    return points.map((q, j) => j === i ? { ...p } : q)
}

function dragShapeHandle(s: ShapeData, key: string, p: Vec): ShapeData {
    switch(s.type){
        case 'rect': return { ...s, ...dragCorner(s, key, p) }
        case 'circle': return { ...s, r: Math.max(4, dist(s, p)) }
        case 'donut':
            return key === 'outer'
                ? { ...s, outer: Math.max(s.inner + 4, dist(s, p)) }
                : { ...s, inner: Math.min(s.outer - 4, Math.max(2, dist(s, p))) }
        case 'arc':
            if(key === 'outer') return { ...s, outer: Math.max(s.inner + 4, dist(s, p)) }
            if(key === 'inner') return { ...s, inner: Math.min(s.outer - 4, Math.max(0, dist(s, p))) }
            return { ...s, [key]: angleOf(s, p) }
        case 'polygon':
        case 'curve':
            return { ...s, points: setPoint(s.points, key, p) }
    }
}

export function dragHandle(o: CourseObject, key: string, p: Vec): CourseObject {
    if(key === 'pivot' && o.motion) return { ...o, motion: { ...o.motion, pivot: { ...p } } }

    switch(o.type){
        case 'fairway':
        case 'sand':
        case 'ice':
        case 'water':
        case 'slope':
            return { ...o, shape: dragShapeHandle(o.shape, key, p) }
        case 'wall':
        case 'curveWall':
            return { ...o, points: setPoint(o.points, key, p) }
        case 'arcWall':
            if(key === 'r') return { ...o, radius: Math.max(6, dist(o, p)) }
            return { ...o, [key]: angleOf(o, p) }
        case 'bumper':
            if(key === 'r') return { ...o, radius: Math.max(3, dist(o.a, p)) }
            return { ...o, [key]: { ...p } }
        case 'post':
            return { ...o, radius: Math.max(3, dist(o, p)) }
        case 'bridge':
            return { ...o, [key]: { ...p } }
        case 'decor':
            return { ...o, ...dragCorner(o, key, p) }
    }
}

function pointsOf(o: CourseObject): Vec[] | null {
    if(o.type === 'wall' || o.type === 'curveWall') return o.points
    if('shape' in o && (o.shape.type === 'polygon' || o.shape.type === 'curve')) return o.shape.points
    return null
}

function withPoints(o: CourseObject, points: Vec[]): CourseObject {
    if(o.type === 'wall' || o.type === 'curveWall') return { ...o, points }
    if('shape' in o && (o.shape.type === 'polygon' || o.shape.type === 'curve')) return { ...o, shape: { ...o.shape, points } } as CourseObject
    return o
}

export function insertPoint(o: CourseObject, i: number, p: Vec): [CourseObject, string] {
    const points = pointsOf(o)
    if(!points) return [o, '']
    const next = [...points.slice(0, i + 1), { ...p }, ...points.slice(i + 1)]
    return [withPoints(o, next), `p${i + 1}`]
}

export function removePoint(o: CourseObject, i: number): CourseObject {
    const points = pointsOf(o)
    const min = o.type === 'wall' || o.type === 'curveWall' ? 2 : 3
    if(!points || points.length <= min) return o
    return withPoints(o, points.filter((_, j) => j !== i))
}

function nearPath(points: [number, number][], closed: boolean, p: Vec, within: number): boolean {
    const count = closed ? points.length : points.length - 1
    for(let i = 0; i < count; i++){
        const a = points[i]
        const b = points[(i + 1) % points.length]
        if(!a || !b) continue
        const [cx, cy] = closestOnSegment(p.x, p.y, a[0], a[1], b[0], b[1])
        if(Math.hypot(p.x - cx, p.y - cy) <= within) return true
    }
    return false
}

export function hitObject(o: CourseObject, p: Vec, slop: number): boolean {
    switch(o.type){
        case 'fairway':
            return buildShape(o.shape).outline().some(loop => nearPath(loop, true, p, slop + 6))
        case 'sand':
        case 'ice':
        case 'water':
        case 'slope':
            return buildShape(o.shape).contains(p.x, p.y)
        case 'wall':
        case 'curveWall':
            return nearPath(wallPath(o as WallObject | CurveWallObject), o.closed, p, o.thickness + slop)
        case 'arcWall': {
            const [cx, cy] = new ArcWall(o.x, o.y, o.radius, o.start, o.end, o.thickness, o.bounce).closestPoint(p.x, p.y)
            return Math.hypot(p.x - cx, p.y - cy) <= o.thickness + slop
        }
        case 'bumper': {
            const [cx, cy] = closestOnSegment(p.x, p.y, o.a.x, o.a.y, o.b.x, o.b.y)
            return Math.hypot(p.x - cx, p.y - cy) <= o.radius + slop
        }
        case 'post':
            return Math.hypot(p.x - o.x, p.y - o.y) <= o.radius + slop
        case 'bridge':
            return new Bridge(o.a.x, o.a.y, o.b.x, o.b.y, o.width, false, '', '').shape.contains(p.x, p.y)
        case 'decor': {
            const c = boundsCenter(objectBounds(o))
            const cos = Math.cos(-o.rotation)
            const sin = Math.sin(-o.rotation)
            const lx = c.x + (p.x - c.x) * cos - (p.y - c.y) * sin
            const ly = c.y + (p.x - c.x) * sin + (p.y - c.y) * cos
            return lx >= o.x && lx <= o.x + o.w && ly >= o.y && ly <= o.y + o.h
        }
    }
}

export function pickObject(objects: CourseObject[], p: Vec, slop: number): CourseObject | null {
    for(const layer of [1, 0]){
        for(let i = objects.length - 1; i >= 0; i--){
            const o = objects[i]
            if(o && o.layer === layer && hitObject(o, p, slop)) return o
        }
    }
    return null
}

export function snapTo(p: Vec, grid: number): Vec {
    if(grid <= 0) return p
    return { x: Math.round(p.x / grid) * grid, y: Math.round(p.y / grid) * grid }
}

export function defaultMotion(o: CourseObject) {
    return {
        mode: 'pingpong' as const,
        pivot: boundsCenter(objectBounds(o)),
        keys: [
            { t: 0, x: 0, y: 0, angle: 0, ease: 'smooth' as const },
            { t: 2, x: 160, y: 0, angle: 0, ease: 'smooth' as const }
        ]
    }
}

export function canMove(type: ObjectType): boolean {
    return type !== 'fairway' && type !== 'bridge'
}

export function assetKey(dataUrl: string): string {
    let h = 0
    for(let i = 0; i < dataUrl.length; i += 7) h = (h * 31 + dataUrl.charCodeAt(i)) | 0
    return `img-${(h >>> 0).toString(36)}-${dataUrl.length.toString(36)}`
}
