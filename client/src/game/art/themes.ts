// How each kind of object looks when a course doesn't override its color.
// A course picks one theme; the editor's color presets come from it too
export type Theme = {
    label: string

    scenery: string
    turf: string
    turfStripe: string

    rail: string
    sand: string
    ice: string
    water: string
    slope: string

    bridge: string
    bridgeRail: string

    bumper: string
    bumperFlash: string

    decor: string
}

export const THEMES: Record<string, Theme> = {
    classic: {
        label: 'Classic',
        scenery: '#4e8f3c',
        turf: '#6cc04a',
        turfStripe: '#74c652',
        rail: '#8b4a2b',
        sand: '#e8d28a',
        ice: '#d6f1fb',
        water: '#3a9ad9',
        slope: '#5fae3f',
        bridge: '#b07c46',
        bridgeRail: '#6e4423',
        bumper: '#ff5d5d',
        bumperFlash: '#ffd23f',
        decor: '#2f6b2a'
    },
    beach: {
        label: 'Beach',
        scenery: '#f0d8a0',
        turf: '#7ccb5c',
        turfStripe: '#86d266',
        rail: '#c4915c',
        sand: '#f7e6b5',
        ice: '#e2f6fb',
        water: '#2fb3d6',
        slope: '#6cbf4e',
        bridge: '#c99a64',
        bridgeRail: '#8a5f36',
        bumper: '#ff7a59',
        bumperFlash: '#fff1a8',
        decor: '#3d9e8c'
    },
    night: {
        label: 'Night',
        scenery: '#1d3326',
        turf: '#3f8f3a',
        turfStripe: '#449640',
        rail: '#5b4a6e',
        sand: '#b9a76e',
        ice: '#9fc6dc',
        water: '#1f5f8f',
        slope: '#3a7f35',
        bridge: '#6f5a45',
        bridgeRail: '#3e3128',
        bumper: '#ffb347',
        bumperFlash: '#fff6e0',
        decor: '#15261c'
    }
}

export function getTheme(name: string): Theme {
    return THEMES[name] ?? THEMES.classic ?? Object.values(THEMES)[0]!
}

// General-purpose colors offered in the editor next to the theme's own
export const PALETTE = [
    '#ffffff', '#1d3319', '#8b4a2b', '#c4915c', '#ff5d5d', '#ff9f1c',
    '#ffd23f', '#6cc04a', '#2f6b2a', '#3a9ad9', '#1b2a4a', '#9b5de5'
]
