
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { BALL_COLORS, HATS, CELEBRATIONS, type BallColor } from '@holey/shared'
import { Button } from '../components/Button'
import { SettingsSection } from '../components/SettingsLayout'
import { BallPreview } from '../components/BallPreview'
import { useCosmetics } from '../locker/useCosmetics'
import { setCosmetic } from '../locker/store'
import { HAT_NAMES } from '../game/art/hats'
import { CELEBRATION_NAMES } from '../game/art/celebrations'

const COLOR_NAMES: Record<BallColor, string> = {
    '#ffffff': 'White',
    '#ff5d5d': 'Red',
    '#ff9f1c': 'Orange',
    '#ffd23f': 'Yellow',
    '#2ec4b6': 'Teal',
    '#3a86ff': 'Blue',
    '#9b5de5': 'Purple',
    '#f15bb5': 'Pink',
    '#8d5a3b': 'Brown',
    '#1d3319': 'Forest'
}

type TileProps = {
    label: string
    picked: boolean
    onPick: () => void
    children?: ReactNode
}

function OptionTile({ label, picked, onPick, children }: TileProps){
    return (
        <button
            type='button'
            aria-pressed={picked}
            onClick={onPick}
            className={`${picked ? 'bg-putt text-putt-ink border-putt' : 'bg-sky border-transparent'} rounded-2xl p-3 border-2 flex flex-col items-center gap-1 font-extrabold transition-colors`}
        >
            {children}
            <span>{label}</span>
        </button>
    )
}

export function Locker(){

    const navigate = useNavigate()
    const cosmetics = useCosmetics()

    return (
        <div className='h-full w-full overflow-y-auto bg-sky text-ink'>
            <div className='max-w-6xl px-4 sm:px-14 pt-14 pb-16 flex flex-col gap-7'>
                <header className='flex flex-col gap-3'>
                    <h1 className='text-6xl sm:text-7xl font-bold font-display tracking-wide'>
                        Locker
                    </h1>
                    <p className='text-lg text-sub'>Dress up your ball. Everyone in your party sees what you pick.</p>
                </header>

                <div className='grid md:grid-cols-2 gap-5 items-start'>
                    <section className='md:sticky md:top-6 bg-card rounded-2xl shadow-card p-3 flex flex-col gap-3'>
                        <BallPreview
                            cosmetics={cosmetics}
                            animate
                            view={170}
                            className='w-full aspect-3/2 rounded-xl'
                        />
                        <p className='px-2 pb-1 text-sm text-sub'>
                            {COLOR_NAMES[cosmetics.color]} ball · {HAT_NAMES[cosmetics.hat]} · {CELEBRATION_NAMES[cosmetics.celebration]}
                        </p>
                    </section>

                    <div className='flex flex-col gap-5'>
                        <SettingsSection title='Ball color'>
                            <div className='grid grid-cols-5 w-fit gap-3 pt-3 pb-4'>
                                {BALL_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type='button'
                                        aria-label={COLOR_NAMES[color]}
                                        aria-pressed={cosmetics.color === color}
                                        onClick={() => setCosmetic('color', color)}
                                        style={{ backgroundColor: color }}
                                        className={`${cosmetics.color === color ? 'ring-4 ring-putt' : 'ring-1 ring-ink/15'} size-12 rounded-full ring-offset-2 ring-offset-card shadow-toggle transition-shadow`}
                                    />
                                ))}
                            </div>
                        </SettingsSection>

                        <SettingsSection title='Hat'>
                            <div className='grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-3 pt-3 pb-4'>
                                {HATS.map(hat => (
                                    <OptionTile key={hat} label={HAT_NAMES[hat]} picked={cosmetics.hat === hat} onPick={() => setCosmetic('hat', hat)}>
                                        <BallPreview cosmetics={{...cosmetics, hat}} view={34} className='size-16' />
                                    </OptionTile>
                                ))}
                            </div>
                        </SettingsSection>

                        <SettingsSection title='Celebration' description='Plays at the cup when you sink a putt.'>
                            <div className='grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3 pt-3 pb-4'>
                                {CELEBRATIONS.map(c => (
                                    <OptionTile key={c} label={CELEBRATION_NAMES[c]} picked={cosmetics.celebration === c} onPick={() => setCosmetic('celebration', c)} />
                                ))}
                            </div>
                        </SettingsSection>
                    </div>
                </div>

                <footer className='max-w-lg'>
                    <Button label='Back' onClick={() => {navigate('/')}} splash={true} arrow={true} />
                </footer>
            </div>
        </div>
    )
}
