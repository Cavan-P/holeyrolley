import type { ReactNode } from 'react'

type SectionProps = {
    title: string
    description?: string
    id?: string
    children: ReactNode
}

export function SettingsSection({ title, description, id, children }: SectionProps){
    return (
        <section id={id} className='bg-card text-ink rounded-3xl shadow-card px-6 sm:px-7 pt-6 pb-3 flex flex-col scroll-mt-6'>
            <h2 className='font-display text-3xl'>{title}</h2>
            {description && <p className='text-sub pt-1'>{description}</p>}
            <div className='pt-2 flex flex-col'>
                {children}
            </div>
        </section>
    )
}

type RowProps = {
    label: string
    description?: string
    layout?: 'inline' | 'stacked'
    children: ReactNode
}

export function SettingRow({ label, description, layout = 'inline', children }: RowProps){
    const inline = layout === 'inline'
    const rowClass = inline ? 'flex flex-wrap items-center justify-between gap-4' : 'flex flex-col gap-3'

    return (
        <div className={`${rowClass} py-4 border-t-2 border-line`}>
            <div className={`flex flex-col gap-0.5 ${inline ? 'flex-1 basis-40' : ''}`}>
                <span className='font-black text-lg'>{label}</span>
                {description && <span className='text-sub'>{description}</span>}
            </div>
            {children}
        </div>
    )
}
