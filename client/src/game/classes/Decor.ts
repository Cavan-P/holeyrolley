import type { Drawable } from './Drawable'
import type { Transform } from '@holey/shared'
import { getImage, drawImageIn } from '../art/images'
import { applyTransform } from '../draw'

export class Decor implements Drawable {
    x: number
    y: number
    w: number
    h: number
    rotation: number

    color: string
    image: string | null
    transform: Transform | null

    constructor(x: number, y: number, w: number, h: number, rotation: number, color: string, image: string | null, transform: Transform | null){
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.rotation = rotation

        this.color = color
        this.image = image
        this.transform = transform
    }

    display(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        if(this.transform) applyTransform(ctx, this.transform)

        ctx.translate(this.x + this.w / 2, this.y + this.h / 2)
        ctx.rotate(this.rotation)
        const box = { x: -this.w / 2, y: -this.h / 2, w: this.w, h: this.h }

        const img = this.image ? getImage(this.image) : null
        if(img){
            drawImageIn(ctx, img, box, 'contain')
        }
        else {
            ctx.fillStyle = this.color
            ctx.beginPath()
            ctx.roundRect(box.x, box.y, box.w, box.h, Math.min(box.w, box.h) * 0.2)
            ctx.fill()
        }

        ctx.restore()
    }
}
