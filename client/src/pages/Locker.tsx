
import type { ReactNode } from 'react'
import { BALL_COLORS, HATS, CELEBRATIONS, type BallColor } from '@holey/shared'
import { Page } from '../components/Page'
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
            className={`${picked ? 'bg-putt text-putt-ink border-ink press-ghost' : 'bg-white border-line hover:border-ink/40 cursor-pointer'} rounded-2xl p-3 border-3 flex flex-col items-center gap-1 font-black transition-colors`}
        >
            {children}
            <span>{label}</span>
        </button>
    )
}

export function Locker(){

    const cosmetics = useCosmetics()

    return (
        <Page title='Locker' subtitle='Dress up your ball. Everyone in your party sees what you pick.'>
            <div className='grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 items-start'>
                <section className='md:sticky md:top-6 rounded-3xl border-12 border-card shadow-card overflow-hidden flex flex-col bg-card text-ink'>
                    <BallPreview
                        cosmetics={cosmetics}
                        animate
                        view={170}
                        className='w-full aspect-4/3'
                    />
                    <p className='pt-3 pb-1 text-center font-black text-lg'>
                        {COLOR_NAMES[cosmetics.color]} ball · {HAT_NAMES[cosmetics.hat]} · {CELEBRATION_NAMES[cosmetics.celebration]}
                    </p>
                </section>

                <div className='flex flex-col gap-5'>
                    <SettingsSection title='Ball color'>
                        <div className='grid grid-cols-5 w-fit gap-3 pt-3 pb-5'>
                            {BALL_COLORS.map(color => (
                                <button
                                    key={color}
                                    type='button'
                                    aria-label={COLOR_NAMES[color]}
                                    aria-pressed={cosmetics.color === color}
                                    onClick={() => setCosmetic('color', color)}
                                    style={{ backgroundColor: color }}
                                    className={`${cosmetics.color === color ? 'ring-4 ring-putt border-4 border-ink' : 'border-3 border-line'} size-14 rounded-full ring-offset-2 ring-offset-card shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.12)] transition-shadow`}
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
        </Page>
    )
}
