
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { maxNameLength } from '@holey/shared'
import { Arrow } from '../components/Button'
import { Page } from '../components/Page'
import { BallPreview } from '../components/BallPreview'
import { useCosmetics } from '../locker/useCosmetics'
import { connect, send } from '../network/connection'
import { useConnection } from '../network/useConnection'
import { ERROR_TEXT } from '../network/errorText'
import { getCosmetics } from '../locker/store'
import { loadName, saveName } from '../locker/name'

const CODE_LENGTH = 4

const inputClass = 'h-14 w-full rounded-2xl bg-white border-3 border-line px-5 font-extrabold text-xl text-ink outline-none focus:border-putt placeholder:text-sub/60 placeholder:font-normal'

export function Party(){

    const navigate = useNavigate()
    const connection = useConnection()
    const cosmetics = useCosmetics()

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

    const status = connection.status === 'open' ? 'Connected' : connection.status === 'closed' ? 'Offline' : 'Connecting…'

    return (
        <Page
            title='Party'
            subtitle='Up to 4 friends, one course, everyone putting at once.'
            aside={
                <span className='flex items-center gap-2 font-extrabold text-sm text-ground-sub'>
                    <span className={`size-2.5 rounded-full ${open ? 'bg-[#6cc04a]' : 'bg-track'}`} />{status}
                </span>
            }
        >
            {connection.status === 'closed' && (
                <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card text-ink shadow-chip px-6 py-4'>
                    <span className='font-extrabold'>Can't reach the server.</span>
                    <button type='button' onClick={connect} className='rounded-full bg-putt text-putt-ink font-black px-5 py-2'>
                        Try again
                    </button>
                </div>
            )}

            <div className='bg-card text-ink rounded-3xl shadow-card px-6 sm:px-7 py-5 flex flex-wrap items-center gap-5'>
                <BallPreview cosmetics={cosmetics} view={34} className='size-14 shrink-0' />
                <label className='flex-[1_1_18rem] flex flex-col gap-1.5'>
                    <span className='font-black text-xs uppercase tracking-[0.2em] text-sub'>Your name</span>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        maxLength={maxNameLength}
                        placeholder='Name'
                        className={inputClass}
                    />
                </label>
                <Link to='/locker' className='font-extrabold text-brand underline'>Change ball</Link>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
                <section className='bg-card text-ink rounded-3xl shadow-card p-7 sm:p-8 flex flex-col gap-5'>
                    <div className='flex flex-col gap-1.5'>
                        <h2 className='font-display text-4xl'>Start a party</h2>
                        <p className='text-lg text-sub'>You'll be the host and get a code to share.</p>
                    </div>
                    <div className='grow' />
                    <button
                        type='button'
                        onClick={create}
                        disabled={!open || !nameOk}
                        className='h-17 rounded-2xl px-6 flex items-center justify-between bg-putt text-putt-ink press-putt font-black text-xl transition-transform active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        Create party <Arrow />
                    </button>
                </section>

                <section className='bg-card text-ink rounded-3xl shadow-card p-7 sm:p-8 flex flex-col gap-5'>
                    <div className='flex flex-col gap-1.5'>
                        <h2 className='font-display text-4xl'>Join a party</h2>
                        <p className='text-lg text-sub'>Type the 4-letter code your friend sent.</p>
                    </div>
                    <form
                        className='flex flex-col gap-5'
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
                            className={`${inputClass} h-19 text-center font-display text-5xl tracking-[0.5em] uppercase`}
                        />
                        <button
                            type='submit'
                            disabled={!open || !nameOk || !codeOk}
                            className='h-17 rounded-2xl px-6 flex items-center justify-between bg-putt text-putt-ink press-putt font-black text-xl transition-transform active:translate-y-1 disabled:bg-line disabled:text-sub disabled:shadow-[0_6px_0_var(--color-card-deep)] disabled:cursor-not-allowed'
                        >
                            Join <Arrow />
                        </button>
                    </form>
                    {connection.error && (
                        <p role='alert' className='-mt-1 font-extrabold text-[#b3261e]'>
                            {ERROR_TEXT[connection.error]}
                        </p>
                    )}
                </section>
            </div>
        </Page>
    )
}
