export abstract class Shape {
    abstract contains(x: number, y: number): boolean

    abstract trace(ctx: CanvasRenderingContext2D): void

    abstract bounds(): { x: number, y: number, w: number, h: number }
}