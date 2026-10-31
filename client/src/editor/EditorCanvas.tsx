import { useEffect, useMemo, useRef, useState } from 'react'
import type { CourseObject, HoleData, ShapeType, Vec } from '@holey/shared'
import { Camera } from '../game/classes/Camera'
import { Bridge } from '../game/classes/Bridge'
import { buildHole } from '../game/build'
import { createGrassPattern } from '../game/art/grass'
import { getTheme } from '../game/art/themes'
import { buildShape, objectBounds, wallPath } from '../game/data'
import type { Point } from '../game/shapes/Shape'
import { evaluateMotion } from '../game/utilities/motion'
import type { Editor } from './useEditor'
import {
    type Handle, type ToolId, TOOLS, assetKey, createObject, dragHandle, gestureFor,
    getHandles, insertPoint, moveObject, pickObject, removePoint, snapTo
} from './model'
import { readImageFile } from './storage'

type Props = {
    editor: Editor
    tool: ToolId
    setTool: (t: ToolId) => void
    shapeKind: ShapeType
    grid: number
    preview: boolean
}

type Drag =
    | { type: 'pan', last: Vec }
    | { type: 'move', id: string, start: Vec, original: CourseObject, recorded: boolean }
    | { type: 'handle', id: string, key: string, recorded: boolean }
    | { type: 'marker', which: 'tee' | 'cup', recorded: boolean }
    | { type: 'create', start: Vec, current: Vec }

const SELECT = '#ffd23f'
const HANDLE_PX = 6

