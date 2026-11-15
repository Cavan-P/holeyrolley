import { COURSE_VERSION, type CourseData, type CourseObject, type Vec } from '../course'
import { routeHole, type HoleOptions, type Route, ordered, setTier } from './kit'

setTier(8)

const H = (o: HoleOptions, build: (r: Route) => CourseObject[]) => routeHole({ rails: false, voidEdge: true, ...o }, build)

const rock = (r: Route, t: number, side: number, radius = 16) => r.post(t, side, radius, { skin: 'asteroid' })
const pulsar = (r: Route, t: number, side: number, radius = 16) => r.bumper(t, side, radius, { skin: 'pulsar' })
const zeroG = (r: Route, t0: number, t1: number, s0 = -0.9, s1 = 0.9): CourseObject => ({ id: r.next('zerog'), type: 'ice', layer: 0, shape: r.strip(t0, t1, s0, s1), style: { skin: 'zerog' } })
const well = (r: Route, t: number, side: number, radius: number, strength: number, planet = false): CourseObject => {
    const c = r.p(t, side)
    return { id: r.next('well'), type: 'magnet', layer: 0, x: c.x, y: c.y, radius, strength, ...(planet ? { style: { skin: 'planet', color: '#e0864a' } } : {}) }
}
const wellAt = (r: Route, c: Vec, radius: number, strength: number): CourseObject => ({ id: r.next('well'), type: 'magnet', layer: 0, x: c.x, y: c.y, radius, strength })
const meteors = (r: Route, t0: number, t1: number, every: number, size = 20): CourseObject => ({ id: r.next('meteors'), type: 'faller', layer: 0, shape: r.strip(t0, t1, -0.9, 0.9), every, size, style: { skin: 'meteor' } })
const ufo = (r: Route, t: number, at: number, travel: number, seconds: number) => r.across(t, at - 0.14, at + 0.14, 12, { skin: 'ufo' }, r.slide(t, travel, seconds))
const beam = (r: Route, a: Vec, b: Vec, width = 66): CourseObject => ({ id: r.next('beam'), type: 'bridge', layer: 1, a, b, width, rails: false, style: { color: '#7cf2ff' } })
const pad = (r: Route, t: number, radius: number) => r.fairway(r.circle(t, 0, radius), false)

const sky = (r: Route, ts = [0.2, 0.55, 0.85]): CourseObject[] => ts.flatMap((t, i) => [
    r.decor(t, i % 2 ? 1 : -1, 150 + i * 40, 'planet', ['#e0864a', '#5fb0ff', '#9b5de5', '#2ec4b6'][i % 4], 120),
    r.decor(t + 0.15, i % 2 ? -1 : 1, 120, i % 2 ? 'satellite' : 'rocket', '#ff5d5d', 140)
])

