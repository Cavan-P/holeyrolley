import { useRef } from 'react'
import type { CourseObject, Keyframe, MotionPath, ObjectType, ShapeData, Style } from '@holey/shared'
import { PALETTE, THEMES, getTheme, type Theme } from '../game/art/themes'
import type { Editor } from './useEditor'
import { TYPE_LABELS, assetKey, canMove, defaultMotion } from './model'
import { readImageFile } from './storage'
import { NumberField, Row, Section, SmallButton, Toggle, inputClass, toDeg, toRad } from './fields'

export function Inspector({ editor }: { editor: Editor }){
    const { selection, selected, hole, course } = editor
    const theme = getTheme(course.theme)

    if(selection?.kind === 'tee' || selection?.kind === 'cup'){
        const which = selection.kind
        const p = hole[which]
        const set = (key: 'x' | 'y') => (v: number) => editor.updateHole(h => ({ ...h, [which]: { ...h[which], [key]: v } }), false)

        return (
            <Section title={which === 'tee' ? 'Tee' : 'Cup'}>
                <NumberField label='X' value={p.x} onChange={set('x')} onStart={editor.beginChange} />
                <NumberField label='Y' value={p.y} onChange={set('y')} onStart={editor.beginChange} />
            </Section>
        )
    }

    if(!selected) return <NothingSelected editor={editor} />

    return <ObjectPanel editor={editor} o={selected} theme={theme} />
}

function NothingSelected({ editor }: { editor: Editor }){
    const { course, hole } = editor

    return (
        <>
            <Section title='Course'>
                <Row label='Name'>
                    <input className={inputClass} value={course.name} onFocus={editor.beginChange} onChange={e => editor.setCourse(c => ({ ...c, name: e.target.value }), false)} />
                </Row>
                <Row label='Theme'>
                    <select className={inputClass} value={course.theme} onChange={e => editor.setCourse(c => ({ ...c, theme: e.target.value }))}>
                        {Object.entries(THEMES).map(([key, t]) => <option key={key} value={key}>{t.label}</option>)}
                    </select>
                </Row>
            </Section>

            <Section title='Hole'>
                <Row label='Name'>
                    <input className={inputClass} value={hole.name} onFocus={editor.beginChange} onChange={e => editor.updateHole(h => ({ ...h, name: e.target.value }), false)} />
                </Row>
                <NumberField label='Par' value={hole.par} min={1} max={12} onStart={editor.beginChange} onChange={v => editor.updateHole(h => ({ ...h, par: Math.round(v) }), false)} />
            </Section>

            <Section title='Shortcuts'>
                <ul className='flex flex-col gap-1 text-xs text-sub'>
                    <li><b className='text-ink'>Drag empty space</b> or <b className='text-ink'>scroll</b> to pan</li>
                    <li><b className='text-ink'>Pinch / ⌘ + scroll</b> to zoom · <b className='text-ink'>0</b> fits the hole</li>
                    <li><b className='text-ink'>Click points</b>, then click the first point or press <b className='text-ink'>Enter</b></li>
                    <li><b className='text-ink'>Drag a +</b> to add a point · <b className='text-ink'>Alt-click</b> a point to remove it</li>
                    <li><b className='text-ink'>Alt</b> while dragging ignores the grid</li>
                    <li><b className='text-ink'>⌘Z / ⇧⌘Z</b> undo / redo · <b className='text-ink'>⌘D</b> duplicate</li>
                    <li><b className='text-ink'>Drop an image</b> on an object to skin it, or on empty space for decor</li>
                </ul>
            </Section>
        </>
    )
}

const THEME_COLOR: Record<ObjectType, keyof Theme> = {
    fairway: 'turf', sand: 'sand', ice: 'ice', water: 'water', slope: 'slope',
    wall: 'rail', curveWall: 'rail', arcWall: 'rail', bumper: 'bumper', post: 'rail', bridge: 'bridge', decor: 'decor'
}

