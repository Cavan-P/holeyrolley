import { useCallback, useEffect, useRef, useState } from 'react'
import type { CourseData, CourseObject, HoleData } from '@holey/shared'
import { defaultCourse } from '../game/courses/defaultCourse'
import { loadDraft, saveDraft } from './storage'
import { moveObject, newHole, newId } from './model'

export type Selection = { kind: 'object', id: string } | { kind: 'tee' } | { kind: 'cup' } | null

const HISTORY_LIMIT = 100

export function useEditor(){
    const [course, setCourseState] = useState<CourseData>(() => loadDraft() ?? structuredClone(defaultCourse))
    const [holeIndex, setHoleIndexState] = useState(0)
    const [selection, setSelection] = useState<Selection>(null)
    const [historySize, setHistorySize] = useState({ past: 0, future: 0 })

    const courseRef = useRef(course)
    courseRef.current = course

    const past = useRef<CourseData[]>([])
    const future = useRef<CourseData[]>([])

    const syncHistory = () => setHistorySize({ past: past.current.length, future: future.current.length })

    const beginChange = useCallback(() => {
        past.current.push(courseRef.current)
        if(past.current.length > HISTORY_LIMIT) past.current.shift()
        future.current = []
        syncHistory()
    }, [])

    const setCourse = useCallback((change: (c: CourseData) => CourseData, record: boolean = true) => {
        if(record) beginChange()
        const next = change(courseRef.current)
        courseRef.current = next
        setCourseState(next)
    }, [beginChange])

    const undo = useCallback(() => {
        const prev = past.current.pop()
        if(!prev) return
        future.current.push(courseRef.current)
        courseRef.current = prev
        setCourseState(prev)
        syncHistory()
    }, [])

    const redo = useCallback(() => {
        const next = future.current.pop()
        if(!next) return
        past.current.push(courseRef.current)
        courseRef.current = next
        setCourseState(next)
        syncHistory()
    }, [])

    useEffect(() => {
        const id = setTimeout(() => saveDraft(course), 300)
        return () => clearTimeout(id)
    }, [course])

    const index = Math.min(holeIndex, course.holes.length - 1)
    const hole = course.holes[index] ?? newHole(1)

    const setHoleIndex = useCallback((i: number) => {
        setHoleIndexState(i)
        setSelection(null)
    }, [])

    const updateHole = useCallback((change: (h: HoleData) => HoleData, record: boolean = true) => {
        setCourse(c => ({ ...c, holes: c.holes.map((h, i) => i === index ? change(h) : h) }), record)
    }, [setCourse, index])

    const updateObject = useCallback((id: string, change: (o: CourseObject) => CourseObject, record: boolean = true) => {
        updateHole(h => ({ ...h, objects: h.objects.map(o => o.id === id ? change(o) : o) }), record)
    }, [updateHole])

    const addObject = useCallback((o: CourseObject) => {
        updateHole(h => ({ ...h, objects: [...h.objects, o] }))
        setSelection({ kind: 'object', id: o.id })
    }, [updateHole])

    const selected = selection?.kind === 'object' ? hole.objects.find(o => o.id === selection.id) ?? null : null

    const deleteSelected = useCallback(() => {
        if(selection?.kind !== 'object') return
        updateHole(h => ({ ...h, objects: h.objects.filter(o => o.id !== selection.id) }))
        setSelection(null)
    }, [selection, updateHole])

    const duplicateSelected = useCallback(() => {
        if(!selected) return
        const copy = { ...moveObject(structuredClone(selected), 40, 40), id: newId(selected.type) }
        addObject(copy)
    }, [selected, addObject])

    const reorder = useCallback((id: string, to: 'back' | 'backward' | 'forward' | 'front') => {
        updateHole(h => {
            const objects = [...h.objects]
            const i = objects.findIndex(o => o.id === id)
            const [o] = objects.splice(i, 1)
            if(!o) return h

            const target = to === 'back' ? 0
                : to === 'front' ? objects.length
                : to === 'backward' ? Math.max(0, i - 1)
                : Math.min(objects.length, i + 1)

            objects.splice(target, 0, o)
            return { ...h, objects }
        })
    }, [updateHole])

    const addHole = useCallback(() => {
        setCourse(c => ({ ...c, holes: [...c.holes, newHole(c.holes.length + 1)] }))
        setHoleIndex(courseRef.current.holes.length - 1)
    }, [setCourse, setHoleIndex])

    const duplicateHole = useCallback(() => {
        setCourse(c => {
            const copy = structuredClone(c.holes[index] ?? newHole(1))
            copy.name = `${copy.name} copy`
            copy.objects = copy.objects.map(o => ({ ...o, id: newId(o.type) }))
            const holes = [...c.holes]
            holes.splice(index + 1, 0, copy)
            return { ...c, holes }
        })
        setHoleIndex(index + 1)
    }, [setCourse, setHoleIndex, index])

    const deleteHole = useCallback(() => {
        if(courseRef.current.holes.length <= 1) return
        setCourse(c => ({ ...c, holes: c.holes.filter((_, i) => i !== index) }))
        setHoleIndex(Math.max(0, index - 1))
    }, [setCourse, setHoleIndex, index])

    const moveHole = useCallback((dir: -1 | 1) => {
        const target = index + dir
        if(target < 0 || target >= courseRef.current.holes.length) return
        setCourse(c => {
            const holes = [...c.holes]
            const [h] = holes.splice(index, 1)
            if(h) holes.splice(target, 0, h)
            return { ...c, holes }
        })
        setHoleIndex(target)
    }, [setCourse, setHoleIndex, index])

    const addAsset = useCallback((key: string, dataUrl: string) => {
        setCourse(c => c.assets[key] ? c : { ...c, assets: { ...c.assets, [key]: dataUrl } }, false)
    }, [setCourse])

    const replaceCourse = useCallback((next: CourseData) => {
        setCourse(() => next)
        setHoleIndex(0)
    }, [setCourse, setHoleIndex])

    return {
        course, hole, holeIndex: index, selection, selected,
        canUndo: historySize.past > 0, canRedo: historySize.future > 0,
        setSelection, setHoleIndex,
        beginChange, setCourse, updateHole, updateObject, addObject,
        deleteSelected, duplicateSelected, reorder,
        addHole, duplicateHole, deleteHole, moveHole,
        addAsset, replaceCourse,
        undo, redo
    }
}

export type Editor = ReturnType<typeof useEditor>
