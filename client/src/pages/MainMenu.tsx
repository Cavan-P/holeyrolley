
import { Link } from 'react-router'
import { Arrow } from '../components/Button'

const big = 'flex items-center gap-3 h-16 px-5 rounded-2xl font-black text-lg transition-transform active:translate-y-1'
const small = 'flex items-center gap-3 h-14 px-5 rounded-2xl font-extrabold transition-transform active:translate-y-1'

export function MainMenu(){

    return (
        <div className='flex flex-col min-h-full w-full bg-mowed text-chalk overflow-y-auto'>
            <div className='grow w-full max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-10 flex flex-wrap items-center gap-16'>
                <div className='flex-[1_1_28rem] min-w-0 flex flex-col gap-9'>
                    <div className='flex flex-col gap-4'>
                        <h1 className='font-display text-8xl sm:text-9xl leading-[0.9]'>
                            Holey<br /><span className='text-putt'>Rolley</span>
                        </h1>
                        <p className='text-xl text-ground-sub max-w-md'>
                            Sometimes games are better with friends.  Then again, sometimes they aren't.
                        </p>
                    </div>

                    <div className='flex flex-col gap-4 max-w-md'>
                        <Link to='/courses' className='flex items-center justify-between gap-4 min-h-21 px-7 rounded-3xl bg-putt text-putt-ink press-putt transition-transform active:translate-y-1'>
                            <span className='flex flex-col'>
                                <span className='font-black text-2xl'>Singleplayer</span>
                                <span className='font-bold opacity-80'>Pick a course and hole</span>
                            </span>
                            <Arrow />
                        </Link>
                        <div className='grid grid-cols-2 gap-4'>
                            <Link to='/party' className={`${big} bg-card text-ink press-card`}>Party</Link>
                            <Link to='/public' className={`${big} bg-card text-ink press-card`}>Public</Link>
                            <Link to='/locker' className={`${small} bg-white/8 press-ghost`}>Locker</Link>
                            <Link to='/settings' className={`${small} bg-white/8 press-ghost`}>Settings</Link>
                        </div>
                    </div>
                </div>

                <div aria-hidden='true' className='flex-[1_1_30rem] min-w-0 flex justify-center'>
                    <div className='relative w-full max-w-xl aspect-[1.15] -rotate-4'>
                        <div className='absolute inset-0 rounded-[48px] border-14 border-card shadow-card bg-[repeating-linear-gradient(0deg,#6cc04a_0_40px,#74c652_40px_80px)]' />
                        <div className='absolute left-[30%] top-[36%] w-[24%] h-[18%] rounded-[20px] bg-[#3e9bd6] border-6 border-[#2f7fb3]' />
                        <div className='absolute left-[62%] top-[16%] size-11 rounded-full bg-hole-in shadow-[inset_0_6px_0_rgba(0,0,0,0.5)]' />
                        <div className='absolute left-[calc(62%+20px)] top-[calc(16%-74px)] w-1 h-24 rounded-sm bg-chalk' />
                        <div className='absolute left-[calc(62%+24px)] top-[calc(16%-74px)] border-y-[18px] border-y-transparent border-l-40 border-l-flag' />
                        <div className='absolute left-[20%] top-[74%] w-52 border-t-5 border-dotted border-white/85 origin-left -rotate-38' />
                        <div className='absolute left-[calc(20%-16px)] top-[calc(74%-16px)] size-8 rounded-full bg-white shadow-chip' />
                    </div>
                </div>
            </div>

            <footer className='w-full max-w-7xl mx-auto px-4 sm:px-8 pb-6 flex flex-wrap justify-between gap-3 text-sm font-bold tracking-widest text-ground-sub'>
                <p>A game by Cavan P</p>
                <p className='flex gap-6'>
                    {import.meta.env.DEV && <Link to='/editor' className='hover:text-chalk'>Level editor</Link>}
                    <span>Version {__APP_VERSION__}</span>
                </p>
            </footer>
        </div>
    )
}
