import type { Bounds, Shape } from '../shapes/Shape'
import type { Transform } from '../classes/Transform'
import type { Drawable } from '../classes/Drawable'

const cache = new Map<string, HTMLImageElement>()

// Starts loading the image the first time it's asked for. Returns null until it's ready
export function getImage(src: string): HTMLImageElement | null {
    let img = cache.get(src)
    if(!img){
        img = new Image()
        img.src = src
        cache.set(src, img)
    }
    return img.complete && img.naturalWidth > 0 ? img : null
}

// cover: fills the bounds, cropping the image. contain: fits inside, keeping its proportions
export function drawImageIn(ctx: CanvasRenderingContext2D, img: HTMLImageElement, b: Bounds, mode: 'cover' | 'contain'): void {
    const scale = mode === 'cover'
        ? Math.max(b.w / img.naturalWidth, b.h / img.naturalHeight)
        : Math.min(b.w / img.naturalWidth, b.h / img.naturalHeight)

    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    ctx.drawImage(img, b.x + (b.w - w) / 2, b.y + (b.h - h) / 2, w, h)
}

// Draws an image in place of an object's normal look. Surfaces get the image cropped
// to their shape; everything else gets it fitted into the object's box
export class ImageSkin implements Drawable {
    src: string
    bounds: Bounds
    transform: Transform | null
    clip: Shape | null
    fallback: Drawable

    constructor(src: string, bounds: Bounds, transform: Transform | null, clip: Shape | null, fallback: Drawable){
        this.src = src
        this.bounds = bounds
        this.transform = transform
        this.clip = clip
        this.fallback = fallback
    }

    display(ctx: CanvasRenderingContext2D): void {
        const img = getImage(this.src)
        if(!img){
            this.fallback.display(ctx)
            return
        }

        ctx.save()
        this.transform?.apply(ctx)

        if(this.clip){
            ctx.beginPath()
            this.clip.trace(ctx)
            ctx.clip()
        }

        drawImageIn(ctx, img, this.bounds, this.clip ? 'cover' : 'contain')
        ctx.restore()
    }
}
