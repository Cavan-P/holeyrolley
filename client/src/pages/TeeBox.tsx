
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { COURSES, HOLE_RANGES, STROKE_LIMITS, TIME_LIMITS, holeRange, maxPlayers, type ObstacleKind, type Player } from '@holey/shared'
import { Arrow, Button } from '../components/Button'
import { BallPreview } from '../components/BallPreview'
import { HolePreview } from '../components/HolePreview'
import { Toggle } from '../components/SettingsControls'
import { connect, leave, rejoinToken, send } from '../network/connection'
import { useConnection } from '../network/useConnection'
import { ERROR_TEXT } from '../network/errorText'
import { getCosmetics } from '../locker/store'
import { loadName } from '../locker/name'
import { startLobby } from '../game/lobby'

function PlayerRow({ player, you, host }: { player: Player, you: boolean, host: boolean }){
    return (
        <li className='flex items-center gap-3.5 h-15 border-t-2 border-line first:border-t-0'>
            <BallPreview cosmetics={player.cosmetics} view={34} className='size-11 shrink-0' />
            <span className='font-black text-lg truncate'>{player.name}</span>
            <span className='ml-auto flex gap-2 shrink-0'>
                {you && <span className='rounded-full bg-ink text-card px-3 py-1 text-xs font-black uppercase tracking-wider'>You</span>}
                {host && <span className='rounded-full bg-putt text-putt-ink px-3 py-1 text-xs font-black uppercase tracking-wider'>Host</span>}
            </span>
        </li>
    )
}

const OBSTACLE_NAMES: Record<ObstacleKind, string> = {
    post: 'Post',
    bumper: 'Bumper',
    sand: 'Sand trap',
    water: 'Pond',
    wall: 'Wall'
}

function Choices<T extends string | number | null>({ label, description, options, value, labelOf, onPick }: { label: string, description: string, options: readonly T[], value: T, labelOf: (v: T) => string, onPick: ((v: T) => void) | null }){
    return (
        <div className='flex flex-col gap-2.5 pt-3 border-t-2 border-line'>
            <div className='flex flex-col'>
                <span className='font-black text-lg'>{label}</span>
                <span className='text-sub'>{description}</span>
            </div>
            {onPick ? (
                <div className='flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-line'>
                    {options.map(o => (
                        <button
                            key={String(o)}
                            type='button'
                            aria-pressed={o === value}
                            onClick={() => onPick(o)}
                            className={`${o === value ? 'bg-ink text-card font-black' : 'font-extrabold'} flex-1 h-10 px-2 rounded-xl text-sm whitespace-nowrap`}
                        >
                            {labelOf(o)}
                        </button>
                    ))}
                </div>
            ) : (
                <span className='self-start rounded-full bg-line px-4 py-1.5 font-black'>{labelOf(value)}</span>
            )}
        </div>
    )
}

function Notice({ text, action, onAction }: { text: string, action?: string, onAction?: () => void }){
    return (
        <div className='h-full w-full overflow-y-auto bg-mowed text-chalk'>
            <div className='max-w-xl px-4 sm:px-8 pt-14 flex flex-col gap-5'>
                <h1 className='font-display text-7xl sm:text-8xl'>Tee Box</h1>
                <p className='text-xl text-ground-sub'>{text}</p>
                {action && onAction && <Button label={action} onClick={onAction} splash={true} arrow={true} />}
            </div>
        </div>
    )
}

