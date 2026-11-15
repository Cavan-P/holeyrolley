import { COURSE_VERSION, type CourseData, type CourseObject } from '../course'
import { routeHole as H, type Route, ordered, setTier } from './kit'

setTier(2)

const FAR = 4000

const rock = (r: Route, t: number, side: number, radius = 16) => r.post(t, side, radius, { skin: 'rock' })
const shell = (r: Route, t: number, side: number) => r.post(t, side, 13, { skin: 'shell' })
const star = (r: Route, t: number, side: number, radius = 17) => r.bumper(t, side, radius, { skin: 'starfish' })
const jetty = (r: Route, t: number, from: number, to: number) => r.across(t, from, to, 12, { skin: 'rock' })
const log = (r: Route, t: number, from: number, to: number) => r.across(t, from, to, 9, { color: '#a8865f' })
const crab = (r: Route, t: number, at: number, travel: number, seconds: number): CourseObject =>
    r.across(t, at - 0.12, at + 0.12, 12, { skin: 'crab' }, r.slide(t, travel, seconds))

const ocean = (r: Route, open: 1 | -1): CourseObject[] => [r.edgeRails(open), r.shore(open, 0.78, 'water', 'ocean')]

const beachside = (r: Route, side: 1 | -1, ts = [0.15, 0.45, 0.75]): CourseObject[] =>
    ts.flatMap((t, i) => [
        r.decor(t, side, 120 + (i % 2) * 30, 'palm', undefined, 40),
        r.decor(t + 0.12, side, i % 2 ? 90 : 60, i % 2 ? 'umbrella' : 'towel', ['#ff6b6b', '#2ec4b6', '#ffd23f'][i % 3], 50)
    ])

const both = (r: Route) => [...beachside(r, -1, [0.2, 0.6]), ...beachside(r, 1, [0.35, 0.8])]

