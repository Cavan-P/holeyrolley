
import { Button } from '../components/Button'
import { useNavigate } from 'react-router'

export function MainMenu(){

    const navigate = useNavigate()

    return (
        <div className='flex flex-col min-h-screen w-full h-full bg-sky text-ink'>
            <div className='grow'>
                <div className="gap-3 w-80 pl-14 pt-14 pb-7">
                    <h1 className="text-7xl font-bold font-display tracking-wide">
                        Holey <span className="text-brand">Rolley</span>
                    </h1>
                </div>

                <p className="text-sub text-lg font-normal w-100 pl-14">
                    Sometimes games are better with friends.  Then again, sometimes they aren't.
                </p>
                <div className='grid grid-cols-2 gap-3 w-100 p-14'>
                    <div className='col-span-2'>
                        <Button label='Singleplayer' onClick={() => {navigate('/play')}} splash={true} arrow={true} />
                    </div>
                    <Button label='Public' onClick={() => {navigate('/public')}} />
                    <Button label='Party' onClick={() => {navigate('/party')}} />
                    <Button label='Locker' onClick={() => {navigate('/locker')}} />
                    <Button label='Settings' onClick={() => {navigate('/settings')}} />
                    <div className='col-span-2'>
                        <Button label='Level editor' onClick={() => {navigate('/editor')}} arrow={true} />
                    </div>
                </div>
            </div>
            <footer className='p-4 pb-1 text-sm tracking-widest flex flex-row justify-between'>
                <p>A game by Cavan P</p>
                <p>Version {__APP_VERSION__}</p>
            </footer>
        </div>
    )
}
