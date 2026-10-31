import { type TrackId } from '../audio/tracks'


export type Prefs = {
    // Controls
    dragDirection: 'back' | 'front'
    aimGuide: boolean
    cameraFollow: boolean

    // Audio
    masterVolume: number
    musicVolume: number
    sfxVolume: number
    muteInBackground: boolean
    soundtrack: TrackId

    // Display
    theme: 'day' | 'night' | 'system'
    reduceMotion: boolean
    strokeCounter: boolean

    // Multiplayer
    nameTags: boolean
    othersAimLines: boolean
    turnChime: boolean
}

const DEFAULTS: Prefs = {
    dragDirection: 'back',
    aimGuide: true,
    cameraFollow: true,

    masterVolume: 1,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    muteInBackground: true,
    soundtrack: 'holeInOne',

    theme: 'day',
    reduceMotion: false,
    strokeCounter: true,

    nameTags: true,
    othersAimLines: true,
    turnChime: true
}
const KEY = 'holeyrolley:prefs'

let current: Prefs = load()
const listeners = new Set<() => void>()

function load(): Prefs {
    try {
        const raw = localStorage.getItem(KEY)

        return raw ? {...DEFAULTS, ...JSON.parse(raw)} : DEFAULTS
    }
    catch {
        return DEFAULTS
    }
}

function save(next: Prefs): void {
    current = next

    try {
        localStorage.setItem(KEY, JSON.stringify(current))
    }
    catch {}

    listeners.forEach(l => l())
}

export function getPrefs(): Prefs {
    return current
}

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]): void {
    save({ ...current, [key]: value })
}

export function resetPrefs(): void {
    save(DEFAULTS)
}

export function subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
}