export function EditorCanvas({ editor, tool, setTool, shapeKind, grid, preview }: Props){
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const cameraRef = useRef(new Camera(600, 400, 800, 600))
    const dragRef = useRef<Drag | null>(null)
    const mouseRef = useRef<Vec>({ x: 0, y: 0 })
    const spaceRef = useRef(false)
    const [draftPoints, setDraftPoints] = useState<Vec[]>([])
    const [cursor, setCursor] = useState('default')

    const { course, hole, holeIndex, selected } = editor
    const gesture = gestureFor(tool, shapeKind)
    const theme = getTheme(course.theme)

    const built = useMemo(() => buildHole(hole, course, false), [hole, course.theme, course.assets])

    const live = useRef({ built, editor, tool, shapeKind, grid, preview, draftPoints, gesture, theme })
    live.current = { built, editor, tool, shapeKind, grid, preview, draftPoints, gesture, theme }

    const toWorld = (sx: number, sy: number): Vec => cameraRef.current.mouse({ x: sx, y: sy })
    const snap = (p: Vec, free: boolean) => free ? p : snapTo(p, live.current.grid)

    useEffect(() => setDraftPoints([]), [tool, shapeKind])


    const fitView = (h: HoleData) => {
        const cam = cameraRef.current
        const boxes = h.objects.map(objectBounds)
        const xs = [h.tee.x, h.cup.x, ...boxes.flatMap(b => [b.x, b.x + b.w])]
        const ys = [h.tee.y, h.cup.y, ...boxes.flatMap(b => [b.y, b.y + b.h])]
        const minX = Math.min(...xs), maxX = Math.max(...xs)
        const minY = Math.min(...ys), maxY = Math.max(...ys)

        cam.x = (minX + maxX) / 2
        cam.y = (minY + maxY) / 2
        cam.zoom = Math.min(2, Math.max(0.1, Math.min(cam.viewW / (maxX - minX + 200), cam.viewH / (maxY - minY + 200))))
    }

    useEffect(() => fitView(live.current.editor.hole), [holeIndex])

    useEffect(() => {
        const canvas = canvasRef.current
        const box = canvas?.parentElement
        if(!canvas || !box) return

        let fitted = false
        const resize = () => {
            const dpr = window.devicePixelRatio || 1
            canvas.width = box.clientWidth * dpr
            canvas.height = box.clientHeight * dpr
            // The box can still be 0x0 on the first pass, so fit once it has a real size
            cameraRef.current.viewW = box.clientWidth
            cameraRef.current.viewH = box.clientHeight
            if(!fitted && box.clientWidth > 0 && box.clientHeight > 0){
                fitted = true
                fitView(live.current.editor.hole)
            }
        }
        resize()

        const observer = new ResizeObserver(resize)
        observer.observe(box)
        return () => observer.disconnect()
    }, [])


    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if(!canvas || !ctx) return

        let frameId = 0
        let grass = createGrassPattern(ctx, live.current.theme.turf, live.current.theme.turfStripe)
        let grassTheme = live.current.theme
        let previewStart = performance.now()
        let wasPreviewing = false

        const frame = (now: number) => {
            const { built, editor, preview, theme, draftPoints, gesture, tool, shapeKind } = live.current
            const cam = cameraRef.current
            const dpr = window.devicePixelRatio || 1
            const px = 1 / cam.zoom

            if(grassTheme !== theme){
                grass = createGrassPattern(ctx, theme.turf, theme.turfStripe)
                grassTheme = theme
            }

            if(preview && !wasPreviewing) previewStart = now
            wasPreviewing = preview
            built.setTime(preview ? (now - previewStart) / 1000 : 0)

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.fillStyle = theme.scenery
            ctx.fillRect(0, 0, cam.viewW, cam.viewH)

            cam.begin(ctx)
            drawGrid(ctx, cam, live.current.grid)

            built.drawGround(ctx, grass)
            built.draw(ctx)
            drawTee(ctx, editor.hole.tee, px)

            // Selection, hover and handles
            const sel = editor.selected
            const hoverPick = !dragRef.current && tool === 'select' ? pickObject(editor.hole.objects, mouseRef.current, 6 * px) : null
            if(hoverPick && hoverPick.id !== sel?.id) outlineObject(ctx, hoverPick, 'rgba(255, 255, 255, 0.6)', px)

            if(sel){
                if(sel.motion) drawMotionPath(ctx, sel, px, preview ? (now - previewStart) / 1000 : 0)
                outlineObject(ctx, sel, SELECT, px)
                for(const h of getHandles(sel)) drawHandle(ctx, h, px)
            }
            if(editor.selection?.kind === 'tee' || editor.selection?.kind === 'cup'){
                const p = editor.selection.kind === 'tee' ? editor.hole.tee : editor.hole.cup
                ctx.strokeStyle = SELECT
                ctx.lineWidth = 2 * px
                ctx.beginPath()
                ctx.arc(p.x, p.y, 20 * px + 10, 0, Math.PI * 2)
                ctx.stroke()
            }

            const drag = dragRef.current
            if(drag?.type === 'create'){
                const temp = createObject(tool, shapeKind, drag.start, drag.current, [], false)
                if(temp) outlineObject(ctx, temp, '#ffffff', px)
            }
            if(gesture === 'points' && draftPoints.length > 0){
                drawDraftPoints(ctx, draftPoints, mouseRef.current, px)
            }

            cam.end(ctx)
            frameId = requestAnimationFrame(frame)
        }
        frameId = requestAnimationFrame(frame)

        return () => cancelAnimationFrame(frameId)
    }, [])

    const finishPoints = (closed: boolean) => {
        const { tool, shapeKind, draftPoints, editor } = live.current
        const first = draftPoints[0]
        if(first){
            const o = createObject(tool, shapeKind, first, first, draftPoints, closed)
            if(o) editor.addObject(o)
        }
        setDraftPoints([])
    }

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if(!canvas) return
        canvas.setPointerCapture(e.pointerId)

        const rect = canvas.getBoundingClientRect()
        const screen = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        const world = toWorld(screen.x, screen.y)
        const p = snap(world, e.altKey)
        const px = 1 / cameraRef.current.zoom

        if(e.button === 1 || e.button === 2 || spaceRef.current){
            dragRef.current = { type: 'pan', last: screen }
            return
        }

        if(tool === 'select'){
            if(selected){
                const h = getHandles(selected).find(h => Math.hypot(h.x - world.x, h.y - world.y) <= (HANDLE_PX + 3) * px)
                if(h){
                    if(h.kind === 'insert'){
                        editor.beginChange()
                        const [o, key] = insertPoint(selected, Number(h.key.slice(1)), p)
                        editor.updateObject(selected.id, () => o, false)
                        dragRef.current = { type: 'handle', id: selected.id, key, recorded: true }
                    }
                    else if(h.kind === 'point' && e.altKey && h.key.startsWith('p')){
                        editor.updateObject(selected.id, o => removePoint(o, Number(h.key.slice(1))))
                    }
                    else {
                        dragRef.current = { type: 'handle', id: selected.id, key: h.key, recorded: false }
                    }
                    return
                }
            }

            for(const which of ['tee', 'cup'] as const){
                const m = hole[which]
                if(Math.hypot(m.x - world.x, m.y - world.y) <= 16 + 6 * px){
                    editor.setSelection({ kind: which })
                    dragRef.current = { type: 'marker', which, recorded: false }
                    return
                }
            }

            const picked = pickObject(hole.objects, world, 6 * px)
            if(picked){
                editor.setSelection({ kind: 'object', id: picked.id })
                dragRef.current = { type: 'move', id: picked.id, start: world, original: picked, recorded: false }
                return
            }

            editor.setSelection(null)
            dragRef.current = { type: 'pan', last: screen }
            return
        }

        if(gesture === 'drag'){
            dragRef.current = { type: 'create', start: p, current: p }
            return
        }

        if(gesture === 'points'){
            const first = draftPoints[0]
            const isWall = tool === 'wall' || tool === 'curveWall'

            if(e.detail >= 2 && isWall){
                finishPoints(false)
                return
            }

            if(first && draftPoints.length >= (isWall ? 3 : 3) && Math.hypot(first.x - world.x, first.y - world.y) <= 10 * px){
                finishPoints(true)
                return
            }
            if(e.detail < 2) setDraftPoints(pts => [...pts, p])
            return
        }

        if(gesture === 'click'){
            if(tool === 'tee' || tool === 'cup'){
                editor.updateHole(h => ({ ...h, [tool]: p }))
                editor.setSelection({ kind: tool })
            }
            else {
                const o = createObject(tool, shapeKind, p, p, [], false)
                if(o) editor.addObject(o)
            }
        }
    }

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if(!canvas) return

        const rect = canvas.getBoundingClientRect()
        const screen = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        const world = toWorld(screen.x, screen.y)
        mouseRef.current = world
        const p = snap(world, e.altKey)

        const drag = dragRef.current
        if(!drag){
            if(spaceRef.current) setCursor('grab')
            else if(tool !== 'select') setCursor('crosshair')
            else setCursor(pickObject(hole.objects, world, 6 / cameraRef.current.zoom) ? 'move' : 'default')
            return
        }

        if((drag.type === 'move' || drag.type === 'handle' || drag.type === 'marker') && !drag.recorded){
            editor.beginChange()
            drag.recorded = true
        }

        switch(drag.type){
            case 'pan': {
                const cam = cameraRef.current
                cam.x -= (screen.x - drag.last.x) / cam.zoom
                cam.y -= (screen.y - drag.last.y) / cam.zoom
                drag.last = screen
                setCursor('grabbing')
                break
            }
            case 'move': {
                let dx = world.x - drag.start.x
                let dy = world.y - drag.start.y
                if(grid > 0 && !e.altKey){
                    dx = Math.round(dx / grid) * grid
                    dy = Math.round(dy / grid) * grid
                }
                editor.updateObject(drag.id, () => moveObject(drag.original, dx, dy), false)
                break
            }
            case 'handle':
                editor.updateObject(drag.id, o => dragHandle(o, drag.key, p), false)
                break
            case 'marker':
                editor.updateHole(h => ({ ...h, [drag.which]: p }), false)
                break
            case 'create':
                drag.current = p
                break
        }
    }

    const onPointerUp = () => {
        const drag = dragRef.current
        dragRef.current = null

        if(drag?.type === 'create'){
            const o = createObject(tool, shapeKind, drag.start, drag.current, [], false)
            if(o) editor.addObject(o)
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if(!canvas) return

        const onWheel = (e: WheelEvent) => {
            e.preventDefault()
            const cam = cameraRef.current

            if(e.ctrlKey || e.metaKey){
                const rect = canvas.getBoundingClientRect()
                const screen = { x: e.clientX - rect.left, y: e.clientY - rect.top }
                const before = cam.mouse(screen)
                cam.zoom = Math.min(4, Math.max(0.1, cam.zoom * Math.exp(-e.deltaY * 0.01)))
                const after = cam.mouse(screen)
                cam.x += before.x - after.x
                cam.y += before.y - after.y
            }
            else {
                cam.x += e.deltaX / cam.zoom
                cam.y += e.deltaY / cam.zoom
            }
        }

        canvas.addEventListener('wheel', onWheel, { passive: false })
        return () => canvas.removeEventListener('wheel', onWheel)
    }, [])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null
            if(target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return

            const { editor, draftPoints, grid } = live.current
            const mod = e.metaKey || e.ctrlKey

            if(e.key === ' '){
                spaceRef.current = true
                setCursor('grab')
                e.preventDefault()
                return
            }

            if(mod && e.key.toLowerCase() === 'z'){
                e.preventDefault()
                if(e.shiftKey) editor.redo()
                else editor.undo()
                return
            }
            if(mod && e.key.toLowerCase() === 'y'){
                e.preventDefault()
                editor.redo()
                return
            }
            if(mod && e.key.toLowerCase() === 'd'){
                e.preventDefault()
                editor.duplicateSelected()
                return
            }
            if(mod) return

            if(e.key === 'Escape'){
                if(draftPoints.length) setDraftPoints([])
                else if(editor.selection) editor.setSelection(null)
                else setTool('select')
                return
            }
            if(e.key === 'Enter' && draftPoints.length){
                finishPoints(false)
                return
            }
            if(e.key === 'Backspace' || e.key === 'Delete'){
                e.preventDefault()
                if(draftPoints.length) setDraftPoints(pts => pts.slice(0, -1))
                else editor.deleteSelected()
                return
            }
            if(e.key === '0'){
                fitView(editor.hole)
                return
            }

            const arrows: Record<string, Vec> = { ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 } }
            const dir = arrows[e.key]
            if(dir && editor.selected){
                e.preventDefault()
                const step = e.shiftKey ? Math.max(grid, 10) * 4 : Math.max(grid, 1)
                editor.updateObject(editor.selected.id, o => moveObject(o, dir.x * step, dir.y * step))
                return
            }

            const t = TOOLS.find(t => t.key === e.key.toLowerCase())
            if(t) setTool(t.id)
        }

        const onKeyUp = (e: KeyboardEvent) => {
            if(e.key === ' '){
                spaceRef.current = false
                setCursor('default')
            }
        }

        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [setTool])

    const onDrop = async (e: React.DragEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        const file = [...e.dataTransfer.files].find(f => f.type.startsWith('image/'))
        const canvas = canvasRef.current
        if(!file || !canvas) return

        const dataUrl = await readImageFile(file)
        const key = assetKey(dataUrl)
        editor.addAsset(key, dataUrl)

        const rect = canvas.getBoundingClientRect()
        const world = toWorld(e.clientX - rect.left, e.clientY - rect.top)

        const target = pickObject(hole.objects, world, 6 / cameraRef.current.zoom)
        if(target && target.type !== 'fairway'){
            editor.updateObject(target.id, o => ({ ...o, style: { ...o.style, image: key } }))
            editor.setSelection({ kind: 'object', id: target.id })
            return
        }

        const size = await imageSize(dataUrl)
        const scale = 160 / Math.max(size.w, size.h)
        const w = Math.round(size.w * scale)
        const h = Math.round(size.h * scale)
        editor.addObject({
            id: `decor-${key}-${Date.now().toString(36)}`, type: 'decor', layer: 0,
            x: world.x - w / 2, y: world.y - h / 2, w, h, rotation: 0, style: { image: key }
        })
    }

    return (
        <canvas
            ref={canvasRef}
            className='absolute inset-0 w-full h-full block touch-none'
            style={{ cursor }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => { dragRef.current = null }}
            onContextMenu={e => e.preventDefault()}
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
        />
    )
}

