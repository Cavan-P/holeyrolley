import { useEffect, useState, type ReactNode } from 'react'

export const inputClass = 'w-full rounded-md border border-ink/15 bg-white px-2 py-1 text-sm text-ink tabular-nums outline-none focus:border-putt'

export function Section({ title, children }: { title: string, children: ReactNode }){
    return (
        <section className='flex flex-col gap-2 border-b border-ink/10 px-4 py-3'>
            <h3 className='text-[11px] font-extrabold uppercase tracking-widest text-sub'>{title}</h3>
            {children}
        </section>
    )
}

export function Row({ label, children }: { label: string, children: ReactNode }){
    return (
        <label className='grid grid-cols-[5.5rem_1fr] items-center gap-2 text-sm text-ink'>
            <span className='text-sub'>{label}</span>
            {children}
        </label>
    )
}

type NumberProps = {
    label: string
    value: number
    onChange: (v: number) => void
    onStart?: () => void
    step?: number
    min?: number
    max?: number
    suffix?: string
}

export function NumberField({ label, value, onChange, onStart, step = 1, min, max, suffix }: NumberProps){
    const shown = String(Math.round(value * 100) / 100)
    const [text, setText] = useState(shown)
    const [focused, setFocused] = useState(false)

    useEffect(() => {
        if(!focused) setText(shown)
    }, [shown, focused])

    return (
        <Row label={label}>
            <div className='flex items-center gap-1'>
                <input
                    type='number'
                    className={inputClass}
                    value={text}
                    step={step}
                    min={min}
                    max={max}
                    onFocus={() => { setFocused(true); onStart?.() }}
                    onBlur={() => setFocused(false)}
                    onChange={e => {
                        setText(e.target.value)
                        const v = parseFloat(e.target.value)
                        if(Number.isNaN(v)) return
                        onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v)))
                    }}
                />
                {suffix && <span className='text-xs text-sub'>{suffix}</span>}
            </div>
        </Row>
    )
}

export function Toggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }){
    return (
        <label className='flex items-center gap-2 text-sm text-ink'>
            <input type='checkbox' className='size-4 accent-putt' checked={checked} onChange={e => onChange(e.target.checked)} />
            {label}
        </label>
    )
}

export function SmallButton({ children, onClick, active = false, disabled = false, title }: { children: ReactNode, onClick: () => void, active?: boolean, disabled?: boolean, title?: string }){
    return (
        <button
            type='button'
            title={title}
            disabled={disabled}
            onClick={onClick}
            className={`rounded-md px-2 py-1 text-xs font-bold transition-colors disabled:opacity-40 ${active ? 'bg-putt text-putt-ink' : 'bg-ink/5 text-ink hover:bg-ink/10'}`}
        >
            {children}
        </button>
    )
}

export const toDeg = (r: number) => r * 180 / Math.PI
export const toRad = (d: number) => d * Math.PI / 180
