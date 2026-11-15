type ButtonProps = {
    label: string
    onClick: () => void
    splash?: boolean
    ghost?: boolean
    arrow?: boolean
    disabled?: boolean
}

export function Button({ label, onClick, splash = false, ghost = false, arrow = false, disabled = false }: ButtonProps){
    const tone = splash ? 'bg-putt text-putt-ink press-putt' : ghost ? 'bg-white/8 text-chalk press-ghost' : 'bg-card text-ink press-card'

    return (
        <button
            type='button'
            onClick={onClick}
            disabled={disabled}
            className={`${tone} h-16 w-full rounded-2xl px-6 flex items-center justify-between gap-4 font-black text-lg text-left transition-transform active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {label}
            {arrow && <Arrow />}
        </button>
    )
}

export function Arrow(){
    return (
        <svg aria-hidden='true' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' className='shrink-0'>
            <path d='M5 12h14M13 6l6 6-6 6' />
        </svg>
    )
}
