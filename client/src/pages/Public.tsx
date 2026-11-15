import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { maxNameLength } from '@holey/shared'
import { Page } from '../components/Page'
import { Arrow } from '../components/Button'
import { BallPreview } from '../components/BallPreview'
import { useCosmetics } from '../locker/useCosmetics'
import { connect, send } from '../network/connection'
import { useConnection } from '../network/useConnection'
import { getCosmetics } from '../locker/store'
import { loadName, saveName } from '../locker/name'

export function Public(){
    const navigate = useNavigate()
    const connection = useConnection()
    const cosmetics = useCosmetics()
    const [name, setName] = useState(loadName)
    const [searching, setSearching] = useState(false)

    useEffect(() => { connect() }, [])

    useEffect(() => {
        if(connection.room) navigate(`/room/${connection.room.code}`)
    }, [connection.room, navigate])

    const open = connection.status === 'open'
    const trimmed = name.trim()

    const find = () => {
        saveName(trimmed)
        setSearching(true)
        send({ type: 'quickplay', name: trimmed, cosmetics: getCosmetics() })
    }

    return (
        <Page title='Public' subtitle='Play with strangers. Results may vary.'>
            <div className='bg-card text-ink rounded-3xl shadow-card px-6 sm:px-8 py-10 flex flex-col items-center text-center gap-6'>
                <BallPreview cosmetics={cosmetics} view={34} className='size-16' />
                <h2 className='font-display text-5xl'>Quick play</h2>
                <p className='text-lg text-sub max-w-md'>Jump into an open tee box with other players, or start one that others can find.</p>
                <input
                    aria-label='Your name'
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={maxNameLength}
                    placeholder='Your name'
                    className='h-14 w-full max-w-sm rounded-2xl bg-white border-3 border-line px-5 font-extrabold text-xl text-center text-ink outline-none focus:border-putt placeholder:text-sub/60 placeholder:font-normal'
                />
                <button
                    type='button'
                    onClick={find}
                    disabled={!open || !trimmed || searching}
                    className='h-16 w-full max-w-sm px-7 rounded-2xl flex items-center justify-between bg-putt text-putt-ink press-putt font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {searching ? 'Finding a game…' : 'Find a game'} <Arrow />
                </button>
                {connection.status === 'closed' && <p className='font-extrabold text-[#b3261e]'>Can't reach the server.</p>}
            </div>
        </Page>
    )
}
