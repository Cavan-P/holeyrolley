import type { ReactNode } from 'react'

type SectionProps = {
    title: string
    description?: string
    children: ReactNode
}

export function SettingsSection({ title, description, children }: SectionProps){
    return (
        <section className='bg-card rounded-2xl shadow-card px-5 sm:px-7 pt-6 pb-3 flex flex-col'>
            <h2 className='font-display font-semibold text-2xl'>{title}</h2>
            {description && <p className='text-sm text-sub pt-1'>{description}</p>}
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
        <div className={`${rowClass} py-4 border-t border-ink/10`}>
            <div className={`flex flex-col gap-0.5 ${inline ? 'flex-1 basis-40' : ''}`}>
                <span className='font-extrabold text-lg'>{label}</span>
                {description && <span className='text-sm text-sub'>{description}</span>}
            </div>
            {children}
        </div>
    )
}
