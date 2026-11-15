
import { Link } from 'react-router'
import { Page } from '../components/Page'
import { Arrow } from '../components/Button'

export function Public(){

    return (
        <Page title='Public' subtitle='Play with strangers. Results may vary.'>
            <div className='bg-card text-ink rounded-3xl shadow-card px-8 py-14 flex flex-col items-center text-center gap-5'>
                <h2 className='font-display text-5xl'>Still mowing this one</h2>
                <p className='text-lg text-sub max-w-md'>Public matchmaking isn't open yet. Start a party and send the code to a friend instead.</p>
                <Link to='/party' className='flex items-center gap-3 h-16 px-7 rounded-2xl bg-putt text-putt-ink press-putt font-black text-xl transition-transform active:translate-y-1'>
                    Go to Party <Arrow />
                </Link>
            </div>
        </Page>
    )
}
