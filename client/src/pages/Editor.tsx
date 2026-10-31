import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import type { CourseData, ShapeType } from '@holey/shared'
import { useEditor } from '../editor/useEditor'
import { EditorCanvas } from '../editor/EditorCanvas'
import { Toolbar } from '../editor/Toolbar'
import { Inspector } from '../editor/Inspector'
import { SmallButton, inputClass } from '../editor/fields'
import { downloadCourse, readCourseFile, saveDraft } from '../editor/storage'
import { newHole, type ToolId } from '../editor/model'
import { COURSE_VERSION } from '@holey/shared'

function withoutUnusedAssets(course: CourseData): CourseData {
    const used = new Set(course.holes.flatMap(h => h.objects.map(o => o.style?.image).filter(Boolean)))
    return { ...course, assets: Object.fromEntries(Object.entries(course.assets).filter(([key]) => used.has(key))) }
}

export function Editor(){
    const editor = useEditor()
    const navigate = useNavigate()
    const importRef = useRef<HTMLInputElement>(null)

    const [tool, setTool] = useState<ToolId>('select')
    const [shapeKind, setShapeKind] = useState<ShapeType>('rect')
    const [grid, setGrid] = useState(20)
    const [preview, setPreview] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { course, holeIndex } = editor

    const testPlay = () => {
        saveDraft(editor.course)
        navigate(`/play?test&hole=${holeIndex}`)
    }

    const importCourse = async (file: File | undefined) => {
        if(!file) return
        try {
            editor.replaceCourse(await readCourseFile(file))
            setError(null)
        }
        catch(err){
            setError(err instanceof Error ? err.message : 'Could not read that file')
        }
    }

    const newCourse = () => {
        if(!window.confirm('Start a new course? Export this one first if you want to keep it.')) return
        editor.replaceCourse({ version: COURSE_VERSION, name: 'New course', theme: course.theme, holes: [newHole(1)], assets: {} })
    }

    return (
        <div className='fixed inset-0 flex flex-col bg-sky font-sans text-ink'>
            <header className='flex h-14 shrink-0 items-center gap-3 border-b border-ink/10 bg-card px-3'>
                <SmallButton onClick={() => navigate('/')}>← Menu</SmallButton>
                <span className='font-display text-xl font-bold'>Editor</span>

                <div className='mx-2 h-6 w-px bg-ink/10' />

                <div className='flex items-center gap-1 overflow-x-auto'>
                    {course.holes.map((h, i) => (
                        <SmallButton key={i} active={i === holeIndex} onClick={() => editor.setHoleIndex(i)} title={h.name}>{i + 1}</SmallButton>
                    ))}
                    <SmallButton onClick={editor.addHole} title='Add hole'>+</SmallButton>
                </div>
                <div className='flex items-center gap-1'>
                    <SmallButton onClick={() => editor.moveHole(-1)} disabled={holeIndex === 0} title='Move hole earlier'>◀</SmallButton>
                    <SmallButton onClick={() => editor.moveHole(1)} disabled={holeIndex === course.holes.length - 1} title='Move hole later'>▶</SmallButton>
                    <SmallButton onClick={editor.duplicateHole} title='Duplicate hole'>Copy</SmallButton>
                    <SmallButton onClick={editor.deleteHole} disabled={course.holes.length <= 1} title='Delete hole'>Delete</SmallButton>
                </div>

                <div className='flex-1' />

                <SmallButton onClick={editor.undo} disabled={!editor.canUndo} title='⌘Z'>Undo</SmallButton>
                <SmallButton onClick={editor.redo} disabled={!editor.canRedo} title='⇧⌘Z'>Redo</SmallButton>

                <label className='flex items-center gap-1 text-xs font-bold'>
                    Grid
                    <select className={`${inputClass} w-20`} value={grid} onChange={e => setGrid(Number(e.target.value))}>
                        <option value={0}>Off</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={40}>40</option>
                    </select>
                </label>
                <SmallButton active={preview} onClick={() => setPreview(p => !p)} title='Play moving objects'>{preview ? '■ Stop' : '▶ Motion'}</SmallButton>

                <div className='mx-1 h-6 w-px bg-ink/10' />

                <SmallButton onClick={newCourse}>New</SmallButton>
                <SmallButton onClick={() => importRef.current?.click()}>Import</SmallButton>
                <SmallButton onClick={() => downloadCourse(withoutUnusedAssets(course))}>Export</SmallButton>
                <input ref={importRef} type='file' accept='application/json,.json' className='hidden' onChange={e => { void importCourse(e.target.files?.[0]); e.target.value = '' }} />

                <button type='button' onClick={testPlay} className='rounded-lg bg-putt px-4 py-1.5 text-sm font-extrabold text-putt-ink shadow-card'>
                    Test hole {holeIndex + 1} ▶
                </button>
            </header>

            {error && (
                <div className='flex items-center justify-between bg-flag/15 px-4 py-2 text-sm font-bold text-ink'>
                    {error}
                    <SmallButton onClick={() => setError(null)}>Dismiss</SmallButton>
                </div>
            )}

            <div className='flex min-h-0 flex-1'>
                <aside className='w-48 shrink-0 border-r border-ink/10 bg-card'>
                    <Toolbar tool={tool} setTool={setTool} shapeKind={shapeKind} setShapeKind={setShapeKind} />
                </aside>

                <main className='relative min-w-0 flex-1'>
                    <EditorCanvas editor={editor} tool={tool} setTool={setTool} shapeKind={shapeKind} grid={grid} preview={preview} />
                </main>

                <aside className='w-72 shrink-0 overflow-y-auto border-l border-ink/10 bg-card'>
                    <Inspector editor={editor} />
                </aside>
            </div>
        </div>
    )
}
