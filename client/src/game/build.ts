import { type Cosmetics, type CourseData, type CourseObject, type HoleData, type Part, buildHole as buildSimHole, buildShape, objectBounds } from '@holey/shared'
import { HoleView, type LayerDrawables } from './classes/HoleView'
import { Decor } from './classes/Decor'
import { type Drawable, Faded } from './classes/Drawable'
import { ImageSkin } from './art/images'
import { getTheme, type Theme } from './art/themes'
import { drawCollider, drawSurface } from './draw'

export function buildHole(data: HoleData, course: Pick<CourseData, 'theme' | 'assets'>, player: Cosmetics | null): HoleView {
    const theme = getTheme(course.theme)
    const { hole, parts } = buildSimHole(data, player)

    const drawables: [LayerDrawables, LayerDrawables] = [{ ground: [], solid: [] }, { ground: [], solid: [] }]

    data.objects.forEach((o, i) => {
        const part = parts[i]
        if(part) buildDrawable(o, part, theme, course.assets, drawables)
    })

    return new HoleView(hole, drawables)
}

function buildDrawable(o: CourseObject, part: Part, theme: Theme, assets: Record<string, string>, drawables: [LayerDrawables, LayerDrawables]): void {
    const layer = o.layer === 1 ? 1 : 0
    const draw = drawables[layer]
    const { transform, colliders, surface } = part

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

    const addColliders = (c: string, flash?: string) => {
        draw.solid.push(styled({ display: ctx => { for(const w of colliders) drawCollider(ctx, w, c, flash) } }, false))
    }

    const addSurface = (c: string) => {
        if(surface) draw.ground.push(styled({ display: ctx => drawSurface(ctx, surface, c) }, true))
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
            addSurface(color(theme.ice))
            break
        case 'water':
            addSurface(color(theme.water))
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
            draw.solid.push(styled(new Decor(o.x, o.y, o.w, o.h, o.rotation, color(theme.decor), image, transform), false))
            break
    }
}