function ObjectPanel({ editor, o, theme }: { editor: Editor, o: CourseObject, theme: Theme }){
    const set = (change: (o: CourseObject) => CourseObject) => editor.updateObject(o.id, change, false)
    const commit = (change: (o: CourseObject) => CourseObject) => editor.updateObject(o.id, change)
    const start = editor.beginChange

    const num = (label: string, value: number, apply: (v: number) => CourseObject, extra: { step?: number, min?: number, max?: number, suffix?: string } = {}) =>
        <NumberField label={label} value={value} onStart={start} onChange={v => set(() => apply(v))} {...extra} />

    return (
        <>
            <Section title={TYPE_LABELS[o.type]}>
                <div className='flex flex-wrap gap-1'>
                    <SmallButton onClick={editor.duplicateSelected} title='⌘D'>Duplicate</SmallButton>
                    <SmallButton onClick={editor.deleteSelected} title='Delete'>Delete</SmallButton>
                </div>
                <Row label='Order'>
                    <div className='flex flex-wrap gap-1'>
                        <SmallButton onClick={() => editor.reorder(o.id, 'back')} title='Send to back'>⇤</SmallButton>
                        <SmallButton onClick={() => editor.reorder(o.id, 'backward')} title='Send backward'>←</SmallButton>
                        <SmallButton onClick={() => editor.reorder(o.id, 'forward')} title='Bring forward'>→</SmallButton>
                        <SmallButton onClick={() => editor.reorder(o.id, 'front')} title='Bring to front'>⇥</SmallButton>
                    </div>
                </Row>
                {o.type !== 'fairway' && o.type !== 'bridge' && (
                    <Row label='Layer'>
                        <select className={inputClass} value={o.layer} onChange={e => commit(x => ({ ...x, layer: e.target.value === '1' ? 1 : 0 }))}>
                            <option value={0}>Ground</option>
                            <option value={1}>Raised (on a bridge)</option>
                        </select>
                    </Row>
                )}
            </Section>

            <Section title='Settings'>
                {'shape' in o && <ShapeFields shape={o.shape} onStart={start} onChange={shape => set(x => ({ ...x, shape } as CourseObject))} onCommit={shape => commit(x => ({ ...x, shape } as CourseObject))} />}

                {o.type === 'fairway' && <Toggle label='Rails around the edge' checked={o.rails} onChange={rails => commit(x => ({ ...x, rails }))} />}

                {o.type === 'slope' && (() => {
                    const angle = toDeg(Math.atan2(o.push.y, o.push.x))
                    const strength = Math.hypot(o.push.x, o.push.y)
                    const push = (a: number, s: number) => ({ ...o, push: { x: Math.cos(toRad(a)) * s, y: Math.sin(toRad(a)) * s } })
                    return (
                        <>
                            {num('Direction', angle, a => push(a, strength), { suffix: '°' })}
                            {num('Strength', strength, s => push(angle, s), { min: 0, step: 10 })}
                        </>
                    )
                })()}

                {(o.type === 'wall' || o.type === 'curveWall') && (
                    <>
                        {num('Thickness', o.thickness, v => ({ ...o, thickness: v }), { min: 1, max: 60 })}
                        {num('Bounce', o.bounce, v => ({ ...o, bounce: v }), { min: 0, max: 1.5, step: 0.05 })}
                        <Toggle label='Closed loop' checked={o.closed} onChange={closed => commit(x => ({ ...x, closed } as CourseObject))} />
                        <Toggle label='Smooth curve' checked={o.type === 'curveWall'} onChange={smooth => commit(x => ({ ...x, type: smooth ? 'curveWall' : 'wall' } as CourseObject))} />
                    </>
                )}

                {o.type === 'arcWall' && (
                    <>
                        {num('X', o.x, v => ({ ...o, x: v }))}
                        {num('Y', o.y, v => ({ ...o, y: v }))}
                        {num('Radius', o.radius, v => ({ ...o, radius: v }), { min: 4 })}
                        {num('Start', toDeg(o.start), v => ({ ...o, start: toRad(v) }), { suffix: '°' })}
                        {num('End', toDeg(o.end), v => ({ ...o, end: toRad(v) }), { suffix: '°' })}
                        {num('Thickness', o.thickness, v => ({ ...o, thickness: v }), { min: 1, max: 60 })}
                        {num('Bounce', o.bounce, v => ({ ...o, bounce: v }), { min: 0, max: 1.5, step: 0.05 })}
                    </>
                )}

                {o.type === 'bumper' && (
                    <>
                        {num('Radius', o.radius, v => ({ ...o, radius: v }), { min: 2, max: 80 })}
                        {num('Kick', o.kick, v => ({ ...o, kick: v }), { min: 0, max: 900, step: 20 })}
                    </>
                )}

                {o.type === 'post' && (
                    <>
                        {num('Radius', o.radius, v => ({ ...o, radius: v }), { min: 2, max: 80 })}
                        {num('Bounce', o.bounce, v => ({ ...o, bounce: v }), { min: 0, max: 1.5, step: 0.05 })}
                    </>
                )}

                {o.type === 'bridge' && (
                    <>
                        {num('Width', o.width, v => ({ ...o, width: v }), { min: 30, max: 300 })}
                        <Toggle label='Side rails' checked={o.rails} onChange={rails => commit(x => ({ ...x, rails }))} />
                        <p className='text-xs text-sub'>Balls get on from either end. Anything crossing sideways rolls underneath.</p>
                    </>
                )}

                {o.type === 'decor' && (
                    <>
                        {num('X', o.x, v => ({ ...o, x: v }))}
                        {num('Y', o.y, v => ({ ...o, y: v }))}
                        {num('Width', o.w, v => ({ ...o, w: v }), { min: 4 })}
                        {num('Height', o.h, v => ({ ...o, h: v }), { min: 4 })}
                        {num('Rotation', toDeg(o.rotation), v => ({ ...o, rotation: toRad(v) }), { suffix: '°' })}
                    </>
                )}
            </Section>

            <StyleSection editor={editor} o={o} fallback={theme[THEME_COLOR[o.type]]} />

            {canMove(o.type) && <MotionSection editor={editor} o={o} />}
        </>
    )
}

