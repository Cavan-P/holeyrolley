import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { startGame, type HoleResult } from '../game'
import { Button } from '../components/Button'

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

// Gold under par, plain at par, dimmer over par
function scoreColor(diff: number): string {
    if(diff < 0) return 'text-orb'
    return diff === 0 ? 'text-white' : 'text-white/70'
}

// A golf-style scorecard: one column per hole played so far, plus a total
function Scorecard({ card }: { card: HoleResult[] }){
    const totalPar = card.reduce((sum, h) => sum + h.par, 0)
    const totalStrokes = card.reduce((sum, h) => sum + h.strokes, 0)
    const totalDiff = totalStrokes - totalPar

    const rowLabel = 'px-4 py-1.5 text-left text-xs font-extrabold uppercase tracking-widest text-white/70'
    const cell = 'px-4 py-1.5 text-center'
    // The hole just finished gets a faint highlight
    const latest = (i: number) => i === card.length - 1 ? 'bg-white/10' : ''
    const total = 'px-4 py-1.5 text-center font-extrabold border-l border-white/20'

    return (
        <table className='mt-6 overflow-hidden rounded-xl bg-ink/25 backdrop-blur-[2px] font-sans font-bold text-lg text-white tabular-nums text-shadow-sm text-shadow-ink/40'>
            <thead>
                <tr className='border-b border-white/20'>
                    <th className={rowLabel}>Hole</th>
                    {card.map((h, i) => <th key={i} className={`${cell} ${latest(i)}`}>{h.hole}</th>)}
                    <th className={total}>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th className={rowLabel}>Par</th>
                    {card.map((h, i) => <td key={i} className={`${cell} ${latest(i)} text-white/80`}>{h.par}</td>)}
                    <td className={`${total} text-white/80`}>{totalPar}</td>
                </tr>
                <tr>
                    <th className={rowLabel}>Strokes</th>
                    {card.map((h, i) => <td key={i} className={`${cell} ${latest(i)}`}>{h.strokes}</td>)}
                    <td className={total}>{totalStrokes}</td>
                </tr>
                <tr>
                    <th className={rowLabel}>Score</th>
                    {card.map((h, i) => {
                        const diff = h.strokes - h.par
                        return <td key={i} className={`${cell} ${latest(i)} ${scoreColor(diff)}`}>{scoreLabel(diff)}</td>
                    })}
                    <td className={`${total} ${scoreColor(totalDiff)}`}>{scoreLabel(totalDiff)}</td>
                </tr>
            </tbody>
        </table>
    )
}

type HoleCompleteProps = {
    result: HoleResult
    card: HoleResult[]
    onBack: () => void
    onNext: () => void
}

function HoleComplete({ result, card, onBack, onNext }: HoleCompleteProps){
    const diff = result.strokes - result.par
    const titleColor = diff < 0 ? 'text-orb' : 'text-white'

    return (
        <div className='fixed inset-0 flex flex-col items-center justify-center gap-1 bg-[radial-gradient(ellipse_at_center,rgb(0_0_0/0.3),transparent_65%)] animate-fade-in'>
            <p className='font-sans font-extrabold uppercase tracking-[0.35em] text-sm text-white/85 text-shadow-sm text-shadow-ink/50 animate-rise-in'>
                {result.isLast ? 'Course complete' : `Hole ${result.hole} complete`}
            </p>

            <h1 className={`font-display font-bold text-8xl ${titleColor} text-shadow-lg text-shadow-ink/40 animate-pop-in [animation-delay:100ms]`}>
                {holeTitle(result)}
            </h1>

            <div className='flex items-center gap-3 font-sans font-bold text-xl text-white text-shadow-sm text-shadow-ink/50 animate-rise-in [animation-delay:300ms]'>
                <span>Par {result.par}</span>
                <span className='opacity-60'>·</span>
                <span>{result.strokes} {result.strokes === 1 ? 'stroke' : 'strokes'}</span>
                <span className='rounded-full bg-white/20 px-3 py-0.5 text-shadow-none'>{scoreLabel(diff)}</span>
            </div>

            <div className='animate-rise-in [animation-delay:400ms]'>
                <Scorecard card={card} />
            </div>

            <div className='mt-6 flex w-96 gap-3 font-sans text-putt-ink animate-rise-in [animation-delay:550ms]'>
                {result.isLast ? (
                    <div className='flex-1'>
                        <Button label='Return to menu' onClick={onBack} splash arrow />
                    </div>
                ) : (
                    <>
                        <div className='flex-1'>
                            <Button label='Menu' onClick={onBack} />
                        </div>
                        <div className='flex-3'>
                            <Button label='Next hole' onClick={onNext} splash arrow />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export function Game(){
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gameRef = useRef<ReturnType<typeof startGame> | null>(null)

    const [strokes, setStrokes] = useState(0)
    const [result, setResult] = useState<HoleResult | null>(null)
    const [card, setCard] = useState<HoleResult[]>([])

    const navigate = useNavigate()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const onHoleComplete = (r: HoleResult) => {
            setResult(r)
            setCard(prev => [...prev, r])
        }

        const game = startGame(canvas, { onStroke: setStrokes, onHoleComplete })
        gameRef.current = game

        return () => game.dispose()
    }, [])

    return (
        <>
            <canvas ref={canvasRef} className='touch-none fixed inset-0 w-full h-full block' />
            <div className='fixed top-4 left-4 pointer-events-none font-sans text-ink text-xl bg-card pb-2 pt-2 pr-4 pl-4 rounded-full'>
                Strokes: {strokes}
            </div>
            {result && (
                <HoleComplete
                    result={result}
                    card={card}
                    onBack={() => navigate('/')}
                    onNext={() => {
                        gameRef.current?.nextHole()
                        setResult(null)
                    }}
                />
            )}
        </>
    )
}