export function TeeBox(){

    const navigate = useNavigate()
    const { code = '' } = useParams()
    const connection = useConnection()
    const room = connection.room

    const triedJoin = useRef(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const lobbyRef = useRef<ReturnType<typeof startLobby> | null>(null)
    const [copied, setCopied] = useState(false)
    const [placing, setPlacing] = useState(false)

    useEffect(() => { connect() }, [])

    useEffect(() => {
        if(room || connection.status !== 'open' || triedJoin.current) return
        triedJoin.current = true

        const name = loadName().trim()
        if(!name){
            navigate(`/party?code=${code}`, { replace: true })
            return
        }

        send({ type: 'join', room: code, name, cosmetics: getCosmetics(), token: rejoinToken(code) })
    }, [room, connection.status, code, navigate])

    useEffect(() => {
        if(room && room.code !== code.toUpperCase()) navigate(`/room/${room.code}`, { replace: true })
    }, [room, code, navigate])

    useEffect(() => {
        if(room?.roomPhase === 'playing') navigate(`/room/${room.code}/play`)
    }, [room, navigate])

    const inRoom = room !== null

    useEffect(() => {
        const canvas = canvasRef.current
        if(!canvas) return

        const lobby = startLobby(canvas, () => setPlacing(false))
        lobbyRef.current = lobby
        return () => lobby.dispose()
    }, [inRoom])

    const backToParty = () => navigate(`/party?code=${code}`)

    if(!room){
        if(connection.error) return <Notice text={ERROR_TEXT[connection.error]} action='Back to Party' onAction={backToParty} />
        if(connection.status === 'closed') return <Notice text="Lost the connection to the server." action='Back to Party' onAction={backToParty} />
        return <Notice text={`Joining ${code.toUpperCase()}…`} />
    }

    const isHost = room.yourId === room.hostId
    const host = room.players.find(p => p.id === room.hostId)
    const openSlots = Math.max(0, maxPlayers - room.players.length)
    const me = room.players.find(p => p.id === room.yourId)
    const placed = room.pieces.some(p => p.owner === room.yourId)

    const togglePlacing = () => {
        lobbyRef.current?.setPlacing(!placing)
        setPlacing(!placing)
    }

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${location.origin}/room/${room.code}`)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        }
        catch {}
    }

    const leaveParty = () => {
        leave()
        navigate('/party')
    }

    const settings = room.settings
    const course = COURSES[settings.course]
    const update = (next: Partial<typeof settings>) => send({ type: 'update', settings: { ...settings, ...next } })

    return (
        <div className='h-full w-full overflow-y-auto bg-mowed text-chalk'>
            <div className='max-w-[1600px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-7'>
                <header className='flex flex-wrap items-center justify-between gap-5'>
                    <div className='flex flex-wrap items-center gap-5'>
                        <span className='font-black text-sm uppercase tracking-[0.25em] text-ground-sub'>Party code</span>
                        <div className='flex gap-2' aria-label={`Party code ${room.code}`}>
                            {room.code.split('').map((c, i) => (
                                <span key={i} className='w-16 h-19 rounded-2xl bg-card text-ink press-card grid place-items-center font-display text-5xl'>{c}</span>
                            ))}
                        </div>
                        <button
                            type='button'
                            onClick={copyLink}
                            className='h-12 px-5 rounded-full bg-white/10 hover:bg-white/24 hover:ring-2 hover:ring-white/40 cursor-pointer transition font-extrabold'
                        >
                            {copied ? 'Link copied!' : 'Copy invite link'}
                        </button>
                    </div>
                    <button type='button' onClick={leaveParty} className='h-12 px-5 rounded-full bg-white/8 hover:bg-white/24 hover:ring-2 hover:ring-white/40 cursor-pointer transition font-extrabold'>
                        Leave party
                    </button>
                </header>

                <div className='grid lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] gap-6 items-start'>
                    <div className='flex flex-col gap-5'>
                        <section className='bg-card text-ink rounded-3xl shadow-card px-6 pt-5 pb-2'>
                            <h2 className='font-display text-3xl pb-2'>Players {room.players.length}/{maxPlayers}</h2>
                            <ul>
                                {room.players.map(p => (
                                    <PlayerRow key={p.id} player={p} you={p.id === room.yourId} host={p.id === room.hostId} />
                                ))}
                                {Array.from({ length: openSlots }, (_, i) => (
                                    <li key={`open-${i}`} className='flex items-center gap-3.5 h-15 border-t-2 border-line text-sub'>
                                        <div className='size-10 mx-0.5 shrink-0 rounded-full border-3 border-dashed border-card-deep' />
                                        <span className='font-bold'>Waiting for a friend…</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className='bg-card text-ink rounded-3xl shadow-card p-6 flex flex-col gap-3'>
                            <div className='flex items-baseline justify-between gap-3'>
                                <h2 className='font-display text-3xl'>Course</h2>
                                <span className='text-sm font-extrabold text-sub'>{isHost ? 'Only you can change these' : `${host?.name ?? 'The host'} picks these`}</span>
                            </div>
                            {Object.entries(COURSES).map(([id, c]) => {
                                const picked = id === settings.course
                                if(!isHost && !picked) return null

                                return (
                                    <button
                                        key={id}
                                        type='button'
                                        disabled={!isHost}
                                        aria-pressed={picked}
                                        onClick={() => update({ course: id })}
                                        className={`${picked ? 'bg-white border-putt' : 'border-line'} flex items-center gap-3 min-h-15 p-2 pr-3 rounded-2xl border-3 text-left disabled:cursor-default`}
                                    >
                                        <HolePreview course={c} hole='showcase' className='w-14 h-11 shrink-0 rounded-xl' />
                                        <span className='flex flex-col'>
                                            <span className='font-black'>{c.name}</span>
                                            <span className='text-sm font-bold text-sub'>{c.holes.length} holes</span>
                                        </span>
                                    </button>
                                )
                            })}
                            <div className='flex items-center justify-between gap-4 pt-3 border-t-2 border-line'>
                                <div className='flex flex-col'>
                                    <span className='font-black text-lg'>Ball collision</span>
                                    <span className='text-sub'>Balls bump into each other.</span>
                                </div>
                                {isHost ? (
                                    <Toggle label='Ball collision' on={settings.collision} onChange={on => update({ collision: on })} />
                                ) : (
                                    <span className='rounded-full bg-line px-4 py-1.5 font-black'>{settings.collision ? 'On' : 'Off'}</span>
                                )}
                            </div>
                            <Choices
                                label='Holes'
                                description='Play the whole course or half of it.'
                                options={HOLE_RANGES}
                                value={settings.holes}
                                labelOf={v => v === 'all' ? `All ${course?.holes.length ?? ''}` : v === 'front' ? 'Front 9' : 'Back 9'}
                                onPick={isHost ? v => update({ holes: v }) : null}
                            />
                            <Choices
                                label='Stroke limit'
                                description='Pick up your ball after this many.'
                                options={STROKE_LIMITS}
                                value={settings.strokeLimit}
                                labelOf={v => v === null ? 'Off' : `Par +${v}`}
                                onPick={isHost ? v => update({ strokeLimit: v }) : null}
                            />
                            <Choices
                                label='Time limit'
                                description='Per hole. Anyone still putting gets picked up.'
                                options={TIME_LIMITS}
                                value={settings.timeLimit}
                                labelOf={v => v === null ? 'Off' : v % 60 ? `${v}s` : `${v / 60} min`}
                                onPick={isHost ? v => update({ timeLimit: v }) : null}
                            />
                        </section>

                        {isHost ? (
                            <button
                                type='button'
                                onClick={() => send({ type: 'start' })}
                                className='min-h-19 rounded-3xl px-6 flex items-center justify-between gap-4 bg-putt text-putt-ink press-putt text-left transition-transform active:translate-y-1'
                            >
                                <span className='flex flex-col'>
                                    <span className='font-black text-2xl'>Start game</span>
                                    {course && <span className='font-bold opacity-80'>{course.name} · {settings.holes === 'all' ? `all ${course.holes.length} holes` : settings.holes === 'front' ? `holes 1–${holeRange(course.holes.length, 'front')[1] + 1}` : `holes ${holeRange(course.holes.length, 'back')[0] + 1}–${course.holes.length}`}</span>}
                                </span>
                                <Arrow />
                            </button>
                        ) : (
                            <p className='rounded-2xl bg-white/8 px-6 py-4 font-extrabold'>
                                Waiting for {host?.name ?? 'the host'} to start…
                            </p>
                        )}
                    </div>

                    <div className='relative lg:sticky lg:top-6 h-[75vh] min-h-[420px] rounded-[32px] overflow-hidden border-12 border-card shadow-card'>
                        <canvas ref={canvasRef} className='absolute inset-0 block w-full h-full touch-none' />
                        <span className='absolute left-4 top-4 rounded-full bg-ground/75 px-4 py-2 font-black text-sm tracking-[0.15em] pointer-events-none'>PRACTICE GREEN</span>
                        {me && (
                            <div className='absolute left-4 bottom-4 right-4 flex flex-wrap items-center gap-3 pointer-events-none'>
                                <button
                                    type='button'
                                    onClick={togglePlacing}
                                    className={`${placing ? 'bg-ink text-card' : 'bg-card text-ink'} pointer-events-auto h-12 px-5 rounded-2xl shadow-chip font-black`}
                                >
                                    {placing ? 'Cancel' : `${placed ? 'Move' : 'Place'} your ${OBSTACLE_NAMES[me.obstacle].toLowerCase()}`}
                                </button>
                                {placing && <span className='rounded-full bg-ground/75 px-4 py-2 font-extrabold text-sm'>Click the green to drop it</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