function ShapeFields({ shape, onChange, onCommit, onStart }: { shape: ShapeData, onChange: (s: ShapeData) => void, onCommit: (s: ShapeData) => void, onStart: () => void }){
    const num = (label: string, value: number, apply: (v: number) => ShapeData, extra: { min?: number, suffix?: string } = {}) =>
        <NumberField label={label} value={value} onStart={onStart} onChange={v => onChange(apply(v))} {...extra} />

    switch(shape.type){
        case 'rect':
            return (
                <>
                    {num('X', shape.x, v => ({ ...shape, x: v }))}
                    {num('Y', shape.y, v => ({ ...shape, y: v }))}
                    {num('Width', shape.w, v => ({ ...shape, w: v }), { min: 4 })}
                    {num('Height', shape.h, v => ({ ...shape, h: v }), { min: 4 })}
                    {num('Corners', shape.radius, v => ({ ...shape, radius: v }), { min: 0 })}
                </>
            )
        case 'circle':
            return (
                <>
                    {num('X', shape.x, v => ({ ...shape, x: v }))}
                    {num('Y', shape.y, v => ({ ...shape, y: v }))}
                    {num('Radius', shape.r, v => ({ ...shape, r: v }), { min: 2 })}
                </>
            )
        case 'donut':
            return (
                <>
                    {num('X', shape.x, v => ({ ...shape, x: v }))}
                    {num('Y', shape.y, v => ({ ...shape, y: v }))}
                    {num('Inner', shape.inner, v => ({ ...shape, inner: v }), { min: 1 })}
                    {num('Outer', shape.outer, v => ({ ...shape, outer: v }), { min: 2 })}
                </>
            )
        case 'arc':
            return (
                <>
                    {num('X', shape.x, v => ({ ...shape, x: v }))}
                    {num('Y', shape.y, v => ({ ...shape, y: v }))}
                    {num('Inner', shape.inner, v => ({ ...shape, inner: v }), { min: 0 })}
                    {num('Outer', shape.outer, v => ({ ...shape, outer: v }), { min: 2 })}
                    {num('Start', toDeg(shape.start), v => ({ ...shape, start: toRad(v) }), { suffix: '°' })}
                    {num('End', toDeg(shape.end), v => ({ ...shape, end: toRad(v) }), { suffix: '°' })}
                </>
            )
        case 'polygon':
        case 'curve':
            return (
                <>
                    <p className='text-xs text-sub'>{shape.points.length} points. Drag them on the canvas.</p>
                    <Toggle label='Smooth curve' checked={shape.type === 'curve'} onChange={smooth => onCommit({ ...shape, type: smooth ? 'curve' : 'polygon' })} />
                </>
            )
    }
}

