import { useEffect } from 'react'
import { SettingsSections } from '../pages/Settings'

export function SettingsOverlay({ onClose }: { onClose: () => void }){
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if(e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    return (
        <div className='fixed inset-0 z-50 bg-ground/85 overflow-y-auto animate-fade-in' onClick={onClose}>
            <div className='max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6' onClick={e => e.stopPropagation()}>
                <div className='flex items-center justify-between gap-4'>
                    <h1 className='font-display text-5xl text-chalk'>Settings</h1>
                    <button type='button' onClick={onClose} className='h-12 px-6 rounded-2xl bg-putt text-putt-ink press-putt font-black'>Back to game</button>
                </div>
                <SettingsSections />
            </div>
        </div>
    )
}
