import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { COURSES, holeRange, type CourseData, type Player } from '@holey/shared'
import { Button } from '../components/Button'
import { leave, send } from '../network/connection'
import { useConnection } from '../network/useConnection'
import { startPartyGame, type PartyStatus } from '../game/party'
import { recordScore } from '../progress/store'
import { Tips } from '../components/Tips'
import { SettingsOverlay } from '../components/SettingsOverlay'

const chip = 'fixed font-sans text-ink bg-card shadow-chip rounded-2xl h-13 px-5 flex items-center'

function total(scores: (number | null)[]): number {
    return scores.reduce<number>((sum, s) => sum + (s ?? 0), 0)
}

function overPar(course: CourseData, scores: (number | null)[]): number {
    return scores.reduce<number>((sum, s, i) => s == null ? sum : sum + s - (course.holes[i]?.par ?? 0), 0)
}

function PartyScorecard({ course, players, scores, from, upTo, yourId }: { course: CourseData, players: Player[], scores: Record<string, (number | null)[]>, from: number, upTo: number, yourId: string }){
    const holes = course.holes.slice(from, upTo + 1)
    const par = holes.reduce((sum, h) => sum + h.par, 0)
    const ranked = [...players].sort((a, b) => overPar(course, scores[a.id] ?? []) - overPar(course, scores[b.id] ?? []))

    const rowLabel = 'pl-1 pr-4 py-2 text-left font-black whitespace-nowrap'
    const cell = 'px-3 py-2 text-center'
    const sum = 'px-4 py-2 text-center border-l-2 border-line'

    return (
        <div className='max-w-full overflow-x-auto rounded-3xl bg-card text-ink shadow-card px-5 py-3'>
            <table className='font-sans font-extrabold text-lg tabular-nums'>
                <thead>
                    <tr className='text-sub'>
                        <th className={`${rowLabel} text-xs uppercase tracking-[0.15em]`}>Hole</th>
                        {holes.map((_, i) => <th key={i} className={`${cell} ${from + i === upTo ? 'bg-ground text-chalk rounded-t-xl' : ''}`}>{from + i + 1}</th>)}
                        <th className={`${sum} text-xs font-black uppercase tracking-[0.15em]`}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='border-t-2 border-line text-sub'>
                        <th className={`${rowLabel} text-xs uppercase tracking-[0.15em]`}>Par</th>
                        {holes.map((h, i) => <td key={i} className={cell}>{h.par}</td>)}
                        <td className={sum}>{par}</td>
                    </tr>
                    {ranked.map(p => {
                        const card = scores[p.id] ?? []
                        const diff = overPar(course, card)
                        return (
                            <tr key={p.id} className={`border-t-2 border-line ${p.id === yourId ? 'bg-line' : ''}`}>
                                <th className={`${rowLabel} max-w-40 truncate`}>{p.name}</th>
                                {holes.map((h, i) => {
                                    const s = card[from + i]
                                    const color = s == null ? 'text-sub' : s < h.par ? 'text-brand' : s > h.par ? 'text-[#9a3b2e]' : ''
                                    return <td key={i} className={`${cell} ${color}`}>{s ?? '–'}</td>
                                })}
                                <td className={`${sum} font-display font-normal text-xl`}>
                                    {total(card)} <span className='font-sans text-sm text-sub'>{diff === 0 ? 'E' : diff > 0 ? `+${diff}` : diff}</span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export function PartyGame(){
    const navigate = useNavigate()
    const { code = '' } = useParams()
    const connection = useConnection()
    const room = connection.room

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gameRef = useRef<ReturnType<typeof startPartyGame> | null>(null)
    const leaving = useRef(false)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [status, setStatus] = useState<PartyStatus>({ strokes: 0, time: 0, done: false, watching: null })

    const course = room ? COURSES[room.settings.course] : undefined
    const holeIndex = room?.holeIndex ?? 0

    useEffect(() => {
        if(leaving.current) return
        if(!room || room.roomPhase === 'lobby') navigate(`/room/${code}`, { replace: true })
    }, [room, code, navigate])

    useEffect(() => {
        const canvas = canvasRef.current
        if(!canvas || !course) return

        const game = startPartyGame(canvas, course, holeIndex, setStatus)
        gameRef.current = game
        return () => game.dispose()
    }, [course, holeIndex])

    const holeDone = room?.holeDone ?? false
    useEffect(() => {
        if(!room || !holeDone || room.pickedUp.includes(room.yourId)) return
        const score = room.scores[room.yourId]?.[room.holeIndex]
        if(score != null) recordScore(room.settings.course, room.holeIndex, score)
    }, [room, holeDone])

    if(!room || !course) return null

    const hole = course.holes[holeIndex]
    const isHost = room.yourId === room.hostId
    const host = room.players.find(p => p.id === room.hostId)
    const [first, last] = holeRange(course.holes.length, room.settings.holes)
    const isLast = holeIndex === last
    const limit = room.settings.timeLimit
    const timeLeft = limit === null ? null : Math.max(0, limit - status.time)

    const exit = () => {
        leaving.current = true
        leave()
        navigate('/party')
    }

    return (
        <>
            <canvas ref={canvasRef} className='touch-none fixed inset-0 w-full h-full block' />
            {!room.holeDone && <Tips hole={hole} />}

            <div className='fixed top-4 inset-x-4 flex items-start justify-between gap-3 pointer-events-none'>
                <div className='font-sans text-ink bg-card shadow-chip rounded-2xl h-13 px-5 flex items-center gap-3.5 whitespace-nowrap'>
                    <span className='hidden md:inline font-black text-xs uppercase tracking-[0.15em] text-sub'>Hole {holeIndex + 1} · Par {hole?.par}</span>
                    <span className='hidden md:block w-0.5 h-6 bg-line' />
                    <span className='font-black text-lg'>Strokes <span className='font-display font-normal text-2xl'>{status.strokes}</span></span>
                    {room.settings.strokeLimit !== null && hole && <span className='font-bold text-sub'>/ {hole.par + room.settings.strokeLimit}</span>}
                </div>

                {timeLeft !== null && !room.holeDone && (
                    <div className={`font-sans bg-card shadow-chip rounded-2xl h-13 px-5 flex items-center font-display text-3xl ${timeLeft <= 10 ? 'text-[#9a3b2e]' : 'text-ink'}`}>
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>
                )}

                <div className='flex flex-wrap justify-end gap-3 pointer-events-auto'>
                    {isHost && !room.holeDone && (
                        <button type='button' onClick={() => send({ type: 'endHole' })} className='font-sans text-ink bg-card shadow-chip rounded-2xl h-13 px-5 font-black whitespace-nowrap'>End hole</button>
                    )}
                    <button type='button' onClick={() => setSettingsOpen(true)} className='font-sans text-ink bg-card shadow-chip rounded-2xl h-13 px-5 font-black'>Settings</button>
                    <button type='button' onClick={exit} className='font-sans text-ink bg-card shadow-chip rounded-2xl h-13 px-5 font-black'>Leave</button>
                </div>
            </div>
            {settingsOpen && <SettingsOverlay onClose={() => setSettingsOpen(false)} />}

            <button
                type='button'
                onPointerDown={() => gameRef.current?.setOverview(true)}
                onPointerUp={() => gameRef.current?.setOverview(false)}
                onPointerLeave={() => gameRef.current?.setOverview(false)}
                onPointerCancel={() => gameRef.current?.setOverview(false)}
                className={`${chip} bottom-5 left-4 font-black select-none touch-none`}
            >
                Hole Overview
            </button>

            {status.watching && !room.holeDone && (
                <div className='fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3'>
                    <span className='rounded-2xl bg-ground/80 text-chalk px-5 h-13 flex items-center font-extrabold whitespace-nowrap'>
                        {status.done ? 'You\'re done · ' : ''}Watching {status.watching}
                    </span>
                    <button type='button' onClick={() => gameRef.current?.watchNext()} className='h-13 px-5 rounded-2xl bg-card text-ink press-card font-black whitespace-nowrap'>
                        Next player
                    </button>
                </div>
            )}

            {room.holeDone && (
                <div className='fixed inset-0 flex flex-col items-center justify-center gap-5 p-4 bg-[radial-gradient(ellipse_at_center,rgb(12_30_20/0.7),rgb(12_30_20/0.3)_70%)] animate-fade-in'>
                    <p className='font-sans font-black uppercase tracking-[0.35em] text-sm text-chalk'>
                        {isLast ? 'Course complete' : `Hole ${holeIndex + 1} complete`}
                    </p>
                    <h1 className='font-display text-7xl sm:text-8xl leading-none text-center text-chalk [text-shadow:0_7px_0_rgb(0_0_0/0.35)] animate-pop-in'>
                        {course.name}
                    </h1>

                    <PartyScorecard course={course} players={room.players} scores={room.scores} from={first} upTo={holeIndex} yourId={room.yourId} />

                    <div className='w-full max-w-md'>
                        {isHost ? (
                            <Button label={isLast ? 'Back to the tee box' : 'Next hole'} onClick={() => send({ type: 'next' })} splash arrow />
                        ) : (
                            <p className='rounded-2xl bg-white/10 text-chalk px-6 py-4 font-extrabold text-center'>
                                Waiting for {host?.name ?? 'the host'} to {isLast ? 'head back' : 'start the next hole'}…
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
