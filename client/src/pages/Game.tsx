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

type HoleCompleteProps = {
    result: HoleResult
    onBack: () => void
    onNext: () => void
}

function HoleComplete({ result, onBack, onNext }: HoleCompleteProps){
    const diff = result.strokes - result.par
    const titleColor = diff < 0 ? 'text-orb' : 'text-white'

    return (
        <div className='fixed inset-0 flex flex-col items-center justify-center gap-1 bg-[radial-gradient(ellipse_at_center,rgb(0_0_0/0.3),transparent_65%)] animate-fade-in'>
            <p className='font-sans font-extrabold uppercase tracking-[0.35em] text-sm text-white/85 text-shadow-sm text-shadow-ink/50 animate-rise-in'>
                Hole complete
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

            <div className='mt-8 flex w-96 gap-3 font-sans text-putt-ink animate-rise-in [animation-delay:500ms]'>
                <div className='flex-1'>
                    <Button label='Menu' onClick={onBack} />
                </div>
                <div className='flex-3'>
                    <Button label='Next hole' onClick={onNext} splash arrow />
                </div>
            </div>
        </div>
    )
}

export function Game(){
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [strokes, setStrokes] = useState(0)
    const [result, setResult] = useState<HoleResult | null>(null)

    const navigate = useNavigate()

    useEffect(() => {
        const canvas = canvasRef.current

        if (!canvas) return
        return startGame(canvas, { onStroke: setStrokes, onHoleComplete: setResult })
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
                    onBack={() => navigate('/')}
                    // TODO (step 3): tell the game to load the next hole
                    onNext={() => console.log('next hole')}
                />
            )}
        </>
    )
}
