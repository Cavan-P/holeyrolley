
import { Button } from '../components/Button'
import { useNavigate } from 'react-router'

export function Settings(){

    const navigate = useNavigate()

    return (
        <div className='flex flex-col min-h-screen w-full h-full bg-sky text-ink'>
            <div className='grow'>
                <div className="gap-3 w-80 pl-14 pt-14 pb-7">
                    <h1 className="text-7xl font-bold font-display tracking-wide">
                        Settings
                    </h1>
                </div>
                <div className='grid grid-cols-2 gap-3 w-100 p-14'>
                    <div className='col-span-2'>
                        <Button label='Back' onClick={() => {navigate('/')}} splash={true} arrow={true} />
                    </div>
                </div>
            </div>
        </div>
    )
}
