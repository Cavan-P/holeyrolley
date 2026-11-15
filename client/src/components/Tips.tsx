import { useEffect, useState } from 'react'
import type { HoleData } from '@holey/shared'
import { TIPS, takeNewTips, type Mechanic } from '../progress/tips'

export function Tips({ hole }: { hole: HoleData | undefined }){
    const [tips, setTips] = useState<Mechanic[]>([])

    useEffect(() => {
        if(!hole) return
        setTips(takeNewTips(hole))
        const timer = setTimeout(() => setTips([]), 9000)
        return () => clearTimeout(timer)
    }, [hole])

    if(!tips.length) return null

    return (
        <div className='fixed top-22 left-1/2 -translate-x-1/2 w-[min(28rem,calc(100%-2rem))] rounded-2xl bg-card text-ink shadow-card px-5 py-4 flex flex-col gap-3 animate-rise-in'>
            {tips.map(m => (
                <div key={m} className='flex flex-col'>
                    <span className='font-black text-xs uppercase tracking-[0.15em] text-brand'>New · {TIPS[m][0]}</span>
                    <span className='font-bold'>{TIPS[m][1]}</span>
                </div>
            ))}
            <button type='button' onClick={() => setTips([])} className='self-end rounded-full bg-line hover:bg-card-deep px-4 py-1.5 font-black text-sm'>Got it</button>
        </div>
    )
}
