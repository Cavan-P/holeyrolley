import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { startGame, type HoleResult } from '../game'
import { COURSES, DEFAULT_COURSE } from '@holey/shared'
import { loadDraft } from '../editor/storage'
import { Button } from '../components/Button'
import { getBests, isUnlocked, recordScore, UNLOCK_OVER_PAR } from '../progress/store'
import { usePrefs } from '../settings/useSetting'
import { getCosmetics } from '../locker/store'

function holeTitle(result: HoleResult): string {
    if(result.strokes === 1) return 'Hole in One!'

    const names: Record<number, string> = { [-3]: 'Albatross', [-2]: 'Eagle', [-1]: 'Birdie', [0]: 'Par', [1]: 'Bogey', [2]: 'Double Bogey' }
    const diff = result.strokes - result.par

    return names[result.strokes - result.par] ?? `${diff > 0 ? '+' : ''}${result.strokes - result.par}`
}

function scoreLabel(diff: number): string {
    if(diff === 0) return 'E'
    return diff > 0 ? `+${diff}` : `${diff}`
}

function scoreColor(diff: number): string {
    if(diff < 0) return 'text-brand'
    return diff === 0 ? 'text-ink' : 'text-[#9a3b2e]'
}

function Scorecard({ card }: { card: HoleResult[] }){
    const totalPar = card.reduce((sum, h) => sum + h.par, 0)
    const totalStrokes = card.reduce((sum, h) => sum + h.strokes, 0)
    const totalDiff = totalStrokes - totalPar

    const rowLabel = 'pl-1 pr-4 py-2 text-left text-xs font-black uppercase tracking-[0.15em] text-sub'
    const cell = 'px-4 py-2 text-center'
    const latest = (i: number) => i === card.length - 1 ? 'bg-line' : ''
    const total = 'px-4 py-2 text-center border-l-2 border-line'

    return (
        <div className='mt-5 max-w-full overflow-x-auto rounded-3xl bg-card text-ink shadow-card px-5 py-3'>
            <table className='font-sans font-extrabold text-lg tabular-nums'>
                <thead>
                    <tr>
                        <th className={rowLabel}>Hole</th>
                        {card.map((h, i) => <th key={i} className={`${cell} ${i === card.length - 1 ? 'bg-ground text-chalk rounded-t-xl' : 'text-sub'}`}>{h.hole}</th>)}
                        <th className={`${total} text-xs font-black uppercase tracking-[0.15em] text-sub`}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='border-t-2 border-line text-sub'>
                        <th className={rowLabel}>Par</th>
                        {card.map((h, i) => <td key={i} className={`${cell} ${latest(i)}`}>{h.par}</td>)}
                        <td className={total}>{totalPar}</td>
                    </tr>
                    <tr className='border-t-2 border-line'>
                        <th className={rowLabel}>Strokes</th>
                        {card.map((h, i) => <td key={i} className={`${cell} ${latest(i)}`}>{h.strokes}</td>)}
                        <td className={`${total} font-display font-normal text-xl`}>{totalStrokes}</td>
                    </tr>
                    <tr className='border-t-2 border-line'>
                        <th className={rowLabel}>Score</th>
                        {card.map((h, i) => {
                            const diff = h.strokes - h.par
                            return <td key={i} className={`${cell} ${latest(i)} ${scoreColor(diff)}`}>{scoreLabel(diff)}</td>
                        })}
                        <td className={`${total} ${scoreColor(totalDiff)}`}>{scoreLabel(totalDiff)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

type HoleCompleteProps = {
    result: HoleResult
    card: HoleResult[]
    canAdvance: boolean
    onBack: () => void
    onNext: () => void
    onReplay: () => void
}

function HoleComplete({ result, card, canAdvance, onBack, onNext, onReplay }: HoleCompleteProps){
    const diff = result.strokes - result.par
    const titleColor = diff < 0 || result.strokes === 1 ? 'text-gold' : 'text-chalk'

    return (
        <div className='fixed inset-0 flex flex-col items-center justify-center gap-2 p-4 bg-[radial-gradient(ellipse_at_center,rgb(12_30_20/0.6),rgb(12_30_20/0.15)_70%)] animate-fade-in'>
            <p className='font-sans font-black uppercase tracking-[0.35em] text-sm text-chalk animate-rise-in'>
                {result.isLast ? 'Course complete' : `Hole ${result.hole} complete`}
            </p>

            <h1 className={`font-display text-8xl sm:text-9xl leading-none text-center ${titleColor} [text-shadow:0_7px_0_rgb(0_0_0/0.35)] animate-pop-in [animation-delay:100ms]`}>
                {holeTitle(result)}
            </h1>

            <div className='flex items-center gap-3 font-sans font-extrabold text-xl text-chalk animate-rise-in [animation-delay:300ms]'>
                <span>Par {result.par}</span>
                <span className='opacity-60'>·</span>
                <span>{result.strokes} {result.strokes === 1 ? 'stroke' : 'strokes'}</span>
                <span className={`rounded-full px-3 py-0.5 font-black ${diff < 0 ? 'bg-gold text-putt-ink' : 'bg-white/20'}`}>{scoreLabel(diff)}</span>
            </div>

            <div className='max-w-full animate-rise-in [animation-delay:400ms]'>
                <Scorecard card={card} />
            </div>

            {!canAdvance && (
                <p className='mt-5 rounded-2xl bg-card text-ink shadow-chip px-5 py-3 font-extrabold animate-rise-in [animation-delay:500ms]'>
                    Sink it in {result.par + UNLOCK_OVER_PAR} or fewer to unlock the next hole.
                </p>
            )}

            <div className='mt-6 flex w-full max-w-xl gap-4 font-sans animate-rise-in [animation-delay:550ms]'>
                <div className='flex-1'>
                    <Button label='Menu' onClick={onBack} />
                </div>
                <div className='flex-1'>
                    <Button label='Replay' onClick={onReplay} splash={!canAdvance} />
                </div>
                {canAdvance && (
                    <div className='flex-[1.6]'>
                        {result.isLast
                            ? <Button label='Finish' onClick={onBack} splash arrow />
                            : <Button label='Next hole' onClick={onNext} splash arrow />}
                    </div>
                )}
            </div>
        </div>
    )
}

const chip = 'fixed font-sans text-ink bg-card shadow-chip rounded-2xl h-13 px-5 flex items-center'

export function Game(){
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gameRef = useRef<ReturnType<typeof startGame> | null>(null)

    const [strokes, setStrokes] = useState(0)
    const [result, setResult] = useState<HoleResult | null>(null)
    const [card, setCard] = useState<HoleResult[]>([])

    const navigate = useNavigate()
    const prefs = usePrefs()

    const [params] = useSearchParams()
    const testing = import.meta.env.DEV && params.has('test')
    const courseId = params.get('course') ?? DEFAULT_COURSE
    const course = useMemo(() => (testing ? loadDraft() : null) ?? COURSES[courseId] ?? COURSES[DEFAULT_COURSE]!, [testing, courseId])
    const startHole = Number(params.get('hole') ?? 0) || 0
    const [holeIndex, setHoleIndex] = useState(startHole)
    const exit = () => navigate(testing ? '/editor' : `/courses?course=${courseId}`)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const onHoleComplete = (r: HoleResult) => {
            if(!testing) recordScore(courseId, r.hole - 1, r.strokes)
            setResult(r)
            setCard(prev => [...prev.filter(h => h.hole !== r.hole), r])
        }

        const cosmetics = getCosmetics()

        const game = startGame(canvas, course, { onStroke: setStrokes, onHoleComplete }, cosmetics, startHole)
        gameRef.current = game

        return () => game.dispose()
    }, [testing, startHole, courseId, course])

    return (
        <>
            <canvas ref={canvasRef} className='touch-none fixed inset-0 w-full h-full block' />

            <button
                type='button'
                onPointerDown={()=>{gameRef.current?.setOverview(true)}}
                onPointerUp={()=>{gameRef.current?.setOverview(false)}}
                onPointerLeave={()=>{gameRef.current?.setOverview(false)}}
                onPointerCancel={()=>{gameRef.current?.setOverview(false)}}
                className={`${chip} bottom-5 left-4 gap-2.5 font-black select-none touch-none`}>
                    <svg aria-hidden='true' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round'>
                        <path d='M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z' /><circle cx='12' cy='12' r='3' />
                    </svg>
                    Hole Overview
            </button>

            {prefs.strokeCounter && (
                <div className={`${chip} top-4 left-4 gap-3.5 pointer-events-none`}>
                    <span className='hidden sm:inline font-black text-xs uppercase tracking-[0.15em] text-sub'>Hole {holeIndex + 1} · Par {course.holes[holeIndex]?.par}</span>
                    <span className='hidden sm:block w-0.5 h-6 bg-line' />
                    <span className='font-black text-lg'>Strokes <span className='font-display font-normal text-2xl'>{strokes}</span></span>
                </div>
            )}
            <button type='button' onClick={exit} className={`${chip} top-4 right-4 font-black`}>
                {testing ? 'Back to editor' : 'Exit'}
            </button>
            {result && (
                <HoleComplete
                    result={result}
                    card={card}
                    onBack={exit}
                    canAdvance={testing || result.strokes <= result.par + UNLOCK_OVER_PAR || isUnlocked(course, getBests(courseId), result.hole)}
                    onNext={() => {
                        gameRef.current?.nextHole()
                        setHoleIndex(i => i + 1)
                        setResult(null)
                    }}
                    onReplay={() => {
                        gameRef.current?.replay()
                        setStrokes(0)
                        setResult(null)
                    }}
                />
            )}
        </>
    )
}
