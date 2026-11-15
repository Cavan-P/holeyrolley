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

    lava: string
    magnet: string
    spring: string
    conveyor: string
    portal: string
    backdrop?: 'stars' | 'embers' | 'snow' | 'grid' | 'fog' | 'sprinkles' | 'plates'
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
        decor: '#2f6b2a',
        lava: '#ff6a1f',
        magnet: '#c94bff',
        spring: '#ff7ab6',
        conveyor: '#4a4f57',
        portal: '#4fd1ff'
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
        decor: '#3d9e8c',
        lava: '#ff6a1f',
        magnet: '#c94bff',
        spring: '#ff7ab6',
        conveyor: '#4a4f57',
        portal: '#4fd1ff'
    },
    darkwood: {
        label: 'Darkwood',
        scenery: '#2c4a2a',
        turf: '#6cc04a',
        turfStripe: '#74c652',
        rail: '#4a2e1c',
        sand: '#e3cc86',
        ice: '#d6f1fb',
        water: '#3a8fc9',
        slope: '#5ea83f',
        bridge: '#8a5a32',
        bridgeRail: '#4a2e1c',
        bumper: '#e85d75',
        bumperFlash: '#ffd23f',
        decor: '#1f3a1c',
        lava: '#ff6a1f',
        magnet: '#c94bff',
        spring: '#ff7ab6',
        conveyor: '#4a4f57',
        portal: '#4fd1ff'
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
        decor: '#15261c',
        lava: '#ff6a1f',
        magnet: '#c94bff',
        spring: '#ff7ab6',
        conveyor: '#4a4f57',
        portal: '#4fd1ff'
    },
    space: {
        label: 'Space',
        scenery: '#0d0f24',
        turf: '#5d6aa8',
        turfStripe: '#6673b3',
        rail: '#9aa3c7',
        sand: '#c8b98f',
        ice: '#bfe8ff',
        water: '#2a4fa0',
        slope: '#5260a0',
        bridge: '#8c93b8',
        bridgeRail: '#5a6188',
        bumper: '#7cf2ff',
        bumperFlash: '#ffffff',
        decor: '#2a2f5a',
        lava: '#ff6a1f',
        magnet: '#c94bff',
        spring: '#ff7ab6',
        conveyor: '#4a4f57',
        portal: '#4fd1ff',
        backdrop: 'stars'
    },
    volcano: {
        label: 'Volcano',
        scenery: '#2a1c1a',
        turf: '#6f8c3a',
        turfStripe: '#779543',
        rail: '#4a3a36',
        sand: '#8c7a6b',
        ice: '#cfe6ee',
        water: '#3a7fb0',
        slope: '#647f33',
        bridge: '#5c4a44',
        bridgeRail: '#3a2c29',
        bumper: '#ff8a3d',
        bumperFlash: '#ffe08a',
        decor: '#3a2a26',
        lava: '#ff5a1f',
        magnet: '#c94bff',
        spring: '#ff7ab6',
        conveyor: '#4a4f57',
        portal: '#4fd1ff',
        backdrop: 'embers'
    },
    frost: {
        label: 'Frost',
        scenery: '#e6f1f8',
        turf: '#7fbf9a',
        turfStripe: '#88c6a2',
        rail: '#6b8fb5',
        sand: '#ffffff',
        ice: '#cdefff',
        water: '#3d7fc4',
        slope: '#76b691',
        bridge: '#9a7b5c',
        bridgeRail: '#5c4632',
        bumper: '#6fd3ff',
        bumperFlash: '#ffffff',
        decor: '#2f5d50',
        lava: '#ff6a1f',
        magnet: '#c94bff',
        spring: '#ff7ab6',
        conveyor: '#3d4248',
        portal: '#4fd1ff',
        backdrop: 'snow'
    },
    arcade: {
        label: 'Arcade',
        scenery: '#14102b',
        turf: '#2d2560',
        turfStripe: '#332a6b',
        rail: '#ff4fd8',
        sand: '#6b4fb5',
        ice: '#4fd1ff',
        water: '#1b3a8f',
        slope: '#3a2f78',
        bridge: '#3fb8e0',
        bridgeRail: '#ff4fd8',
        bumper: '#ffe14f',
        bumperFlash: '#ffffff',
        decor: '#ff4fd8',
        lava: '#ff6a1f',
        magnet: '#c94bff',
        spring: '#ff7ab6',
        conveyor: '#3d4248',
        portal: '#4fd1ff',
        backdrop: 'grid'
    },
    haunted: {
        label: 'Haunted',
        scenery: '#1f1a26',
        turf: '#56653a',
        turfStripe: '#5d6d40',
        rail: '#3a3040',
        sand: '#7a6b55',
        ice: '#a9c4cc',
        water: '#2c3e3a',
        slope: '#4f5d35',
        bridge: '#5a4a3a',
        bridgeRail: '#2a2028',
        bumper: '#ff8a1f',
        bumperFlash: '#ffd36b',
        decor: '#2a2433',
        lava: '#ff6a1f',
        magnet: '#c94bff',
        spring: '#ff7ab6',
        conveyor: '#3d4248',
        portal: '#4fd1ff',
        backdrop: 'fog'
    },
    candy: {
        label: 'Candy',
        scenery: '#ffd6ea',
        turf: '#8fe3c0',
        turfStripe: '#9aeac8',
        rail: '#ff5d8f',
        sand: '#fff1b8',
        ice: '#d6f4ff',
        water: '#b06ad6',
        slope: '#86d8b6',
        bridge: '#c99a64',
        bridgeRail: '#8a5f36',
        bumper: '#ff9f1c',
        bumperFlash: '#fff1a8',
        decor: '#ff5d8f',
        lava: '#ff6a1f',
        magnet: '#c94bff',
        spring: '#ff7ab6',
        conveyor: '#3d4248',
        portal: '#4fd1ff',
        backdrop: 'sprinkles'
    },
    factory: {
        label: 'Factory',
        scenery: '#2c3034',
        turf: '#5f8a5a',
        turfStripe: '#668f60',
        rail: '#e8b23a',
        sand: '#8a7a5a',
        ice: '#b7d0d8',
        water: '#3a5a6a',
        slope: '#5a8255',
        bridge: '#6b7178',
        bridgeRail: '#3a3f44',
        bumper: '#e8b23a',
        bumperFlash: '#ffffff',
        decor: '#4a4f55',
        lava: '#ff6a1f',
        magnet: '#c94bff',
        spring: '#ff7ab6',
        conveyor: '#3d4248',
        portal: '#4fd1ff',
        backdrop: 'plates'
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
