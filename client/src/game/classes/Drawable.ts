export interface Drawable {
    display(ctx: CanvasRenderingContext2D): void
}

export class Clipped implements Drawable {
    inner: Drawable
    clip: (ctx: CanvasRenderingContext2D) => void

    constructor(inner: Drawable, clip: (ctx: CanvasRenderingContext2D) => void){
        this.inner = inner
        this.clip = clip
    }

    display(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        ctx.beginPath()
        this.clip(ctx)
        ctx.clip()
        this.inner.display(ctx)
        ctx.restore()
    }
}

export class Faded implements Drawable {
    inner: Drawable
    opacity: number

    constructor(inner: Drawable, opacity: number){
        this.inner = inner
        this.opacity = opacity
    }

    display(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        ctx.globalAlpha *= this.opacity
        this.inner.display(ctx)
        ctx.restore()
    }
}
