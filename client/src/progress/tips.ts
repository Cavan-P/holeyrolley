import type { HoleData } from '@holey/shared'

const KEY = 'holeyrolley:tips'

export const TIPS = {
    sand: ['Sand', 'Slows your ball right down. Hit a little harder through it.'],
    water: ['Water', 'Splash in and you go back to where you hit from, plus a stroke.'],
    slope: ['Hills', 'Slopes pull your ball downhill. Aim above the cup.'],
    bumper: ['Bumpers', 'They kick your ball away faster than it hit them.'],
    bridge: ['Bridges', 'Roll up onto them to cross. Bridges without rails can drop you off the side.'],
    moving: ['Moving walls', 'Some walls slide or spin. Time your putt.'],
    ice: ['Ice', 'Almost no friction. Your ball keeps going.'],
    breakable: ['Breakable walls', 'Crack them by hitting them. They grow back after a while.'],
    ghost: ['Ghost walls', 'They fade in and out. Roll through while they are gone.'],
    low: ['Low walls', 'A ball in the air flies right over them.'],
    spring: ['Springs', 'Launch your ball into the air, over walls and hazards.'],
    conveyor: ['Conveyors', 'Belts push your ball the way the arrows point.'],
    portal: ['Portals', 'Roll into one and you pop out of its partner.'],
    lava: ['Lava', 'Same as water, but hotter. Back you go, plus a stroke.'],
    faller: ['Falling rocks', 'Watch for the shadow. A direct hit sends you back.'],
    magnet: ['Magnets', 'They pull your ball toward them when it rolls close.'],
    voidEdge: ['Open edges', 'No walls here. Roll off and you float away, plus a stroke.']
} as const

export type Mechanic = keyof typeof TIPS

export function mechanicsOf(hole: HoleData): Mechanic[] {
    const found = new Set<Mechanic>()
    if(hole.voidEdge) found.add('voidEdge')

    for(const o of hole.objects){
        if(o.type === 'sand' || o.type === 'water' || o.type === 'ice' || o.type === 'lava' || o.type === 'slope' || o.type === 'bumper' || o.type === 'bridge' || o.type === 'spring' || o.type === 'conveyor' || o.type === 'portal' || o.type === 'magnet' || o.type === 'faller') found.add(o.type)
        if(o.motion) found.add('moving')
        if('hits' in o && o.hits) found.add('breakable')
        if('phase' in o && o.phase) found.add('ghost')
        if('low' in o && o.low) found.add('low')
    }

    return (Object.keys(TIPS) as Mechanic[]).filter(m => found.has(m))
}

function seen(): Set<string> {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]) }
    catch { return new Set() }
}

export function takeNewTips(hole: HoleData): Mechanic[] {
    const done = seen()
    const fresh = mechanicsOf(hole).filter(m => !done.has(m))
    if(!fresh.length) return []

    fresh.forEach(m => done.add(m))
    try { localStorage.setItem(KEY, JSON.stringify([...done])) } catch {}
    return fresh
}
