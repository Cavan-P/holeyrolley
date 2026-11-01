
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { maxPlayers, type Player } from '@holey/shared'
import { Button } from '../components/Button'
import { BallPreview } from '../components/BallPreview'
import { SettingsSection, SettingRow } from '../components/SettingsLayout'
import { Toggle } from '../components/SettingsControls'
import { connect, leave, send } from '../network/connection'
import { useConnection } from '../network/useConnection'
import { ERROR_TEXT } from '../network/errorText'
import { getCosmetics } from '../locker/store'
import { loadName } from '../locker/name'

function PlayerRow({ player, you, host }: { player: Player, you: boolean, host: boolean }){
    return (
        <li className='flex items-center gap-4 py-3 border-t border-ink/10'>
            <div className='size-12 shrink-0 rounded-full bg-sky grid place-items-center'>
                <BallPreview cosmetics={player.cosmetics} view={34} className='size-12' />
            </div>
            <span className='font-extrabold text-lg truncate'>{player.name}</span>
            <span className='ml-auto flex gap-2 shrink-0'>
                {host && <span className='rounded-full bg-putt text-putt-ink px-3 py-1 text-xs font-extrabold uppercase tracking-wider'>Host</span>}
                {you && <span className='rounded-full bg-track px-3 py-1 text-xs font-extrabold uppercase tracking-wider'>You</span>}
            </span>
        </li>
    )
}

function Notice({ text, action, onAction }: { text: string, action?: string, onAction?: () => void }){
    return (
        <div className='h-full w-full overflow-y-auto bg-sky text-ink'>
            <div className='max-w-xl px-4 sm:px-14 pt-14 flex flex-col gap-5'>
                <h1 className='text-6xl sm:text-7xl font-bold font-display tracking-wide'>Tee Box</h1>
                <p className='text-lg text-sub'>{text}</p>
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
    const [copied, setCopied] = useState(false)

    useEffect(() => { connect() }, [])

    useEffect(() => {
        if(room || connection.status !== 'open' || triedJoin.current) return
        triedJoin.current = true

        const name = loadName().trim()
        if(!name){
            navigate(`/party?code=${code}`, { replace: true })
            return
        }

        send({ type: 'join', room: code, name, cosmetics: getCosmetics() })
    }, [room, connection.status, code, navigate])

    useEffect(() => {
        if(room && room.code !== code.toUpperCase()) navigate(`/room/${room.code}`, { replace: true })
    }, [room, code, navigate])

    const backToParty = () => navigate(`/party?code=${code}`)

    if(!room){
        if(connection.error) return <Notice text={ERROR_TEXT[connection.error]} action='Back to Party' onAction={backToParty} />
        if(connection.status === 'closed') return <Notice text="Lost the connection to the server." action='Back to Party' onAction={backToParty} />
        return <Notice text={`Joining ${code.toUpperCase()}…`} />
    }

    const isHost = room.yourId === room.hostId
    const host = room.players.find(p => p.id === room.hostId)
    const openSlots = Math.max(0, maxPlayers - room.players.length)

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

    return (
        <div className='h-full w-full overflow-y-auto bg-sky text-ink'>
            <div className='max-w-6xl px-4 sm:px-14 pt-14 pb-16 flex flex-col gap-7'>
                <header className='flex flex-col gap-2'>
                    <p className='text-sm font-extrabold uppercase tracking-[0.3em] text-sub'>Party code</p>
                    <div className='flex flex-wrap items-center gap-x-6 gap-y-3'>
                        <h1 className='text-7xl sm:text-8xl font-bold font-display tracking-[0.15em]'>{room.code}</h1>
                        <button
                            type='button'
                            onClick={copyLink}
                            className='rounded-full bg-card shadow-card px-5 py-2.5 font-extrabold'
                        >
                            {copied ? 'Link copied!' : 'Copy invite link'}
                        </button>
                    </div>
                </header>

                <div className='grid md:grid-cols-2 gap-5 items-start'>
                    <SettingsSection title={`Players (${room.players.length}/${maxPlayers})`}>
                        <ul className='pt-2 pb-1'>
                            {room.players.map(p => (
                                <PlayerRow key={p.id} player={p} you={p.id === room.yourId} host={p.id === room.hostId} />
                            ))}
                            {Array.from({ length: openSlots }, (_, i) => (
                                <li key={`open-${i}`} className='flex items-center gap-4 py-3 border-t border-ink/10 text-sub'>
                                    <div className='size-12 shrink-0 rounded-full border-2 border-dashed border-ink/20' />
                                    <span>Waiting for a friend…</span>
                                </li>
                            ))}
                        </ul>
                    </SettingsSection>

                    <div className='flex flex-col gap-5'>
                        <SettingsSection title='Room settings' description={isHost ? 'Only you can change these.' : `${host?.name ?? 'The host'} picks these.`}>
                            <SettingRow label='Ball collision' description='Balls bump into each other.'>
                                {isHost ? (
                                    <Toggle
                                        label='Ball collision'
                                        on={room.settings.collision}
                                        onChange={on => send({ type: 'update', settings: { collision: on } })}
                                    />
                                ) : (
                                    <span className='rounded-full bg-track px-4 py-1.5 font-extrabold'>{room.settings.collision ? 'On' : 'Off'}</span>
                                )}
                            </SettingRow>
                        </SettingsSection>

                        <div className='flex flex-col gap-3'>
                            {isHost ? (
                                <button
                                    type='button'
                                    disabled
                                    className='h-14 w-full rounded-xl bg-putt text-putt-ink font-extrabold text-left px-6 disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    Start game
                                </button>
                            ) : (
                                <p className='rounded-xl bg-card shadow-card px-6 py-4 font-bold'>
                                    Waiting for {host?.name ?? 'the host'} to start…
                                </p>
                            )}
                            <Button label='Leave party' onClick={leaveParty} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
