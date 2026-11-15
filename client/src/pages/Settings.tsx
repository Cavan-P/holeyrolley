
import { Button } from '../components/Button'
import { Page } from '../components/Page'
import { SettingsSection, SettingRow } from '../components/SettingsLayout'
import { Toggle, Segmented, VolumeSlider, TrackTile } from '../components/SettingsControls'
import { usePrefs } from '../settings/useSetting'
import { setPref, resetPrefs, type Prefs } from '../settings/store'
import { TRACKS } from '../audio/tracks'

const SHOT_OPTIONS = [
    { value: 'back', label: 'Pull back' },
    { value: 'front', label: 'Push forward' }
] as const satisfies readonly { value: Prefs['dragDirection'], label: string }[]

const SECTIONS = [
    { id: 'controls', label: 'Controls' },
    { id: 'audio', label: 'Audio' },
    { id: 'soundtrack', label: 'Soundtrack' },
    { id: 'display', label: 'Display' },
    { id: 'multiplayer', label: 'Multiplayer' }
]

export function Settings(){

    return (
        <Page title='Settings' subtitle='Changes save as you make them.'>
            <div className='flex flex-wrap gap-7 items-start'>
                <nav className='flex-[1_1_12rem] md:sticky md:top-6 flex md:flex-col flex-wrap gap-1.5'>
                    {SECTIONS.map(s => (
                        <a key={s.id} href={`#${s.id}`} className='h-12 flex items-center px-5 rounded-2xl font-extrabold text-lg text-ground-sub hover:bg-white/8 hover:text-chalk'>
                            {s.label}
                        </a>
                    ))}
                    <div className='pt-4 w-full'>
                        <Button label='Reset to defaults' onClick={resetPrefs} ghost />
                    </div>
                </nav>

                <div className='flex-[999_1_36rem] min-w-0 flex flex-col gap-6'>
                    <SettingsSections />
                </div>

            </div>
        </Page>
    )
}

export function SettingsSections(){
    const prefs = usePrefs()

    return (
        <>
        <SettingsSection id='controls' title='Controls'>
            <SettingRow label='Shot style' description='Pull back like a slingshot, or push toward where you want the ball to go.' layout='stacked'>
                <Segmented options={SHOT_OPTIONS} value={prefs.dragDirection} onChange={v => setPref('dragDirection', v)} />
            </SettingRow>
            <SettingRow label='Aim guide' description='Show the dotted line while you aim.'>
                <Toggle label='Aim guide' on={prefs.aimGuide} onChange={v => setPref('aimGuide', v)} />
            </SettingRow>
            <SettingRow label='Camera follows ball' description='Keep the camera on your ball while it rolls. Off, it catches up once the ball stops.'>
                <Toggle label='Camera follows ball' on={prefs.cameraFollow} onChange={v => setPref('cameraFollow', v)} />
            </SettingRow>
        </SettingsSection>

        <SettingsSection id='audio' title='Audio'>
            <SettingRow label='Master volume' layout='stacked'>
                <VolumeSlider label='Master volume' value={prefs.masterVolume} onChange={v => setPref('masterVolume', v)} />
            </SettingRow>
            <SettingRow label='Music' layout='stacked'>
                <VolumeSlider label='Music volume' value={prefs.musicVolume} onChange={v => setPref('musicVolume', v)} />
            </SettingRow>
            <SettingRow label='Sound effects' layout='stacked'>
                <VolumeSlider label='Sound effects volume' value={prefs.sfxVolume} onChange={v => setPref('sfxVolume', v)} />
            </SettingRow>
            <SettingRow label='Mute in background' description='Go quiet when you switch to another tab.'>
                <Toggle label='Mute in background' on={prefs.muteInBackground} onChange={v => setPref('muteInBackground', v)} />
            </SettingRow>
        </SettingsSection>

        <SettingsSection id='soundtrack' title='Soundtrack' description='Plays in menus and on the course.'>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3 pt-3 pb-4'>
                {TRACKS.map(track => (
                    <TrackTile key={track.id} name={track.name} picked={prefs.soundtrack === track.id} onPick={() => setPref('soundtrack', track.id)} />
                ))}
            </div>
        </SettingsSection>

        <SettingsSection id='display' title='Display'>
            <SettingRow label='Reduce motion' description='Fewer particles, no screen shake, simpler menu animations.'>
                <Toggle label='Reduce motion' on={prefs.reduceMotion} onChange={v => setPref('reduceMotion', v)} />
            </SettingRow>
            <SettingRow label='Stroke counter' description='Show your strokes in the corner while you play.'>
                <Toggle label='Stroke counter' on={prefs.strokeCounter} onChange={v => setPref('strokeCounter', v)} />
            </SettingRow>
            <SettingRow label='Minimap' description='Show a small map of the hole in the corner.'>
                <Toggle label='Minimap' on={prefs.minimap} onChange={v => setPref('minimap', v)} />
            </SettingRow>
        </SettingsSection>

        <SettingsSection id='multiplayer' title='Multiplayer'>
            <SettingRow label='Name tags' description="Show each player's name above their ball.">
                <Toggle label='Name tags' on={prefs.nameTags} onChange={v => setPref('nameTags', v)} />
            </SettingRow>
            <SettingRow label="Others' aim lines" description='Watch where other players are lining up.'>
                <Toggle label="Others' aim lines" on={prefs.othersAimLines} onChange={v => setPref('othersAimLines', v)} />
            </SettingRow>
            <SettingRow label='Your-turn chime' description="Play a sound when it's your shot.">
                <Toggle label='Your-turn chime' on={prefs.turnChime} onChange={v => setPref('turnChime', v)} />
            </SettingRow>
        </SettingsSection>
        </>
    )
}
