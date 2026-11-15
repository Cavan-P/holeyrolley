import type { CourseObject, HoleData, Phase } from '../course'
import type { Cosmetics } from '../cosmetics'
import { Hole, type Fairway, type Mover } from './Hole'
import { Ball } from './Ball'
import { Cup } from './Cup'
import { Wall } from './Wall'
import { ArcWall } from './ArcWall'
import { Bumper } from './Bumper'
import { Bridge } from './Bridge'
import { Transform } from './Transform'
import { MovingCollider } from './MovingCollider'
import type { Collider } from './Collider'
import type { Surface } from './surfaces/Surface'
import { Sand } from './surfaces/Sand'
import { Ice } from './surfaces/Ice'
import { Water } from './surfaces/Water'
import { Slope } from './surfaces/Slope'
import { Lava } from './surfaces/Lava'
import { Magnet } from './Magnet'
import { Faller } from './Faller'
import { Portal } from './Portal'
import { Spring } from './surfaces/Spring'
import { Conveyor } from './surfaces/Conveyor'
import { Breakable, Low, Phased } from './Special'
import { TransformedShape } from './shapes/TransformedShape'
import type { Point, Shape } from './shapes/Shape'
import { buildShape, wallPath } from './data'

const RAIL = 6
const RAIL_BOUNCE = 0.6

type Built = {
    fairways: Fairway[]
    walls: Collider[]
    surfaces: Surface[]
    bridges: Bridge[]
    movers: Mover[]
    magnets: Magnet[]
    fallers: Faller[]
    portals: Portal[]
}

export type Part = {
    transform: Transform | null
    colliders: Collider[]
    surface: Surface | null
    magnet: Magnet | null
    faller: Faller | null
    portal: Portal | null
}

export function buildHole(data: HoleData, player: Cosmetics | null): { hole: Hole, parts: Part[] } {
    const built: Built = {
        fairways: [],
        walls: [],
        surfaces: [],
        bridges: [],
        movers: [],
        magnets: [],
        fallers: [],
        portals: []
    }

    const lanes = data.objects.flatMap(o => o.type === 'fairway' ? [buildShape(o.shape)] : [])
    const parts = data.objects.map(o => buildObject(o, built, lanes))

    const hole = new Hole({
        par: data.par,
        tee: { ...data.tee },
        ...built,
        voidEdge: data.voidEdge ?? false,
        balls: player ? [new Ball(data.tee.x, data.tee.y, player)] : [],
        cups: [data.cup, ...(data.extraCups ?? [])].map(c => new Cup(c.x, c.y))
    })

    return { hole, parts }
}

function sameShape(a: Shape, b: Shape): boolean {
    const x = a.bounds()
    const y = b.bounds()
    return x.x === y.x && x.y === y.y && x.w === y.w && x.h === y.h
}

function railsAlong(points: Point[], closed: boolean, r: number, bounce: number, layer: number): Wall[] {
    const walls: Wall[] = []
    const count = closed ? points.length : points.length - 1

    for(let i = 0; i < count; i++){
        const a = points[i]
        const b = points[(i + 1) % points.length]
        if(a && b) walls.push(new Wall(a[0], a[1], b[0], b[1], r, bounce, layer))
    }

    return walls
}

