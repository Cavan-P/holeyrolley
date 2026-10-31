type ToggleProps = {
    label: string
    on: boolean
    onChange: (on: boolean) => void
}

export function Toggle({ label, on, onChange }: ToggleProps){
    return (
        <button
            type='button'
            aria-label={label}
            aria-pressed={on}
            onClick={() => onChange(!on)}
            className={`${on ? 'bg-brand' : 'bg-track'} relative w-13 h-8 shrink-0 rounded-full transition-colors`}
        >
            <span className={`${on ? 'left-6' : 'left-1'} absolute top-1 size-6 rounded-full bg-white shadow-toggle transition-all`} />
        </button>
    )
}

type SegmentedProps<T extends string> = {
    options: readonly { value: T, label: string }[]
    value: T
    onChange: (value: T) => void
}

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>){
    return (
        <div className='grid auto-cols-fr grid-flow-col gap-1 p-1 bg-track rounded-2xl'>
            {options.map(o => {
                const picked = o.value === value

                return (
                    <button
                        key={o.value}
                        type='button'
                        aria-pressed={picked}
                        onClick={() => onChange(o.value)}
                        className={`${picked ? 'bg-putt text-putt-ink font-extrabold shadow-toggle' : 'font-bold'} h-12 rounded-xl transition-colors`}
                    >
                        {o.label}
                    </button>
                )
            })}
        </div>
    )
}

type VolumeProps = {
    label: string
    value: number
    onChange: (value: number) => void
}

export function VolumeSlider({ label, value, onChange }: VolumeProps){
    const percent = Math.round(value * 100)

    return (
        <div className='flex items-center gap-3'>
            <input
                type='range'
                aria-label={label}
                min={0}
                max={1}
                step={0.01}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                className='flex-1 h-7 accent-putt'
            />
            <span className='min-w-16 text-center px-2.5 py-1 rounded-full bg-track text-sm font-extrabold tabular-nums'>
                {percent === 0 ? 'Off' : `${percent}%`}
            </span>
        </div>
    )
}

type TrackTileProps = {
    name: string
    picked: boolean
    onPick: () => void
}

export function TrackTile({ name, picked, onPick }: TrackTileProps){
    return (
        <button
            type='button'
            aria-pressed={picked}
            onClick={onPick}
            className={`${picked ? 'bg-putt text-putt-ink border-putt' : 'bg-sky border-transparent'} min-h-24 rounded-2xl p-3.5 border-2 flex flex-col justify-between items-start text-left transition-colors`}
        >
            <svg aria-hidden='true' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' />
            </svg>
            <span className='font-extrabold'>{name}</span>
        </button>
    )
}