export const cosmicDrift: CourseData = {
    version: COURSE_VERSION,
    name: 'Cosmic Drift',
    theme: 'space',
    assets: {},
    holes: ordered([
        H({ name: 'Liftoff', par: 3, path: [[0, 0], [0, -650], [520, -1020]], width: 330 }, r => [
            rock(r, 0.35, -0.3, 18), rock(r, 0.6, 0.4), rock(r, 0.8, -0.2, 14),
            ...sky(r)
        ]),

        H({ name: 'Orbit', par: 4, path: [[0, 0], [0, -520]], width: 280, teeAt: { x: 0, y: -30 }, cupAt: { x: 0, y: -1170 } }, r => [
            r.fairway({ type: 'donut', x: 0, y: -900, inner: 150, outer: 390 }, false),
            wellAt(r, { x: 0, y: -900 }, 300, 260),
            rock(r, 0.5, 0, 14),
            r.decor(0, 0, 130, 'satellite', undefined, 0),
            ...sky(r, [0.1, 0.6])
        ]),

        H({ name: 'Zero-G Drift', par: 4, path: [[0, 0], [0, -620], [680, -920], [680, -1520]], width: 330 , smooth: true }, r => [
            zeroG(r, 0.25, 0.42),
            zeroG(r, 0.62, 0.78),
            rock(r, 0.5, 0.2), rock(r, 0.88, -0.4, 14),
            ...sky(r)
        ]),

        H({ name: 'Stepping Stones', par: 4, path: [[0, 0], [0, -620], [640, -1000], [640, -1640]], width: 300, fairway: false }, r => [
            pad(r, 0.03, 190), pad(r, 0.36, 170), pad(r, 0.66, 170), pad(r, 0.97, 190),
            beam(r, r.p(0.08), r.p(0.31)),
            beam(r, r.p(0.41), r.p(0.61)),
            beam(r, r.p(0.71), r.p(0.92)),
            rock(r, 0.36, 0.3, 14),
            ...sky(r)
        ]),

        H({ name: 'Gravity Well', par: 4, path: [[0, 0], [0, -720], [-680, -1120]], width: 460 }, r => [
            well(r, 0.48, 0.55, 260, 320, true),
            pulsar(r, 0.25, -0.4), pulsar(r, 0.75, 0.4),
            ...sky(r)
        ]),

        H({ name: 'Repulsor Lane', par: 4, path: [[0, 0], [460, -460], [0, -920], [460, -1380]], width: 320 }, r => [
            well(r, 0.33, -0.5, 170, -380),
            well(r, 0.66, 0.5, 170, -380),
            rock(r, 0.2, 0.3, 14), rock(r, 0.85, -0.3, 14),
            ...sky(r)
        ]),

        H({ name: 'Asteroid Belt', par: 4, path: [[0, 0], [0, -700], [720, -1000], [720, -1620]], width: 440 }, r => [
            rock(r, 0.3, -0.5, 20), rock(r, 0.35, 0.1, 14), rock(r, 0.4, 0.55, 22),
            rock(r, 0.5, -0.2, 16), rock(r, 0.56, 0.4, 14), rock(r, 0.62, -0.55, 18),
            meteors(r, 0.3, 0.65, 2.4),
            ...sky(r)
        ]),

        H({ name: 'Saucer Section', par: 4, path: [[0, 0], [0, -920], [720, -920], [720, -150]], width: 300 }, r => [
            ufo(r, 0.25, -0.45, 230, 2.2),
            ufo(r, 0.5, 0.4, -210, 1.8),
            ufo(r, 0.78, -0.4, 220, 1.6),
            ...sky(r, [0.15, 0.85])
        ]),

        H({ name: 'Slingshot', par: 4, path: [[0, 0], [0, -900], [820, -900]], width: 320 }, r => [
            well(r, 0.53, 1.6, 360, 300, true),
            rock(r, 0.75, 0.2), rock(r, 0.88, -0.4, 14),
            ...sky(r, [0.2, 0.85])
        ]),

        H({ name: 'Meteor Shower', par: 4, path: [[0, 0], [-500, -500], [0, -1000], [-420, -1500]], width: 380 , smooth: true }, r => [
            meteors(r, 0.15, 0.85, 1.3),
            rock(r, 0.3, 0.4, 22), rock(r, 0.5, -0.4, 22), rock(r, 0.7, 0.35, 22),
            ...sky(r)
        ]),

        H({ name: 'Light Bridge', par: 5, path: [[0, 0], [0, -450], [720, -1250], [720, -1700]], width: 340, fairway: false }, r => [
            r.fairway(r.strip(0, 0.27, -1, 1), false),
            r.fairway(r.strip(0.73, 1, -1, 1), false),
            pad(r, 0.0, 170), pad(r, 1, 170),
            beam(r, r.p(0.22, 0.3), r.p(0.78, -0.3), 62),
            pulsar(r, 0.85, -0.4), pulsar(r, 0.9, 0.4),
            ...sky(r)
        ]),

        H({ name: 'Binary Stars', par: 4, path: [[0, 0], [460, -560], [0, -1120]], width: 560 , smooth: true }, r => [
            well(r, 0.45, -0.5, 250, 380), pulsar(r, 0.45, -0.5, 20),
            well(r, 0.55, 0.5, 250, 380), pulsar(r, 0.55, 0.5, 20),
            zeroG(r, 0.4, 0.6, -0.15, 0.15),
            pulsar(r, 0.5, 0, 22),
            ...sky(r)
        ]),

        H({ name: 'Zero-G Gauntlet', par: 5, path: [[0, 0], [0, -820], [720, -1120], [720, -1920]], width: 340 }, r => [
            zeroG(r, 0.1, 0.9),
            ufo(r, 0.3, -0.4, 200, 2),
            ufo(r, 0.62, 0.4, -200, 1.7),
            rock(r, 0.45, 0.3), rock(r, 0.8, -0.3),
            ...sky(r)
        ]),

        H({ name: 'Satellite Array', par: 4, path: [[0, 0], [0, -760], [760, -760]], width: 320 }, r => [
            r.fairway({ type: 'rect', x: -160, y: -1350, w: 320, h: 600, radius: 60 }, false),
            well(r, 0.5, 0, 200, -420),
            pulsar(r, 0.5, -0.9), pulsar(r, 0.5, 0.9),
            ufo(r, 0.8, 0, 200, 1.6),
            r.decor(0.5, 0, 160, 'satellite', undefined, 0),
            ...sky(r, [0.2, 0.9])
        ]),

        H({ name: 'Event Horizon', par: 5, path: [[0, 0], [0, -900]], width: 300, fairway: false, teeAt: { x: 0, y: -150 }, cupAt: { x: 0, y: -1050 } }, r => [
            r.fairway({ type: 'donut', x: 0, y: -600, inner: 170, outer: 470 }, false),
            wellAt(r, { x: 0, y: -600 }, 420, 430),
            rock(r, 0.3, 1.6, 16), rock(r, 0.7, -1.6, 16),
            ...sky(r, [0.1, 0.9])
        ]),

        H({ name: 'Orbital Debris', par: 5, path: [[0, 0], [0, -720], [-720, -1120], [-720, -1840]], width: 400 }, r => [
            r.spinner(0.18, 0, 120, 5, { skin: 'asteroid' }),
            meteors(r, 0.35, 0.6, 2),
            r.spinner(0.78, 0, 120, -6, { skin: 'asteroid' }),
            rock(r, 0.9, 0.4, 14),
            ...sky(r)
        ]),

        H({ name: 'Wormhole', par: 4, path: [[0, 0], [0, -600], [700, -900], [700, -1500]], width: 300, fairway: false }, r => [
            pad(r, 0.03, 190), pad(r, 0.5, 210), pad(r, 0.97, 190),
            beam(r, r.p(0.08), r.p(0.42), 60),
            beam(r, r.p(0.58), r.p(0.92), 60),
            well(r, 0.5, 0, 260, 300),
            well(r, 0.5, -1.4, 170, -320), well(r, 0.5, 1.4, 170, -320),
            ...sky(r)
        ]),

        H({ name: 'Final Frontier', par: 5, path: [[0, 0], [0, -700], [700, -1000], [700, -1700], [100, -2100]], width: 360, fairway: false , smooth: true }, r => [
            r.fairway(r.strip(0, 0.2, -1, 1), false), pad(r, 0, 180),
            r.fairway(r.strip(0.35, 0.62, -1, 1), false),
            r.fairway(r.strip(0.78, 1, -1, 1), false), pad(r, 1, 180),
            beam(r, r.p(0.17), r.p(0.38), 64),
            beam(r, r.p(0.59), r.p(0.81), 60),
            zeroG(r, 0.03, 0.15),
            well(r, 0.48, 0.3, 200, 340, true),
            pulsar(r, 0.4, -0.5), pulsar(r, 0.56, 0.5),
            meteors(r, 0.37, 0.6, 1.7),
            ufo(r, 0.88, 0, 220, 2),
            ...sky(r, [0.1, 0.4, 0.7, 0.95])
        ])
    ])
}
