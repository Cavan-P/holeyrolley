import type { ShapeType } from '@holey/shared'
import { AREA_TOOLS, SHAPE_KINDS, TOOLS, type ToolId } from './model'

type Props = {
    tool: ToolId
    setTool: (t: ToolId) => void
    shapeKind: ShapeType
    setShapeKind: (s: ShapeType) => void
}

const HINTS: Partial<Record<ToolId, string>> = {
    wall: 'Click points. Click the first point to close, double-click or Enter to finish.',
    curveWall: 'Like Wall, but the rail curves smoothly through the points.',
    arcWall: 'Drag from the center out to the radius.',
    bumper: 'Click for a round bumper, drag for a bar. Kicks the ball away on contact.',
    post: 'Click to place a plain round post. No kick.',
    bridge: 'Drag from one end to the other. Balls get on from the ends.',
    decor: 'Drag a box, or drop an image file onto the canvas.',
    tee: 'Click where the ball starts.',
    cup: 'Click where the hole is.'
}

export function Toolbar({ tool, setTool, shapeKind, setShapeKind }: Props){
    const groups = [...new Set(TOOLS.map(t => t.group))]
    const isArea = AREA_TOOLS.includes(tool)
    const hint = isArea
        ? shapeKind === 'polygon' || shapeKind === 'curve'
            ? 'Click points, then click the first point or press Enter.'
            : shapeKind === 'rect' ? 'Drag a box.' : 'Drag from the center outward.'
        : HINTS[tool]

    return (
        <div className='flex h-full flex-col gap-4 overflow-y-auto p-3'>
            {groups.map(group => (
                <div key={group} className='flex flex-col gap-1'>
                    <h3 className='px-1 text-[11px] font-extrabold uppercase tracking-widest text-sub'>{group}</h3>
                    {TOOLS.filter(t => t.group === group).map(t => (
                        <button
                            key={t.id}
                            type='button'
                            onClick={() => setTool(t.id)}
                            className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm font-bold transition-colors ${tool === t.id ? 'bg-putt text-putt-ink' : 'text-ink hover:bg-ink/5'}`}
                        >
                            {t.label}
                            <kbd className='text-[10px] font-extrabold uppercase opacity-50'>{t.key}</kbd>
                        </button>
                    ))}
                </div>
            ))}

            {isArea && (
                <div className='flex flex-col gap-1'>
                    <h3 className='px-1 text-[11px] font-extrabold uppercase tracking-widest text-sub'>Shape</h3>
                    <div className='grid grid-cols-2 gap-1'>
                        {SHAPE_KINDS.map(s => (
                            <button
                                key={s.id}
                                type='button'
                                onClick={() => setShapeKind(s.id)}
                                className={`rounded-md px-2 py-1 text-xs font-bold ${shapeKind === s.id ? 'bg-ink text-white' : 'bg-ink/5 text-ink hover:bg-ink/10'}`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {hint && <p className='rounded-lg bg-ink/5 p-2 text-xs text-sub'>{hint}</p>}
        </div>
    )
}