function StyleSection({ editor, o, fallback }: { editor: Editor, o: CourseObject, fallback: string }){
    const fileRef = useRef<HTMLInputElement>(null)
    const style = o.style ?? {}
    const image = style.image ? editor.course.assets[style.image] : undefined

    const setStyle = (change: Partial<Style>, record: boolean = true) => {
        editor.updateObject(o.id, x => {
            const next: Style = { ...x.style, ...change }
            for(const k of Object.keys(next) as (keyof Style)[]) if(next[k] === undefined) delete next[k]
            const { style: _old, ...rest } = x
            return (Object.keys(next).length ? { ...rest, style: next } : rest) as CourseObject
        }, record)
    }

    const upload = async (file: File | undefined) => {
        if(!file) return
        const url = await readImageFile(file)
        const key = assetKey(url)
        editor.addAsset(key, url)
        setStyle({ image: key })
    }

    const current = style.color ?? fallback

    return (
        <Section title='Look'>
            <div className='flex flex-wrap items-center gap-1.5'>
                <button
                    type='button'
                    title='Theme default'
                    onClick={() => setStyle({ color: undefined })}
                    className={`h-6 rounded-md px-2 text-[11px] font-bold ${style.color ? 'bg-ink/5 text-ink' : 'bg-putt text-putt-ink'}`}
                >
                    Theme
                </button>
                {PALETTE.map(c => (
                    <button
                        key={c}
                        type='button'
                        title={c}
                        onClick={() => setStyle({ color: c })}
                        className={`size-6 rounded-md border ${style.color === c ? 'border-ink ring-2 ring-putt' : 'border-ink/20'}`}
                        style={{ background: c }}
                    />
                ))}
                <label className='relative size-6 cursor-pointer overflow-hidden rounded-md border border-ink/20' title='Any color' style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}>
                    <input
                        type='color'
                        className='absolute inset-0 opacity-0'
                        value={/^#[0-9a-f]{6}$/i.test(current) ? current : '#ffffff'}
                        onPointerDown={editor.beginChange}
                        onChange={e => setStyle({ color: e.target.value }, false)}
                    />
                </label>
            </div>

            <Row label='Opacity'>
                <input
                    type='range' min={0.1} max={1} step={0.05}
                    className='accent-putt'
                    value={style.opacity ?? 1}
                    onPointerDown={editor.beginChange}
                    onChange={e => setStyle({ opacity: Number(e.target.value) >= 1 ? undefined : Number(e.target.value) }, false)}
                />
            </Row>

            {o.type !== 'fairway' && (
                <Row label='Image'>
                    <div className='flex items-center gap-2'>
                        {image && <img src={image} alt='' className='size-10 rounded-md border border-ink/15 object-contain bg-white' />}
                        <SmallButton onClick={() => fileRef.current?.click()}>{image ? 'Replace' : 'Upload'}</SmallButton>
                        {image && <SmallButton onClick={() => setStyle({ image: undefined })}>Remove</SmallButton>}
                        <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={e => { void upload(e.target.files?.[0]); e.target.value = '' }} />
                    </div>
                </Row>
            )}
        </Section>
    )
}

