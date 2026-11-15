
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { COURSES, DEFAULT_COURSE } from '@holey/shared'
import { Page } from '../components/Page'
import { Arrow } from '../components/Button'
import { HolePreview } from '../components/HolePreview'
import { getBests, isUnlocked, UNLOCK_OVER_PAR } from '../progress/store'

function scoreLabel(strokes: number, par: number): string {
    if(strokes === 1) return 'Ace'

    const diff = strokes - par
    if(diff === 0) return 'E'
    return diff > 0 ? `+${diff}` : `${diff}`
}

export function Courses(){

    const [params, setParams] = useSearchParams()
    const courseId = params.get('course') ?? DEFAULT_COURSE
    const course = COURSES[courseId] ?? COURSES[DEFAULT_COURSE]!
    const bests = getBests(courseId)

    const unlocked = course.holes.map((_, i) => isUnlocked(course, bests, i))
    const cleared = course.holes.filter((h, i) => { const b = bests[i]; return b != null && b <= h.par + UNLOCK_OVER_PAR }).length
    const nextUp = Math.max(0, unlocked.lastIndexOf(true))

    const [picked, setPicked] = useState<number | null>(null)
    const sel = picked ?? nextUp
    const hole = course.holes[sel]!
    const best = bests[sel]

    return (
        <Page title='Singleplayer' width='max-w-7xl'>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-5'>
                {Object.entries(COURSES).map(([id, c]) => {
                    const on = id === courseId
                    const done = getBests(id).filter((b, i) => b != null && b <= (c.holes[i]?.par ?? 0) + UNLOCK_OVER_PAR).length

                    return (
                        <button
                            key={id}
                            type='button'
                            aria-pressed={on}
                            onClick={() => { setParams({ course: id }); setPicked(null) }}
                            className={`${on ? 'border-putt shadow-[0_7px_0_var(--color-putt-deep)]' : 'border-card shadow-card'} flex flex-col rounded-3xl overflow-hidden border-4 bg-card text-ink text-left`}
                        >
                            <HolePreview course={c} hole='showcase' className='w-full h-32' />
                            <span className='flex flex-col px-4 pt-3 pb-4'>
                                <span className='font-display text-2xl'>{c.name}</span>
                                <span className='text-sm font-extrabold text-sub'>{c.holes.length} holes · {done} cleared</span>
                            </span>
                        </button>
                    )
                })}
            </div>

            <div className='flex flex-wrap gap-6 items-start'>
                <section className='flex-[999_1_36rem] min-w-0 bg-card text-ink rounded-3xl shadow-card p-6 sm:p-7 flex flex-col gap-5'>
                    <div className='flex flex-wrap items-baseline justify-between gap-2'>
                        <h2 className='font-display text-4xl'>{course.name}</h2>
                        <span className='font-extrabold text-sub'>{cleared} of {course.holes.length} cleared</span>
                    </div>
                    <div className='h-3 rounded-full bg-line overflow-hidden'>
                        <div className='h-full rounded-full bg-brand' style={{ width: `${(cleared / course.holes.length) * 100}%` }} />
                    </div>

                    <div className='grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-3'>
                        {course.holes.map((h, i) => {
                            const b = bests[i]
                            const open = unlocked[i]
                            const on = i === sel
                            const diff = b != null ? b - h.par : 0

                            const tile = on ? 'bg-ground border-ground text-chalk shadow-[0_5px_0_var(--color-putt)]'
                                : !open ? 'bg-line border-line text-sub cursor-not-allowed'
                                : b == null ? 'bg-white border-putt'
                                : 'bg-white border-line'

                            const badge = b != null ? (diff < 0 || b === 1 ? 'bg-brand text-card' : 'bg-line text-ink')
                                : open ? 'bg-putt text-putt-ink' : 'text-sub'

                            return (
                                <button
                                    key={i}
                                    type='button'
                                    disabled={!open}
                                    onClick={() => setPicked(i)}
                                    aria-label={`Hole ${i + 1}, ${h.name}${open ? '' : ', locked'}`}
                                    className={`${tile} h-21 rounded-2xl border-3 flex flex-col items-center justify-center gap-1.5`}
                                >
                                    <span className='font-display text-3xl leading-none'>{i + 1}</span>
                                    <span className={`${badge} rounded-full px-2 text-xs font-black`}>
                                        {b != null ? scoreLabel(b, h.par) : open ? 'Next' : 'Locked'}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    <p className='flex items-center gap-2.5 font-bold text-sub'>
                        <svg aria-hidden='true' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round'>
                            <rect x='5' y='11' width='14' height='10' rx='2' /><path d='M8 11V8a4 4 0 0 1 8 0v3' />
                        </svg>
                        Sink a hole at double bogey or better to unlock the next one.
                    </p>
                </section>

                <section className='flex-[1_1_20rem] min-w-0 bg-card text-ink rounded-3xl shadow-card p-6 flex flex-col gap-4'>
                    <HolePreview course={course} hole={sel} className='w-full h-56 rounded-2xl' />
                    <div className='flex flex-col'>
                        <span className='font-black text-sm uppercase tracking-[0.15em] text-sub'>Hole {sel + 1} · Par {hole.par}</span>
                        <span className='font-display text-4xl'>{hole.name}</span>
                    </div>
                    <div className='flex gap-2.5'>
                        <div className='flex-1 rounded-2xl bg-line px-4 py-2.5 flex flex-col'>
                            <span className='font-black text-xs uppercase tracking-[0.15em] text-sub'>Best</span>
                            <span className='font-display text-2xl'>{best != null ? `${best} ${best === 1 ? 'stroke' : 'strokes'}` : '—'}</span>
                        </div>
                        <div className='flex-1 rounded-2xl bg-line px-4 py-2.5 flex flex-col'>
                            <span className='font-black text-xs uppercase tracking-[0.15em] text-sub'>Unlock next</span>
                            <span className='font-display text-2xl'>{hole.par + UNLOCK_OVER_PAR} or fewer</span>
                        </div>
                    </div>
                    <Link
                        to={`/play?course=${courseId}&hole=${sel}`}
                        className='h-16 rounded-2xl px-6 flex items-center justify-between bg-putt text-putt-ink press-putt font-black text-xl transition-transform active:translate-y-1'
                    >
                        Play hole {sel + 1} <Arrow />
                    </Link>
                    <Link
                        to={`/play?course=${courseId}`}
                        className='h-13 rounded-2xl flex items-center justify-center bg-white border-3 border-line font-black'
                    >
                        Play the course from hole 1
                    </Link>
                </section>
            </div>
        </Page>
    )
}