function imageSize(src: string): Promise<{ w: number, h: number }> {
    return new Promise(resolve => {
        const img = new Image()
        img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 })
        img.onerror = () => resolve({ w: 1, h: 1 })
        img.src = src
    })
}

function drawGrid(ctx: CanvasRenderingContext2D, cam: Camera, grid: number): void {
    let step = grid > 0 ? grid : 40
    while(step * cam.zoom < 10) step *= 2

    const v = cam.visibleRect()
    const x0 = Math.floor(v.x / step) * step
    const y0 = Math.floor(v.y / step) * step

    ctx.lineWidth = 1 / cam.zoom
    for(const major of [false, true]){
        ctx.strokeStyle = major ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.06)'
        ctx.beginPath()
        for(let x = x0; x < v.x + v.w; x += step){
            if((Math.round(x / step) % 5 === 0) !== major) continue
            ctx.moveTo(x, v.y)
            ctx.lineTo(x, v.y + v.h)
        }
        for(let y = y0; y < v.y + v.h; y += step){
            if((Math.round(y / step) % 5 === 0) !== major) continue
            ctx.moveTo(v.x, y)
            ctx.lineTo(v.x + v.w, y)
        }
        ctx.stroke()
    }
}

function drawTee(ctx: CanvasRenderingContext2D, tee: Vec, px: number): void {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.beginPath()
    ctx.arc(tee.x, tee.y, 16, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#FF0000'
    ctx.beginPath()
    ctx.arc(tee.x, tee.y, 8, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${12 * px}px Nunito, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('TEE', tee.x, tee.y - 20 - 4 * px)
}

function strokePoints(ctx: CanvasRenderingContext2D, pts: Point[], closed: boolean): void {
    const [first, ...rest] = pts
    if(!first) return
    ctx.moveTo(first[0], first[1])
    for(const [x, y] of rest) ctx.lineTo(x, y)
    if(closed) ctx.closePath()
}

function outlineObject(ctx: CanvasRenderingContext2D, o: CourseObject, color: string, px: number): void {
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = 2 * px
    ctx.setLineDash([6 * px, 4 * px])
    ctx.beginPath()

    switch(o.type){
        case 'fairway':
        case 'sand':
        case 'ice':
        case 'water':
        case 'slope':
            for(const loop of buildShape(o.shape).outline()) strokePoints(ctx, loop, true)
            break
        case 'wall':
        case 'curveWall':
            strokePoints(ctx, wallPath(o), o.closed)
            break
        case 'arcWall':
            ctx.arc(o.x, o.y, o.radius, o.start, o.end)
            break
        case 'bumper':
            if(o.a.x === o.b.x && o.a.y === o.b.y) ctx.arc(o.a.x, o.a.y, o.radius + 3, 0, Math.PI * 2)
            else strokePoints(ctx, [[o.a.x, o.a.y], [o.b.x, o.b.y]], false)
            break
        case 'post':
            ctx.arc(o.x, o.y, o.radius + 3, 0, Math.PI * 2)
            break
        case 'bridge':
            for(const loop of new Bridge(o.a.x, o.a.y, o.b.x, o.b.y, o.width, false, '', '').shape.outline()) strokePoints(ctx, loop, true)
            break
        case 'decor': {
            ctx.translate(o.x + o.w / 2, o.y + o.h / 2)
            ctx.rotate(o.rotation)
            ctx.rect(-o.w / 2, -o.h / 2, o.w, o.h)
            break
        }
    }

    ctx.stroke()
    ctx.restore()
}

function drawHandle(ctx: CanvasRenderingContext2D, h: Handle, px: number): void {
    const r = (h.kind === 'insert' ? HANDLE_PX - 2 : HANDLE_PX) * px

    ctx.save()
    ctx.lineWidth = 2 * px
    ctx.strokeStyle = '#1d3319'
    ctx.fillStyle = h.kind === 'insert' ? 'rgba(255, 255, 255, 0.6)' : h.kind === 'pivot' ? '#9b5de5' : h.kind === 'angle' ? '#3a9ad9' : '#ffffff'

    ctx.beginPath()
    if(h.kind === 'size') ctx.rect(h.x - r, h.y - r, r * 2, r * 2)
    else ctx.arc(h.x, h.y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
}

function drawDraftPoints(ctx: CanvasRenderingContext2D, pts: Vec[], mouse: Vec, px: number): void {
    ctx.save()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2 * px
    ctx.setLineDash([6 * px, 4 * px])

    ctx.beginPath()
    strokePoints(ctx, [...pts, mouse].map((p): Point => [p.x, p.y]), false)
    ctx.stroke()

    ctx.setLineDash([])
    pts.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? SELECT : '#ffffff'
        ctx.beginPath()
        ctx.arc(p.x, p.y, (i === 0 ? 7 : 5) * px, 0, Math.PI * 2)
        ctx.fill()
    })
    ctx.restore()
}

function drawMotionPath(ctx: CanvasRenderingContext2D, o: CourseObject, px: number, t: number): void {
    const motion = o.motion
    if(!motion) return

    const keys = [...motion.keys].sort((a, b) => a.t - b.t)
    const pts = keys.map(k => ({ x: motion.pivot.x + k.x, y: motion.pivot.y + k.y, t: k.t }))

    ctx.save()
    ctx.strokeStyle = '#9b5de5'
    ctx.fillStyle = '#9b5de5'
    ctx.lineWidth = 2 * px
    ctx.setLineDash([4 * px, 4 * px])

    ctx.beginPath()
    strokePoints(ctx, pts.map((p): Point => [p.x, p.y]), motion.mode === 'loop')
    ctx.stroke()

    ctx.setLineDash([])
    ctx.font = `bold ${11 * px}px Nunito, sans-serif`
    ctx.textAlign = 'center'
    for(const p of pts){
        ctx.beginPath()
        ctx.arc(p.x, p.y, 4 * px, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillText(`${p.t}s`, p.x, p.y - 8 * px)
    }

    const now = evaluateMotion(motion, t)
    ctx.strokeStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(motion.pivot.x + now.x, motion.pivot.y + now.y, 7 * px, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
}
