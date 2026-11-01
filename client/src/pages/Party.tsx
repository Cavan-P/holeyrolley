
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { maxNameLength } from '@holey/shared'
import { Button } from '../components/Button'
import { SettingsSection } from '../components/SettingsLayout'
import { connect, send } from '../network/connection'
import { useConnection } from '../network/useConnection'
import { ERROR_TEXT } from '../network/errorText'
import { getCosmetics } from '../locker/store'
import { loadName, saveName } from '../locker/name'

const CODE_LENGTH = 4

const inputClass = 'h-14 w-full rounded-xl bg-sky px-5 font-bold text-lg outline-none ring-putt focus:ring-4 placeholder:text-sub/60 placeholder:font-normal'

export function Party(){

    const navigate = useNavigate()
    const connection = useConnection()

    const [params] = useSearchParams()

    const [name, setName] = useState(loadName)
    const [code, setCode] = useState(() => (params.get('code') ?? '').toUpperCase().slice(0, CODE_LENGTH))

    useEffect(() => { connect() }, [])

    useEffect(() => {
        if(connection.room) navigate(`/room/${connection.room.code}`)
    }, [connection.room, navigate])

    const open = connection.status === 'open'
    const trimmed = name.trim()
    const nameOk = trimmed.length > 0
    const codeOk = code.trim().length === CODE_LENGTH

    const create = () => {
        saveName(trimmed)
        send({ type: 'create', name: trimmed, cosmetics: getCosmetics() })
    }

    const join = () => {
        saveName(trimmed)
        send({ type: 'join', room: code.trim(), name: trimmed, cosmetics: getCosmetics() })
    }

    return (
        <div className='h-full w-full overflow-y-auto bg-sky text-ink'>
            <div className='max-w-6xl px-4 sm:px-14 pt-14 pb-16 flex flex-col gap-7'>
                <header className='flex flex-col gap-3'>
                    <h1 className='text-6xl sm:text-7xl font-bold font-display tracking-wide'>
                        Party
                    </h1>
                    <p className='text-lg text-sub'>Start a party and share the code, or join a friend's.</p>
                </header>

                {connection.status === 'closed' && (
                    <div className='max-w-xl flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card shadow-card px-6 py-4'>
                        <span className='font-bold'>Can't reach the server.</span>
                        <button type='button' onClick={connect} className='rounded-full bg-putt text-putt-ink font-extrabold px-5 py-2'>
                            Try again
                        </button>
                    </div>
                )}

                <div className='max-w-xl flex flex-col gap-5'>
                    <SettingsSection title='Your name' description='What the rest of the party sees.'>
                        <div className='pt-3 pb-4'>
                            <input
                                aria-label='Your name'
                                value={name}
                                onChange={e => setName(e.target.value)}
                                maxLength={maxNameLength}
                                placeholder='Name'
                                className={inputClass}
                            />
                        </div>
                    </SettingsSection>

                    <SettingsSection title='Start a party' description='You get a code to share with up to three friends.'>
                        <div className='pt-3 pb-4'>
                            <button
                                type='button'
                                onClick={create}
                                disabled={!open || !nameOk}
                                className='h-14 w-full rounded-xl bg-putt text-putt-ink font-extrabold text-left px-6 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                Create party
                            </button>
                        </div>
                    </SettingsSection>

                    <SettingsSection title='Join a party' description='Type the code your friend shared.'>
                        <form
                            className='flex gap-3 pt-3 pb-4'
                            onSubmit={e => {
                                e.preventDefault()
                                if(open && nameOk && codeOk) join()
                            }}
                        >
                            <input
                                aria-label='Party code'
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                maxLength={CODE_LENGTH}
                                placeholder='CODE'
                                autoCapitalize='characters'
                                autoComplete='off'
                                spellCheck={false}
                                className={`${inputClass} font-display tracking-[0.3em] uppercase`}
                            />
                            <button
                                type='submit'
                                disabled={!open || !nameOk || !codeOk}
                                className='h-14 shrink-0 rounded-xl bg-card ring-2 ring-ink/15 font-extrabold px-6 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                Join
                            </button>
                        </form>
                        {connection.error && (
                            <p role='alert' className='pb-4 -mt-1 text-sm font-bold text-[#b3261e] dark:text-flag'>
                                {ERROR_TEXT[connection.error]}
                            </p>
                        )}
                    </SettingsSection>
                </div>

                <footer className='max-w-xl'>
                    <Button label='Back' onClick={() => {navigate('/')}} splash={true} arrow={true} />
                </footer>
            </div>
        </div>
    )
}
