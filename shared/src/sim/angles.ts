const TAU = Math.PI * 2

// Wraps any angle into 0..2π
export function normalizeAngle(a: number): number {
    return ((a % TAU) + TAU) % TAU
}

// Is `angle` inside the arc that sweeps clockwise (on screen) from `start` to `end`?
export function angleInArc(angle: number, start: number, end: number): boolean {
    const sweep = normalizeAngle(end - start)
    return normalizeAngle(angle - start) <= sweep
}
