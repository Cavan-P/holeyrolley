import type { CourseObject, ShapeData, Vec } from '@holey/shared'
import type { Bounds, Point, Shape } from './shapes/Shape'
import { RectShape } from './shapes/RectShape'
import { CircleShape } from './shapes/CircleShape'
import { DonutShape } from './shapes/DonutShape'
import { ArcShape } from './shapes/ArcShape'
import { PolygonShape } from './shapes/PolygonShape'
import { CurveShape } from './shapes/CurveShape'
import { smoothPoints, signedArea } from './utilities/spline'

export const toPoints = (vs: Vec[]): Point[] => vs.map(v => [v.x, v.y])

function clockwise(points: Point[]): Point[] {
    return signedArea(points) < 0 ? [...points].reverse() : points
}

export function buildShape(d: ShapeData): Shape {
    switch(d.type){
        case 'rect': return new RectShape(d.x, d.y, d.w, d.h, d.radius)
        case 'circle': return new CircleShape(d.x, d.y, d.r)
        case 'donut': return new DonutShape(d.x, d.y, d.inner, d.outer)
        case 'arc': return new ArcShape(d.x, d.y, d.inner, d.outer, d.start, d.end)
        case 'polygon': return new PolygonShape(clockwise(toPoints(d.points)))
        case 'curve': return new CurveShape(clockwise(toPoints(d.points)))
    }
}

export function wallPath(o: CourseObject & { points: Vec[], closed: boolean }): Point[] {
    const pts = toPoints(o.points)
    return o.type === 'curveWall' ? smoothPoints(pts, o.closed) : pts
}

function boundsOf(points: Point[], pad: number): Bounds {
    const xs = points.map(p => p[0])
    const ys = points.map(p => p[1])
    const minX = Math.min(...xs) - pad
    const minY = Math.min(...ys) - pad
    return { x: minX, y: minY, w: Math.max(...xs) + pad - minX, h: Math.max(...ys) + pad - minY }
}

export function objectBounds(o: CourseObject): Bounds {
    switch(o.type){
        case 'fairway':
        case 'sand':
        case 'ice':
        case 'water':
        case 'slope':
            return buildShape(o.shape).bounds()
        case 'wall':
        case 'curveWall':
            return boundsOf(wallPath(o), o.thickness)
        case 'arcWall':
            return { x: o.x - o.radius - o.thickness, y: o.y - o.radius - o.thickness, w: (o.radius + o.thickness) * 2, h: (o.radius + o.thickness) * 2 }
        case 'bumper':
            return boundsOf([[o.a.x, o.a.y], [o.b.x, o.b.y]], o.radius)
        case 'post':
            return { x: o.x - o.radius, y: o.y - o.radius, w: o.radius * 2, h: o.radius * 2 }
        case 'bridge': {
            const len = Math.hypot(o.b.x - o.a.x, o.b.y - o.a.y) || 1
            const nx = -(o.b.y - o.a.y) / len * o.width / 2
            const ny = (o.b.x - o.a.x) / len * o.width / 2
            return boundsOf([
                [o.a.x + nx, o.a.y + ny], [o.a.x - nx, o.a.y - ny],
                [o.b.x + nx, o.b.y + ny], [o.b.x - nx, o.b.y - ny]
            ], 0)
        }
        case 'decor':
            return { x: o.x, y: o.y, w: o.w, h: o.h }
    }
}

export function boundsCenter(b: Bounds): Vec {
    return { x: b.x + b.w / 2, y: b.y + b.h / 2 }
}