export const sunsetBeach: CourseData = {
    version: COURSE_VERSION,
    name: 'Sunset Beach',
    theme: 'beach',
    assets: {},
    holes: ordered([
        H({ name: 'Low Tide', par: 3, path: [[0, 0], [260, -450], [-120, -950], [160, -1350]], width: 360, rails: false , smooth: true }, r => [
            ...ocean(r, 1),
            rock(r, 0.4, -0.3, 18), shell(r, 0.55, 0.2), rock(r, 0.75, -0.5),
            ...beachside(r, -1)
        ]),

        H({ name: 'Shell Alley', par: 3, path: [[0, 0], [0, -720], [720, -1020]], width: 320 }, r => [
            shell(r, 0.3, -0.4), shell(r, 0.38, 0.35), shell(r, 0.5, -0.1), shell(r, 0.62, 0.5),
            shell(r, 0.7, -0.45), shell(r, 0.8, 0.15),
            r.area('water', r.circle(0.55, 1, 70)),
            ...both(r)
        ]),

        H({ name: 'Tide Pools', par: 4, path: [[0, 0], [0, -620], [820, -920], [820, -1520]], width: 400 }, r => [
            r.area('water', r.circle(0.22, 0.3, 60)),
            r.area('water', r.circle(0.42, -0.4, 75)),
            r.area('water', r.circle(0.6, 0.45, 60)),
            r.area('water', r.circle(0.8, -0.2, 55)),
            rock(r, 0.32, -0.5, 14), rock(r, 0.7, 0.1, 14),
            ...both(r)
        ]),

        H({ name: 'Undertow', par: 4, path: [[0, 0], [-260, -500], [150, -1000], [-120, -1500]], width: 380, rails: false , smooth: true }, r => [
            ...ocean(r, -1),
            r.slope(r.strip(0.35, 0.62, -0.7, 1.2), 0, -120),
            jetty(r, 0.45, 0.25, 1.2),
            rock(r, 0.75, 0.3),
            r.area('sand', r.circle(0.9, 0.6, 55)),
            ...beachside(r, 1)
        ]),

        H({ name: 'Crab Walk', par: 4, path: [[0, 0], [460, -420], [0, -840], [460, -1260]], width: 320 }, r => [
            crab(r, 0.2, -0.45, 260, 2.2),
            crab(r, 0.5, 0.45, -260, 1.9),
            crab(r, 0.8, -0.4, 250, 1.6),
            shell(r, 0.35, 0.6), shell(r, 0.65, -0.6),
            ...both(r)
        ]),

        H({ name: 'Sandbar', par: 4, path: [[0, 0], [0, -900], [720, -900], [720, -150]], width: 300 }, r => [
            r.area('water', r.circle(0.25, 0.55, 60)),
            r.area('sand', r.strip(0.42, 0.58, -0.4, 0.4)),
            r.area('water', r.circle(0.5, -0.9, 70)),
            r.area('water', r.circle(0.75, -0.5, 60)),
            shell(r, 0.85, 0.4),
            ...beachside(r, -1, [0.2, 0.8])
        ]),

        H({ name: 'Reef Break', par: 4, path: [[0, 0], [-220, -500], [220, -1000], [-160, -1500]], width: 380, rails: false , smooth: true }, r => [
            ...ocean(r, 1),
            star(r, 0.3, -0.4), star(r, 0.36, 0.1), star(r, 0.42, 0.55),
            star(r, 0.62, -0.5), star(r, 0.68, 0), r.area('water', r.circle(0.82, -0.4, 50)),
            ...beachside(r, -1)
        ]),

        H({ name: 'Driftwood Delta', par: 4, path: [[0, 0], [720, -260], [0, -660], [720, -1020]], width: 300 }, r => [
            log(r, 0.22, -1.1, 0.1), log(r, 0.45, -0.1, 1.1), log(r, 0.72, -1.1, 0.05),
            r.area('sand', r.circle(0.58, 0.7, 60)),
            shell(r, 0.88, -0.3),
            ...both(r)
        ]),

        H({ name: 'Lighthouse Point', par: 4, path: [[0, 0], [220, -500], [-160, -1000], [80, -1450]], width: 400, rails: false, cup: 0.9 }, r => {
            const top = r.p(1).y - 40
            return [
                r.across(0.002, -1.4, 1.4, 6),
                r.shore(1, 0.78, 'water', 'ocean'),
                r.shore(-1, 0.78, 'water', 'ocean'),
                { id: 'lighthouse-sea', type: 'water', layer: 0, style: { skin: 'ocean' }, shape: { type: 'polygon', points: [{ x: -FAR, y: top }, { x: FAR, y: top }, { x: FAR, y: -FAR }, { x: -FAR, y: -FAR }] } },
                rock(r, 0.94, -0.45, 15), rock(r, 0.955, -0.15, 15), rock(r, 0.96, 0.15, 15), rock(r, 0.955, 0.45, 15),
                rock(r, 0.4, 0.2), rock(r, 0.65, -0.3)
            ]
        }),

        H({ name: 'Boardwalk', par: 4, path: [[0, 0], [0, -700], [620, -1100], [620, -1720]], width: 340 }, r => [
            r.area('water', r.band(0.18, 140)),
            r.bridge(0.13, 0.23, -0.45, 80, false),
            r.area('water', r.band(0.85, 150)),
            r.bridge(0.8, 0.9, 0.45, 80, false),
            crab(r, 0.52, 0, 200, 2),
            ...both(r)
        ]),

        H({ name: 'Crab Shack', par: 4, path: [[0, 0], [0, -950], [680, -950], [680, -120]], width: 300 }, r => [
            jetty(r, 0.22, -1.2, -0.35), jetty(r, 0.22, 0.35, 1.2), crab(r, 0.22, -0.2, 120, 1.7),
            r.area('sand', r.circle(0.5, -0.8, 80)),
            jetty(r, 0.78, -1.2, -0.35), jetty(r, 0.78, 0.35, 1.2), crab(r, 0.78, 0.2, -120, 1.3),
            shell(r, 0.9, 0.4),
            ...beachside(r, -1, [0.15, 0.85])
        ]),

        H({ name: 'Riptide', par: 5, path: [[0, 0], [-260, -600], [160, -1200], [-220, -1800], [100, -2300]], width: 400, rails: false }, r => [
            ...ocean(r, 1),
            r.slope(r.strip(0.2, 0.32, -1.2, 0.7), 0, 170),
            jetty(r, 0.36, -1.2, -0.2),
            r.slope(r.strip(0.5, 0.62, -1.2, 0.7), 0, 200),
            jetty(r, 0.66, -1.2, -0.15),
            r.slope(r.strip(0.78, 0.86, -1.2, 0.7), 0, 220),
            rock(r, 0.92, 0.2),
            ...beachside(r, -1, [0.1, 0.4, 0.7, 0.95])
        ]),

        H({ name: 'Coral Maze', par: 4, path: [[0, 0], [720, 0], [720, -460], [0, -460], [0, -920], [720, -920]], width: 280 }, r => [
            r.across(0.12, 0.15, 1.2, 10, { color: '#f08a7e' }),
            r.across(0.28, -1.2, -0.15, 10, { color: '#f08a7e' }),
            r.area('water', r.circle(0.4, 0, 55)),
            r.across(0.55, 0.15, 1.2, 10, { color: '#f08a7e' }),
            star(r, 0.68, -0.3),
            r.area('water', r.circle(0.78, 0.5, 50)),
            r.across(0.88, -1.2, -0.15, 10, { color: '#f08a7e' }),
            ...beachside(r, -1, [0.3, 0.7])
        ]),

        H({ name: 'Island Hop', par: 5, path: [[0, 0], [0, -720], [720, -1020], [720, -1720], [100, -2020]], width: 360 }, r => [
            r.area('water', r.band(0.38, 160)),
            r.bridge(0.33, 0.43, 0.45, 75, false),
            star(r, 0.2, -0.2),
            r.area('water', r.band(0.64, 170)),
            r.bridge(0.59, 0.69, -0.45, 75, false),
            crab(r, 0.52, 0, 220, 1.8),
            r.area('water', r.band(0.88, 150)),
            r.bridge(0.84, 0.92, 0, 70, false),
            ...both(r)
        ]),

        H({ name: 'Rogue Wave', par: 4, path: [[0, 0], [320, -500], [-60, -1000], [260, -1500]], width: 360, rails: false }, r => [
            ...ocean(r, -1),
            jetty(r, 0.5, 1.3, -0.2),
            crab(r, 0.5, -0.45, 90, 1.4),
            shell(r, 0.3, 0.3), rock(r, 0.75, 0.4),
            ...beachside(r, 1)
        ]),

        H({ name: 'Shipwreck Cove', par: 4, path: [[0, 0], [0, -820], [-720, -1120]], width: 420 }, r => {
            const c = r.p(0.96)
            const back = r.angle(0.96) + Math.PI
            return [
                { id: 'cove', type: 'water', layer: 0, shape: { type: 'arc', x: c.x, y: c.y, inner: 105, outer: 230, start: back + 0.42, end: back - 0.42 } },
                crab(r, 0.62, -0.4, 300, 2.2),
                crab(r, 0.72, 0.4, -300, 2.6),
                log(r, 0.35, -1.2, -0.3), log(r, 0.45, 0.3, 1.2),
                star(r, 0.2, 0.4),
                ...both(r)
            ]
        }),

        H({ name: 'Sandcastle', par: 5, path: [[0, 0], [760, 0], [760, -720], [80, -720]], width: 380, cup: 0.93 }, r => {
            const c = r.p(0.93)
            const [dx, dy] = r.dir(0.93)
            const at = (along: number, across: number) => ({ x: Math.round(c.x + dx * along - dy * across), y: Math.round(c.y + dy * along + dx * across) })
            return [
                { id: 'castle', type: 'wall', layer: 0, closed: false, thickness: 12, bounce: 0.6, style: { color: '#e8c98a' },
                    points: [at(-110, -45), at(-110, -140), at(110, -140), at(110, 140), at(-110, 140), at(-110, 45)] },
                crab(r, 0.86, 0, 60, 1.3),
                r.slopeAt(0.7, 160, -140),
                star(r, 0.45, -0.4), star(r, 0.55, 0.4),
                r.area('sand', r.circle(0.25, 0.6, 70)),
                ...both(r)
            ]
        }),

        H({ name: 'Sunset Shore', par: 5, path: [[0, 0], [-220, -700], [200, -1400], [-200, -2100], [140, -2700]], width: 380, rails: false , smooth: true }, r => [
            ...ocean(r, 1),
            r.area('water', r.band(0.25, 150)),
            r.bridge(0.2, 0.3, -0.4, 75, false),
            r.slope(r.strip(0.42, 0.52, -1.2, 0.7), 0, 180),
            jetty(r, 0.68, -1.2, -0.35), jetty(r, 0.68, 0.35, 0.9), crab(r, 0.68, -0.2, 120, 1.5),
            star(r, 0.82, -0.3), star(r, 0.86, 0.3),
            rock(r, 0.985, -0.3, 14), rock(r, 0.99, 0, 14), rock(r, 0.985, 0.3, 14),
            ...beachside(r, -1, [0.1, 0.35, 0.6, 0.85])
        ])
    ])
}
