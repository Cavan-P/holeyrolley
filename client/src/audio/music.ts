import { getPrefs, subscribe } from '../settings/store'
import { TRACKS, type TrackId } from './tracks'

const audio = new AudioContext()
const volume = audio.createGain()
volume.connect(audio.destination)

let source: AudioBufferSourceNode | null = null
let currentId: TrackId | null = null

async function play(id: TrackId, src: string) {
    const response = await fetch(src)
    const buffer = await audio.decodeAudioData(await response.arrayBuffer())

    if (id !== currentId) {
        return
    }

    source?.stop()
    source = audio.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(volume)
    source.start()
}

function apply() {
    const p = getPrefs()
    const pick = TRACKS.find(t => t.id === p.soundtrack) ?? TRACKS[0]

    if (pick.id !== currentId) {
        currentId = pick.id
        play(pick.id, pick.src).catch(e => { console.warn('music: ', e) })
    }

    const muted = p.muteInBackground && document.hidden
    volume.gain.setTargetAtTime(muted ? 0 : p.masterVolume * p.musicVolume, audio.currentTime, 0.02)
}

export function initSound() {
    apply()
    subscribe(apply)
    // Switching tabs isn't a settings change, so it needs its own trigger
    document.addEventListener('visibilitychange', apply)

    window.addEventListener('pointerdown', () => {
        audio.resume().catch(e => { console.warn('music: ', e) })
    }, { once: true })
}