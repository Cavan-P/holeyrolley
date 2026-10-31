export type Point = [number, number]
export type Bounds = { x: number, y: number, w: number, h: number }

export abstract class Shape {
    abstract contains(x: number, y: number): boolean

    abstract trace(ctx: CanvasRenderingContext2D): void

    abstract bounds(): Bounds

    // The shape's edge(s) as closed loops of points. Used for auto rails and editor hit testing
    abstract outline(): Point[][]
}

// Points around part of a circle, from angle a to b (clockwise on screen)
export function arcPoints(cx: number, cy: number, r: number, a: number, b: number, steps: number): Point[] {
    const pts: Point[] = []
    for(let i = 0; i <= steps; i++){
        const t = a + (b - a) * (i / steps)
        pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r])
    }
    return pts
}
