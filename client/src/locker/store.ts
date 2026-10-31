import { BALL_COLORS, HATS, CELEBRATIONS, DEFAULT_COSMETICS, type Cosmetics } from '@holey/shared'

const KEY = 'holeyrolley:locker'

let current: Cosmetics = load()
const listeners = new Set<() => void>()

function pick<T extends string>(allowed: readonly T[], value: unknown, fallback: T): T {
    return allowed.includes(value as T) ? value as T : fallback
}

function load(): Cosmetics {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}')

        return {
            color: pick(BALL_COLORS, raw.color, DEFAULT_COSMETICS.color),
            hat: pick(HATS, raw.hat, DEFAULT_COSMETICS.hat),
            celebration: pick(CELEBRATIONS, raw.celebration, DEFAULT_COSMETICS.celebration)
        }
    }
    catch {
        return DEFAULT_COSMETICS
    }
}

export function getCosmetics(): Cosmetics {
    return current
}

export function setCosmetic<K extends keyof Cosmetics>(key: K, value: Cosmetics[K]): void {
    current = { ...current, [key]: value }

    try {
        localStorage.setItem(KEY, JSON.stringify(current))
    }
    catch {}

    listeners.forEach(l => l())
}

export function subscribeCosmetics(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
}
