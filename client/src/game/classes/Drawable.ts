export interface Drawable {
    display(ctx: CanvasRenderingContext2D): void
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
