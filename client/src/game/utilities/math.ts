export function map(v: number, a: number, b: number, c: number, d: number): number {
    return c + ((v - a) / (b - a)) * (d - c)
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max))
}
