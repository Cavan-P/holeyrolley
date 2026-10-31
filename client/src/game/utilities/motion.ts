import type { MotionPath } from '@holey/shared'

export function evaluateMotion(path: MotionPath, t: number): { x: number, y: number, angle: number } {
    const keys = [...path.keys].sort((a, b) => a.t - b.t)
    const first = keys[0]
    const last = keys[keys.length - 1]
    if(!first || !last) return { x: 0, y: 0, angle: 0 }
    if(keys.length === 1 || last.t <= 0) return { x: first.x, y: first.y, angle: first.angle }

    const length = last.t
    let local: number
    if(path.mode === 'loop'){
        local = t % length
    }
    else {
        const cycle = t % (length * 2)
        local = cycle <= length ? cycle : length * 2 - cycle
    }

    for(let i = 1; i < keys.length; i++){
        const a = keys[i - 1]
        const b = keys[i]
        if(!a || !b || local > b.t) continue

        const span = b.t - a.t
        let k = span > 0 ? Math.max(0, (local - a.t) / span) : 1
        if(b.ease === 'smooth') k = k * k * (3 - 2 * k)

        return {
            x: a.x + (b.x - a.x) * k,
            y: a.y + (b.y - a.y) * k,
            angle: a.angle + (b.angle - a.angle) * k
        }
    }

    return { x: last.x, y: last.y, angle: last.angle }
}
