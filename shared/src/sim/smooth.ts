export function smooth(p: number, d: number, s: number, dt: number): number {
    return (d - p) * (1 - Math.exp(-s * dt))
}