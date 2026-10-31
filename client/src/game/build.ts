import type { Cosmetics, CourseData, CourseObject, HoleData } from '@holey/shared'
import { Hole, type Fairway, type LayerDrawables, type Mover } from './classes/Hole'
import { Ball } from './classes/Ball'
import { Cup } from './classes/Cup'
import { Wall } from './classes/Wall'
import { ArcWall } from './classes/ArcWall'
import { Bumper } from './classes/Bumper'
import { Bridge } from './classes/Bridge'
import { Decor } from './classes/Decor'
import { Transform } from './classes/Transform'
import { MovingCollider } from './classes/MovingCollider'
import { type Drawable, Faded } from './classes/Drawable'
import type { Collider } from './classes/Collider'
import type { Surface } from './surfaces/Surface'
import { Sand } from './surfaces/Sand'
import { Ice } from './surfaces/Ice'
import { Water } from './surfaces/Water'
import { Slope } from './surfaces/Slope'
import { TransformedShape } from './shapes/TransformedShape'
import type { Point } from './shapes/Shape'
import { ImageSkin } from './art/images'
import { getTheme, type Theme } from './art/themes'
import { buildShape, objectBounds, wallPath } from './data'

const RAIL = 6
const RAIL_BOUNCE = 0.6

type Built = {
    fairways: Fairway[]
    walls: Collider[]
    surfaces: Surface[]
    bridges: Bridge[]
    movers: Mover[]
    drawables: [LayerDrawables, LayerDrawables]
}

export function buildHole(data: HoleData, course: Pick<CourseData, 'theme' | 'assets'>, player: Cosmetics | null): Hole {
    const theme = getTheme(course.theme)

    const built: Built = {
        fairways: [],
        walls: [],
        surfaces: [],
        bridges: [],
        movers: [],
        drawables: [{ ground: [], solid: [] }, { ground: [], solid: [] }]
    }

    for(const o of data.objects) buildObject(o, theme, course.assets, built)

    return new Hole({
        par: data.par,
        tee: { ...data.tee },
        theme,
        ...built,
        balls: player ? [new Ball(data.tee.x, data.tee.y, player)] : [],
        cup: new Cup(data.cup.x, data.cup.y)
    })
}

function railsAlong(points: Point[], closed: boolean, r: number, bounce: number, color: string, layer: number): Wall[] {
    const walls: Wall[] = []
    const count = closed ? points.length : points.length - 1

    for(let i = 0; i < count; i++){
        const a = points[i]
        const b = points[(i + 1) % points.length]
        if(a && b) walls.push(new Wall(a[0], a[1], b[0], b[1], r, bounce, color, layer))
    }

    return walls
}

function buildObject(o: CourseObject, theme: Theme, assets: Record<string, string>, out: Built): void {
    const layer = o.layer === 1 ? 1 : 0
    const draw = out.drawables[layer]

    let transform: Transform | null = null
    if(o.motion && o.motion.keys.length > 0 && o.type !== 'fairway' && o.type !== 'bridge'){
        transform = new Transform(o.motion.pivot.x, o.motion.pivot.y)
        out.movers.push({ transform, path: o.motion })
    }

    const color = (fallback: string) => o.style?.color ?? fallback
    const image = o.style?.image ? assets[o.style.image] ?? null : null

    const styled = (look: Drawable, clipToShape: boolean): Drawable => {
        let d = look
        if(image && o.type !== 'decor'){
            const clip = clipToShape && 'shape' in o ? buildShape(o.shape) : null
            d = new ImageSkin(image, objectBounds(o), transform, clip, look)
        }
        const opacity = o.style?.opacity ?? 1
        return opacity < 1 ? new Faded(d, opacity) : d
    }

    const moving = (c: Collider): Collider => transform ? new MovingCollider(c, transform) : c

    const addColliders = (colliders: Collider[]) => {
        out.walls.push(...colliders)
        draw.solid.push(styled({ display: ctx => { for(const c of colliders) c.display(ctx) } }, false))
    }

    const addSurface = (s: Surface) => {
        s.layer = layer
        out.surfaces.push(s)
        draw.ground.push(styled(s, true))
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
                const rails = shape.outline().flatMap(loop => railsAlong(loop, true, RAIL, RAIL_BOUNCE, theme.rail, 0))
                out.walls.push(...rails)
                out.drawables[0].solid.push({ display: ctx => { for(const r of rails) r.display(ctx) } })
            }
            break
        }

        case 'sand': {
            const s = new Sand(shapeOf(o.shape))
            s.color = color(theme.sand)
            addSurface(s)
            break
        }
        case 'ice': {
            const s = new Ice(shapeOf(o.shape))
            s.color = color(theme.ice)
            addSurface(s)
            break
        }
        case 'water': {
            const s = new Water(shapeOf(o.shape))
            s.color = color(theme.water)
            addSurface(s)
            break
        }
        case 'slope': {
            const s = new Slope(shapeOf(o.shape), o.push.x, o.push.y)
            s.color = color(theme.slope)
            addSurface(s)
            break
        }

        case 'wall':
        case 'curveWall': {
            const rails = railsAlong(wallPath(o), o.closed, o.thickness, o.bounce, color(theme.rail), layer)
            addColliders(rails.map(moving))
            break
        }

        case 'arcWall':
            addColliders([moving(new ArcWall(o.x, o.y, o.radius, o.start, o.end, o.thickness, o.bounce, color(theme.rail), layer))])
            break

        case 'bumper':
            addColliders([moving(new Bumper(o.a.x, o.a.y, o.b.x, o.b.y, o.radius, o.kick, color(theme.bumper), theme.bumperFlash, layer))])
            break

        case 'post':
            addColliders([moving(new Wall(o.x, o.y, o.x, o.y, o.radius, o.bounce, color(theme.rail), layer))])
            break

        case 'bridge': {
            const bridge = new Bridge(o.a.x, o.a.y, o.b.x, o.b.y, o.width, o.rails, color(theme.bridge), theme.bridgeRail)
            out.bridges.push(bridge)
            out.surfaces.push(bridge)
            out.drawables[1].ground.push(styled(bridge, true))

            out.walls.push(...bridge.rails)
            out.drawables[1].solid.push({ display: ctx => { for(const r of bridge.rails) r.display(ctx) } })
            break
        }

        case 'decor':
            draw.solid.push(styled(new Decor(o.x, o.y, o.w, o.h, o.rotation, color(theme.decor), image, transform), false))
            break
    }
}
