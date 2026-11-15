import { COURSES, type CourseData } from '@holey/shared'

type Progress = Record<string, Record<string, number> | (number | null)[]>

const KEY = 'holeyrolley:progress'
export const UNLOCK_OVER_PAR = 2

function load(): Progress {
    try {
        const raw = localStorage.getItem(KEY)
        return raw ? JSON.parse(raw) : {}
    }
    catch {
        return {}
    }
}

function byName(courseId: string, saved: Progress[string] | undefined): Record<string, number> {
    if(!saved) return {}
    if(!Array.isArray(saved)) return saved

    const out: Record<string, number> = {}
    const holes = COURSES[courseId]?.holes ?? []
    saved.forEach((s, i) => {
        const name = holes[i]?.name
        if(s != null && name) out[name] = s
    })
    return out
}

export function getBests(courseId: string): (number | null)[] {
    const saved = byName(courseId, load()[courseId])
    return (COURSES[courseId]?.holes ?? []).map(h => saved[h.name] ?? null)
}

export function recordScore(courseId: string, holeIndex: number, strokes: number): void {
    const name = COURSES[courseId]?.holes[holeIndex]?.name
    if(!name) return

    const all = load()
    const bests = byName(courseId, all[courseId])
    const prev = bests[name]

    if(prev != null && prev <= strokes) return

    bests[name] = strokes
    all[courseId] = bests

    try {
        localStorage.setItem(KEY, JSON.stringify(all))
    }
    catch {}
}

export function isUnlocked(course: CourseData, bests: (number | null)[], holeIndex: number): boolean {
    if(holeIndex === 0) return true

    const prevBest = bests[holeIndex - 1]
    const prevPar = course.holes[holeIndex - 1]?.par

    return prevBest != null && prevPar != null && prevBest <= prevPar + UNLOCK_OVER_PAR
}
