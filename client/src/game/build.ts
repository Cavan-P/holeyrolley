import { type Cosmetics, type CourseData, type Skin, type CourseObject, type HoleData, type Part, buildHole as buildSimHole, buildShape, objectBounds } from '@holey/shared'
import { HoleView, type LayerDrawables } from './classes/HoleView'
import { Decor } from './classes/Decor'
import { type Drawable, Clipped, Faded } from './classes/Drawable'
import { ImageSkin } from './art/images'
import { getTheme, type Theme } from './art/themes'
import { applyTransform, drawCollider, drawSurface, traceShape } from './draw'
import { drawConveyor, drawPortal, drawSpring } from './art/special'
import { drawDecorSkin, drawSkinnedCollider, drawSurf } from './art/beach'
import { drawFaller, drawLava, drawMagnet, drawZeroG } from './art/worlds'

export function buildHole(data: HoleData, course: Pick<CourseData, 'theme' | 'assets'>, player: Cosmetics | null): HoleView {
    const theme = getTheme(course.theme)
    const { hole, parts } = buildSimHole(data, player)

    const drawables: [LayerDrawables, LayerDrawables] = [{ ground: [], solid: [] }, { ground: [], solid: [] }]

    const fairways = hole.fairways.map(f => f.shape)
    const clip = (ctx: CanvasRenderingContext2D) => { for(const f of fairways) traceShape(ctx, f) }

    data.objects.forEach((o, i) => {
        const part = parts[i]
        if(part) buildDrawable(o, part, theme, course.assets, drawables, clip)
    })

    return new HoleView(hole, drawables)
}

const SKIN_COLORS: Partial<Record<Skin, string>> = {
    rock: '#a39a8c',
    crab: '#e8553f',
    asteroid: '#7d7a8c',
    basalt: '#3b3230',
    fence: '#2a2230',
    candycane: '#e8304a',
    gear: '#b08a3a',
    girder: '#c9772a',
    neon: '#ff4fd8'
}

function buildDrawable(o: CourseObject, part: Part, theme: Theme, assets: Record<string, string>, drawables: [LayerDrawables, LayerDrawables], clip: (ctx: CanvasRenderingContext2D) => void): void {
    const layer = o.layer === 1 ? 1 : 0
    const draw = drawables[layer]
    const { transform, colliders, surface, magnet, faller, portal } = part

    const color = (fallback: string) => o.style?.color ?? fallback
    const skin = o.style?.skin
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

    const addColliders = (c: string, flash?: string) => {
        if(skin){
            const sc = color(SKIN_COLORS[skin] ?? c)
            draw.solid.push(styled({ display: ctx => { for(const w of colliders) drawSkinnedCollider(ctx, w, skin, sc, flash ?? sc) } }, false))
            return
        }
        draw.solid.push(styled({ display: ctx => { for(const w of colliders) drawCollider(ctx, w, c, flash) } }, false))
    }

    const area = (d: Drawable) => draw.ground.push(layer === 0 ? new Clipped(d, clip) : d)

    const addSurface = (c: string) => {
        if(surface) area(styled({ display: ctx => drawSurface(ctx, surface, c) }, true))
    }

    switch(o.type){
        case 'fairway':
            if(o.rails){
                drawables[0].solid.push({ display: ctx => { for(const r of colliders) drawCollider(ctx, r, theme.rail) } })
            }
            break

        case 'sand':
            addSurface(color(theme.sand))
            break
        case 'ice':
            if(skin === 'zerog' && surface){
                const c = color(theme.ice)
                area({ display: ctx => drawZeroG(ctx, surface, c) })
            }
            else addSurface(color(theme.ice))
            break
        case 'lava':
            if(surface){
                const c = color(theme.lava)
                area(styled({ display: ctx => drawLava(ctx, surface, c) }, true))
            }
            break
        case 'spring':
            if(surface){
                const c = color(theme.spring)
                area(styled({ display: ctx => drawSpring(ctx, surface, c) }, true))
            }
            break
        case 'conveyor':
            if(surface){
                const c = color(theme.conveyor)
                area(styled({ display: ctx => drawConveyor(ctx, surface, c) }, true))
            }
            break
        case 'portal':
            if(portal){
                const c = color(theme.portal)
                draw.ground.push({ display: ctx => drawPortal(ctx, portal, c) })
            }
            break
        case 'magnet':
            if(magnet){
                const c = color(theme.magnet)
                draw.ground.push({ display: ctx => drawMagnet(ctx, magnet, c, skin) })
            }
            break
        case 'faller':
            if(faller) draw.solid.push({ display: ctx => drawFaller(ctx, faller, skin) })
            break
        case 'water':
            if(skin === 'ocean' && surface){
                const c = color(theme.water)
                draw.ground.push({ display: ctx => { drawSurface(ctx, surface, c); drawSurf(ctx, surface) } })
            }
            else addSurface(color(theme.water))
            break
        case 'slope':
            addSurface(color(theme.slope))
            break

        case 'wall':
        case 'curveWall':
        case 'arcWall':
        case 'post':
            addColliders(color(theme.rail))
            break

        case 'bumper':
            addColliders(color(theme.bumper), theme.bumperFlash)
            break

        case 'bridge': {
            const c = color(theme.bridge)
            if(surface) drawables[1].ground.push(styled({ display: ctx => drawSurface(ctx, surface, c) }, true))
            drawables[1].solid.push({ display: ctx => { for(const r of colliders) drawCollider(ctx, r, theme.bridgeRail) } })
            break
        }

        case 'decor':
            if(skin){
                const c = color('#ff6b6b')
                draw.solid.push({ display: ctx => {
                    ctx.save()
                    if(transform) applyTransform(ctx, transform)
                    ctx.translate(o.x + o.w / 2, o.y + o.h / 2)
                    ctx.rotate(o.rotation)
                    drawDecorSkin(ctx, skin, o.w, o.h, c)
                    ctx.restore()
                } })
                break
            }
            draw.solid.push(styled(new Decor(o.x, o.y, o.w, o.h, o.rotation, color(theme.decor), image, transform), false))
            break
    }
}
