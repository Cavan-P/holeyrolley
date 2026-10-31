import type { Point } from '../shapes/Shape'

export function smoothPoints(points: Point[], closed: boolean, stepsPerSegment: number = 12): Point[] {
    const n = points.length
    if(n < 3) return points.map(([x, y]): Point => [x, y])

    const at = (i: number): Point => {
        const index = closed ? ((i % n) + n) % n : Math.max(0, Math.min(n - 1, i))
        return points[index] ?? [0, 0]
    }

    const out: Point[] = []
    const segments = closed ? n : n - 1

    for(let s = 0; s < segments; s++){
        const [p0, p1, p2, p3] = [at(s - 1), at(s), at(s + 1), at(s + 2)]

        for(let i = 0; i < stepsPerSegment; i++){
            const t = i / stepsPerSegment
            const t2 = t * t
            const t3 = t2 * t

            out.push([
                0.5 * (2 * p1[0] + (p2[0] - p0[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (3 * p1[0] - p0[0] - 3 * p2[0] + p3[0]) * t3),
                0.5 * (2 * p1[1] + (p2[1] - p0[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (3 * p1[1] - p0[1] - 3 * p2[1] + p3[1]) * t3)
            ])
        }
    }

    if(!closed){
        const last = points[n - 1]
        if(last) out.push([last[0], last[1]])
    }

    return out
}

export function signedArea(points: Point[]): number {
    let sum = 0
    for(let i = 0; i < points.length; i++){
        const a = points[i]
        const b = points[(i + 1) % points.length]
        if(!a || !b) continue
        sum += a[0] * b[1] - b[0] * a[1]
    }
    return sum / 2
}
