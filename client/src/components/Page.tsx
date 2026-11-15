import type { ReactNode } from 'react'
import { Link } from 'react-router'

type PageProps = {
    title: string
    subtitle?: string
    width?: string
    aside?: ReactNode
    children: ReactNode
}

export function Page({ title, subtitle, width = 'max-w-6xl', aside, children }: PageProps){
    return (
        <div className='h-full w-full overflow-y-auto bg-mowed text-chalk'>
            <div className={`${width} mx-auto px-4 sm:px-8 pt-10 pb-16 flex flex-col gap-8`}>
                <nav className='flex items-center justify-between gap-4'>
                    <BackLink to='/' label='Menu' />
                    {aside}
                </nav>
                <header className='flex flex-col gap-2'>
                    <h1 className='font-display text-6xl sm:text-8xl leading-none'>{title}</h1>
                    {subtitle && <p className='text-lg sm:text-xl text-ground-sub'>{subtitle}</p>}
                </header>
                {children}
            </div>
        </div>
    )
}

export function BackLink({ to, label }: { to: string, label: string }){
    return (
        <Link to={to} className='flex items-center gap-2 h-12 pl-3.5 pr-5 rounded-full bg-white/8 hover:bg-white/24 hover:ring-2 hover:ring-white/40 cursor-pointer transition font-extrabold'>
            <svg aria-hidden='true' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M19 12H5M11 6l-6 6 6 6' />
            </svg>
            {label}
        </Link>
    )
}
