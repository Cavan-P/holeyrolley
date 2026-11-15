import type { CourseData } from '@holey/shared'

type Progress = Record<string, (number | null)[]>

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

export function getBests(courseId: string): (number | null)[] {
    return load()[courseId] ?? []
}

export function recordScore(courseId: string, holeIndex: number, strokes: number): void {
    const all = load()
    const bests = all[courseId] ?? []
    const prev = bests[holeIndex]

    if(prev != null && prev <= strokes) return

    for(let i = bests.length; i < holeIndex; i++) bests[i] = null
    bests[holeIndex] = strokes
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
