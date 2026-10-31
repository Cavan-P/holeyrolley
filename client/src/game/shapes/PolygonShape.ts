import { Shape } from './Shape'

// Any shape made of straight edges, given as its corner points in order
export class PolygonShape extends Shape {
    points: [number, number][]

    constructor(points: [number, number][]){
        super()
        this.points = points
    }

    // Ray casting: imagine a line from the point going right forever, and count how many
    // edges it crosses. Odd = inside, even = outside
    contains(x: number, y: number): boolean {
        let inside = false

        for(let i = 0, j = this.points.length - 1; i < this.points.length; j = i++){
            const a = this.points[i]
            const b = this.points[j]
            if(!a || !b) continue

            const [ax, ay] = a
            const [bx, by] = b

            // Does this edge cross the point's height, and is the crossing to the right of it?
            if((ay > y) !== (by > y) && x < ax + (y - ay) * (bx - ax) / (by - ay)){
                inside = !inside
            }
        }

        return inside
    }

    trace(ctx: CanvasRenderingContext2D): void {
        const [first, ...rest] = this.points
        if(!first) return

        ctx.moveTo(first[0], first[1])
        for(const [x, y] of rest) ctx.lineTo(x, y)
        ctx.closePath()
    }

    bounds(): { x: number, y: number, w: number, h: number } {
        const xs = this.points.map(p => p[0])
        const ys = this.points.map(p => p[1])

        const minX = Math.min(...xs)
        const minY = Math.min(...ys)
        return { x: minX, y: minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY }
    }
}