function buildObject(o: CourseObject, out: Built, lanes: Shape[]): Part {
    const layer = o.layer === 1 ? 1 : 0
    const part: Part = { transform: null, colliders: [], surface: null, magnet: null, faller: null, portal: null }

    if(o.motion && o.motion.keys.length > 0 && o.type !== 'fairway' && o.type !== 'bridge' && o.type !== 'faller' && o.type !== 'portal'){
        part.transform = new Transform(o.motion.pivot.x, o.motion.pivot.y)
        out.movers.push({ transform: part.transform, path: o.motion })
    }
    const transform = part.transform

    const moving = (c: Collider): Collider => transform ? new MovingCollider(c, transform) : c

    const addColliders = (colliders: Collider[]) => {
        const solid = 'low' in o || 'hits' in o || 'phase' in o ? o as { low?: boolean, hits?: number, phase?: Phase } : null
        const wrapped = colliders.map(c => {
            let w: Collider = c
            if(solid?.low) w = new Low(w)
            if(solid?.phase) w = new Phased(w, solid.phase)
            if(solid?.hits) w = new Breakable(w, solid.hits)
            return w
        })
        out.walls.push(...wrapped)
        part.colliders = wrapped
    }

    const addSurface = (s: Surface) => {
        s.layer = layer
        out.surfaces.push(s)
        part.surface = s
    }

    const shapeOf = (d: Parameters<typeof buildShape>[0]) => {
        const shape = buildShape(d)
        return transform ? new TransformedShape(shape, transform) : shape
    }

    switch(o.type){
        case 'fairway': {
            const shape = buildShape(o.shape)
            out.fairways.push({ shape, color: o.style?.color ?? null })
            if(o.rails){
                const others = lanes.filter(l => !sameShape(l, shape))
                const inside = (w: Wall) => others.some(l => l.contains((w.x1 + w.x2) / 2, (w.y1 + w.y2) / 2))
                const rails = shape.outline().flatMap(loop => railsAlong(loop, true, RAIL, RAIL_BOUNCE, 0)).filter(w => !inside(w))
                addColliders(rails)
            }
            break
        }

        case 'sand':
            addSurface(new Sand(shapeOf(o.shape)))
            break
        case 'ice':
            addSurface(new Ice(shapeOf(o.shape)))
            break
        case 'water':
            addSurface(new Water(shapeOf(o.shape)))
            break
        case 'spring':
            addSurface(new Spring(shapeOf(o.shape), o.power))
            break
        case 'conveyor':
            addSurface(new Conveyor(shapeOf(o.shape), o.push.x, o.push.y))
            break
        case 'portal': {
            const p = new Portal(o.a.x, o.a.y, o.b.x, o.b.y, o.radius, layer)
            out.portals.push(p)
            part.portal = p
            break
        }
        case 'lava':
            addSurface(new Lava(shapeOf(o.shape)))
            break
        case 'magnet': {
            const m = new Magnet(o.x, o.y, o.radius, o.strength, layer, transform)
            out.magnets.push(m)
            part.magnet = m
            break
        }
        case 'faller': {
            let seed = 0
            for(const ch of o.id) seed = (seed * 31 + ch.charCodeAt(0)) % 9973
            const f = new Faller(buildShape(o.shape), o.every, o.size, seed)
            out.fallers.push(f)
            out.walls.push(f)
            part.faller = f
            break
        }
        case 'slope':
            addSurface(new Slope(shapeOf(o.shape), o.push.x, o.push.y))
            break

        case 'wall':
        case 'curveWall': {
            const rails = railsAlong(wallPath(o), o.closed, o.thickness, o.bounce, layer)
            addColliders(rails.map(moving))
            break
        }

        case 'arcWall':
            addColliders([moving(new ArcWall(o.x, o.y, o.radius, o.start, o.end, o.thickness, o.bounce, layer))])
            break

        case 'bumper':
            addColliders([moving(new Bumper(o.a.x, o.a.y, o.b.x, o.b.y, o.radius, o.kick, layer))])
            break

        case 'post':
            addColliders([moving(new Wall(o.x, o.y, o.x, o.y, o.radius, o.bounce, layer))])
            break

        case 'bridge': {
            const bridge = new Bridge(o.a.x, o.a.y, o.b.x, o.b.y, o.width, o.rails)
            out.bridges.push(bridge)
            out.surfaces.push(bridge)
            part.surface = bridge

            out.walls.push(...bridge.rails)
            part.colliders = bridge.rails
            break
        }

        case 'decor':
            break
    }

    return part
}
