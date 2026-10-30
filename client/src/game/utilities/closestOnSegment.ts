import { clamp } from './math'

export function closestOnSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): [number, number] {
    const abx = bx - ax
    const aby = by - ay

    const lenSq = abx * abx + aby * aby

    const t = lenSq ? clamp(((px - ax) * abx + (py - ay) * aby) / lenSq, 0, 1) : 0

    return [ax + abx * t, ay + aby * t]
}