function MotionSection({ editor, o }: { editor: Editor, o: CourseObject }){
    const motion = o.motion
    const start = editor.beginChange

    const setMotion = (m: MotionPath | undefined, record: boolean = false) => {
        editor.updateObject(o.id, x => {
            const { motion: _old, ...rest } = x
            return (m ? { ...rest, motion: m } : rest) as CourseObject
        }, record)
    }

    if(!motion){
        return (
            <Section title='Motion'>
                <Toggle label='Moves' checked={false} onChange={() => setMotion(defaultMotion(o), true)} />
            </Section>
        )
    }

    const setKey = (i: number, change: Partial<Keyframe>) => setMotion({ ...motion, keys: motion.keys.map((k, j) => j === i ? { ...k, ...change } : k) })

    const addKey = () => {
        const last = [...motion.keys].sort((a, b) => a.t - b.t).at(-1)
        const key: Keyframe = last ? { ...last, t: Math.round((last.t + 1) * 100) / 100 } : { t: 0, x: 0, y: 0, angle: 0, ease: 'smooth' }
        setMotion({ ...motion, keys: [...motion.keys, key] }, true)
    }

    return (
        <Section title='Motion'>
            <Toggle label='Moves' checked onChange={() => setMotion(undefined, true)} />

            <Row label='Repeat'>
                <select className={inputClass} value={motion.mode} onChange={e => setMotion({ ...motion, mode: e.target.value === 'loop' ? 'loop' : 'pingpong' }, true)}>
                    <option value='pingpong'>Back and forth</option>
                    <option value='loop'>Loop from start</option>
                </select>
            </Row>
            <NumberField label='Pivot X' value={motion.pivot.x} onStart={start} onChange={v => setMotion({ ...motion, pivot: { ...motion.pivot, x: v } })} />
            <NumberField label='Pivot Y' value={motion.pivot.y} onStart={start} onChange={v => setMotion({ ...motion, pivot: { ...motion.pivot, y: v } })} />

            <p className='text-xs text-sub'>Each keyframe is where the object is at that time, as an offset from where you placed it. Rotation turns it around the pivot (the purple handle).</p>

            {motion.keys.map((k, i) => (
                <div key={i} className='flex flex-col gap-1.5 rounded-lg bg-ink/5 p-2'>
                    <div className='flex items-center justify-between'>
                        <span className='text-xs font-extrabold text-ink'>Key {i + 1}</span>
                        <SmallButton disabled={motion.keys.length <= 1} onClick={() => setMotion({ ...motion, keys: motion.keys.filter((_, j) => j !== i) }, true)}>Remove</SmallButton>
                    </div>
                    <NumberField label='Time' value={k.t} min={0} step={0.1} suffix='s' onStart={start} onChange={v => setKey(i, { t: v })} />
                    <NumberField label='Offset X' value={k.x} onStart={start} onChange={v => setKey(i, { x: v })} />
                    <NumberField label='Offset Y' value={k.y} onStart={start} onChange={v => setKey(i, { y: v })} />
                    <NumberField label='Rotation' value={toDeg(k.angle)} suffix='°' onStart={start} onChange={v => setKey(i, { angle: toRad(v) })} />
                    <Row label='Easing'>
                        <select className={inputClass} value={k.ease} onChange={e => { start(); setKey(i, { ease: e.target.value === 'linear' ? 'linear' : 'smooth' }) }}>
                            <option value='smooth'>Smooth</option>
                            <option value='linear'>Linear</option>
                        </select>
                    </Row>
                </div>
            ))}

            <SmallButton onClick={addKey}>+ Add keyframe</SmallButton>
        </Section>
    )
}
