import { COURSE_VERSION, type CourseData } from '@holey/shared'

const DRAFT_KEY = 'holey-rolley:editor-draft'

export function loadDraft(): CourseData | null {
    try {
        const raw = localStorage.getItem(DRAFT_KEY)
        return raw ? parseCourse(JSON.parse(raw)) : null
    }
    catch {
        return null
    }
}

export function saveDraft(course: CourseData): void {
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(course))
    }
    catch {
        // Full or unavailable. Export still works
    }
}

export function parseCourse(value: unknown): CourseData {
    if(typeof value !== 'object' || value === null) throw new Error('Not a course file')

    const v = value as Partial<CourseData>
    if(v.version !== COURSE_VERSION) throw new Error(`Unsupported course version: ${String(v.version)}`)
    if(!Array.isArray(v.holes)) throw new Error('Course has no holes')

    return {
        version: COURSE_VERSION,
        name: typeof v.name === 'string' ? v.name : 'Untitled course',
        theme: typeof v.theme === 'string' ? v.theme : 'classic',
        holes: v.holes,
        assets: typeof v.assets === 'object' && v.assets !== null ? v.assets : {}
    }
}

export function downloadCourse(course: CourseData): void {
    const blob = new Blob([JSON.stringify(course, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `${course.name.trim().replace(/[^\w-]+/g, '-').toLowerCase() || 'course'}.json`
    a.click()

    URL.revokeObjectURL(url)
}

export async function readCourseFile(file: File): Promise<CourseData> {
    return parseCourse(JSON.parse(await file.text()))
}

export function readImageFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image'))
        reader.onerror = () => reject(reader.error ?? new Error('Could not read image'))
        reader.readAsDataURL(file)
    })
}
