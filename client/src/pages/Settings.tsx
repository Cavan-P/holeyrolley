
import { Button } from '../components/Button'
import { SettingsSection, SettingRow } from '../components/SettingsLayout'
import { Toggle, Segmented, VolumeSlider, TrackTile } from '../components/SettingsControls'
import { useNavigate } from 'react-router'
import { usePrefs } from '../settings/useSetting'
import { setPref, resetPrefs, type Prefs } from '../settings/store'
import { TRACKS } from '../audio/tracks'

const SHOT_OPTIONS = [
    { value: 'back', label: 'Pull back' },
    { value: 'front', label: 'Push forward' }
] as const satisfies readonly { value: Prefs['dragDirection'], label: string }[]

const THEME_OPTIONS = [
    { value: 'day', label: 'Day' },
    { value: 'night', label: 'Night' },
    { value: 'system', label: 'Match device' }
] as const satisfies readonly { value: Prefs['theme'], label: string }[]

export function Settings(){

    const navigate = useNavigate()
    const prefs = usePrefs()

    return (
        <div className='h-full w-full overflow-y-auto bg-sky text-ink'>
            <div className='max-w-6xl px-4 sm:px-14 pt-14 pb-16 flex flex-col gap-7'>
                <header className='flex flex-col gap-3'>
                    <h1 className='text-6xl sm:text-7xl font-bold font-display tracking-wide'>
                        Settings
                    </h1>
                    <p className='text-lg text-sub'>Tune how the game feels and sounds. Changes save as you make them.</p>
                </header>

                <div className='grid md:grid-cols-2 gap-5 items-start'>
                    <SettingsSection title='Controls'>
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

                    <SettingsSection title='Audio'>
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

                    <SettingsSection title='Soundtrack' description='Plays in menus and on the course.'>
                        <div className='grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3 pt-3 pb-4'>
                            {TRACKS.map(track => (
                                <TrackTile key={track.id} name={track.name} picked={prefs.soundtrack === track.id} onPick={() => setPref('soundtrack', track.id)} />
                            ))}
                        </div>
                    </SettingsSection>

                    <SettingsSection title='Display'>
                        <SettingRow label='Theme' description='Day or night look for the menus.' layout='stacked'>
                            <Segmented options={THEME_OPTIONS} value={prefs.theme} onChange={v => setPref('theme', v)} />
                        </SettingRow>
                        <SettingRow label='Reduce motion' description='Fewer particles, no screen shake, simpler menu animations.'>
                            <Toggle label='Reduce motion' on={prefs.reduceMotion} onChange={v => setPref('reduceMotion', v)} />
                        </SettingRow>
                        <SettingRow label='Stroke counter' description='Show your strokes in the corner while you play.'>
                            <Toggle label='Stroke counter' on={prefs.strokeCounter} onChange={v => setPref('strokeCounter', v)} />
                        </SettingRow>
                    </SettingsSection>

                    <SettingsSection title='Multiplayer'>
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
                </div>

                <footer className='flex flex-wrap gap-3 max-w-lg'>
                    <div className='flex-1 basis-40'>
                        <Button label='Reset to defaults' onClick={resetPrefs} />
                    </div>
                    <div className='flex-2 basis-56'>
                        <Button label='Back' onClick={() => {navigate('/')}} splash={true} arrow={true} />
                    </div>
                </footer>
            </div>
        </div>
    )
}
