type ButtonProps = {
    label: string
    onClick: () => void
    splash?: boolean
    arrow?: boolean
}

export function Button({ label, onClick, splash = false, arrow = false }: ButtonProps){
    const defaultClass = splash ? 'bg-putt font-extrabold' : 'bg-card'

    return (
        <button type='button' onClick={onClick} className={`${defaultClass} h-14 w-full rounded-xl text-left items-center pl-6 justify-between flex flex-row`}>
            {label}
            <div className='pr-6'>
                <span className={arrow ? 'w-3 h-3 border-black border-t-0 border-r-3 border-b-3 border-l-0 inline-block -rotate-45' : ''}></span>
            </div>
        </button>
    )
}
