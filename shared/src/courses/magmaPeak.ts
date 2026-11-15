import { COURSE_VERSION, type CourseData, type CourseObject } from '../course'
import { routeHole as H, type Route, ordered, setTier } from './kit'

setTier(7)

const PI = Math.PI

const basalt = (r: Route, t: number, side: number, radius = 16) => r.post(t, side, radius, { skin: 'basalt' })
const geyser = (r: Route, t: number, side: number, radius = 18) => r.bumper(t, side, radius, { skin: 'geyser' })
const pit = (r: Route, t: number, side: number, radius: number) => r.area('lava', r.circle(t, side, radius))
const river = (r: Route, t: number, depth: number) => r.area('lava', r.band(t, depth))
const blob = (r: Route, t: number, side: number, radius: number, travel: number, seconds: number) => r.area('lava', r.circle(t, side, radius), undefined, r.slide(t, travel, seconds))
const rockfall = (r: Route, t0: number, t1: number, every: number, size = 20): CourseObject => ({ id: r.next('rockfall'), type: 'faller', layer: 0, shape: r.strip(t0, t1, -0.9, 0.9), every, size, style: { skin: 'lavarock' } })
const ridge = (r: Route, t: number, from: number, to: number) => r.across(t, from, to, 12, { skin: 'basalt' })
const gate = (r: Route, t: number, at: number, travel: number, seconds: number) => r.across(t, at - 0.15, at + 0.15, 12, { skin: 'basalt' }, r.slide(t, travel, seconds))
const boulder = (r: Route, t: number, at: number, travel: number, seconds: number): CourseObject => {
    const c = r.p(t, at)
    return { id: r.next('boulder'), type: 'post', layer: 0, x: c.x, y: c.y, radius: 24, bounce: 0.7, style: { skin: 'basalt' }, motion: r.slide(t, travel, seconds) }
}
const lavaEdge = (r: Route, open: 1 | -1): CourseObject[] => [r.edgeRails(open), r.shore(open, 0.75, 'lava')]

const scenery = (r: Route, ts = [0.2, 0.55, 0.85]): CourseObject[] => ts.flatMap((t, i) => [
    r.decor(t, i % 2 ? 1 : -1, 260 + (i % 2) * 60, 'volcano', undefined, 80),
    r.decor(t + 0.12, i % 2 ? -1 : 1, 110, 'vent', undefined, 40)
])

export const magmaPeak: CourseData = {
    version: COURSE_VERSION,
    name: 'Magma Peak',
    theme: 'volcano',
    assets: {},
    holes: ordered([
        H({ name: 'Ash Fields', par: 3, path: [[0, 0], [0, -650], [500, -1020]], width: 330 }, r => [
            pit(r, 0.35, -0.35, 50), pit(r, 0.62, 0.45, 45),
            basalt(r, 0.48, 0.2), basalt(r, 0.8, -0.3),
            ...scenery(r)
        ]),

        H({ name: 'Lava Tube', par: 4, path: [[0, 0], [460, -460], [0, -920], [460, -1380]], width: 300 }, r => [
            pit(r, 0.33, 1, 80), pit(r, 0.66, -1, 80),
            basalt(r, 0.2, 0.3), basalt(r, 0.5, -0.3), basalt(r, 0.82, 0.3),
            ...scenery(r)
        ]),

        H({ name: 'Geyser Garden', par: 4, path: [[0, 0], [0, -620], [860, -920], [860, -1540]], width: 440 }, r => [
            geyser(r, 0.25, -0.3), geyser(r, 0.3, 0.45), geyser(r, 0.45, 0),
            geyser(r, 0.6, -0.45), geyser(r, 0.66, 0.35),
            pit(r, 0.38, -0.6, 40), pit(r, 0.53, 0.55, 40), pit(r, 0.78, 0, 36),
            ...scenery(r)
        ]),

        H({ name: 'Rockfall', par: 4, path: [[0, 0], [0, -720], [-720, -1020], [-720, -1640]], width: 360 }, r => [
            rockfall(r, 0.2, 0.45, 1.6),
            basalt(r, 0.3, -0.4, 22), basalt(r, 0.4, 0.4, 22),
            rockfall(r, 0.6, 0.85, 1.3),
            basalt(r, 0.7, 0.3, 22), basalt(r, 0.8, -0.35, 22),
            ...scenery(r)
        ]),

        H({ name: 'Magma River', par: 4, path: [[0, 0], [240, -500], [-160, -1000], [160, -1500]], width: 400, rails: false , smooth: true }, r => [
            ...lavaEdge(r, 1),
            river(r, 0.55, 140),
            r.bridge(0.5, 0.6, -0.4, 80, true),
            basalt(r, 0.3, -0.3), basalt(r, 0.8, 0),
            ...scenery(r).filter((_, i) => i % 2)
        ]),

        H({ name: 'Caldera', par: 5, path: [[0, 0], [0, -720]], width: 320, teeAt: { x: 0, y: -40 }, cupAt: { x: 0, y: -1160 } }, r => [
            r.fairway({ type: 'circle', x: 0, y: -1160, r: 440 }),
            { id: 'caldera-ring', type: 'lava', layer: 0, shape: { type: 'donut', x: 0, y: -1160, inner: 150, outer: 235 } },
            { id: 'caldera-bridge', type: 'bridge', layer: 1, a: { x: -150, y: -880 }, b: { x: -60, y: -1060 }, width: 70, rails: true },
            basalt(r, 0.6, 0.4), rockfall(r, 0.3, 0.9, 2.2),
            r.decor(0.5, 1, 300, 'volcano', undefined, 120),
            r.decor(0.3, -1, 110, 'vent', undefined, 40)
        ]),

        H({ name: 'Obsidian Steps', par: 4, path: [[0, 0], [0, -520], [-620, -920], [-620, -1540]], width: 360 }, r => [
            r.slopeAt(0.2, 110, -150),
            pit(r, 0.3, 0.5, 34),
            r.slopeAt(0.45, 100, -180),
            pit(r, 0.58, -0.5, 34),
            r.slopeAt(0.75, 100, -210),
            pit(r, 0.85, 0.45, 32),
            ...scenery(r)
        ]),

        H({ name: 'Lava Lamp', par: 4, path: [[0, 0], [0, -920], [720, -920], [720, -150]], width: 330 }, r => [
            blob(r, 0.2, -0.55, 55, 200, 2.6),
            blob(r, 0.38, 0.55, 50, -200, 2.1),
            blob(r, 0.62, -0.5, 55, 190, 2.4),
            blob(r, 0.8, 0.5, 50, -190, 1.9),
            ...scenery(r, [0.25, 0.75])
        ]),

        H({ name: 'Eruption', par: 5, path: [[0, 0], [0, -820], [720, -1120], [720, -1920]], width: 420 }, r => [
            rockfall(r, 0.12, 0.9, 1.1, 22),
            geyser(r, 0.3, -0.4), geyser(r, 0.5, 0.35), geyser(r, 0.7, -0.3),
            basalt(r, 0.4, 0.4, 22), basalt(r, 0.62, -0.45, 22), basalt(r, 0.82, 0.3, 22),
            ...scenery(r)
        ]),

        H({ name: 'Crust Bridge', par: 4, path: [[0, 0], [0, -620], [660, -920], [660, -1520]], width: 380 }, r => [
            r.area('lava', r.strip(0.3, 0.46, -1.3, 1.3)),
            r.bridge(0.27, 0.49, -0.5, 76, false),
            r.area('lava', r.strip(0.56, 0.72, -1.3, 1.3)),
            r.bridge(0.53, 0.75, 0.45, 76, false),
            basalt(r, 0.15, 0.3), basalt(r, 0.88, -0.3),
            ...scenery(r)
        ]),

        H({ name: 'Boulder Run', par: 5, path: [[0, 0], [820, 0], [820, -620], [0, -620], [0, -1240]], width: 320 }, r => [
            boulder(r, 0.15, -0.8, 260, 2.2),
            boulder(r, 0.35, 0.8, -260, 1.8),
            boulder(r, 0.55, -0.8, 260, 1.6),
            boulder(r, 0.72, 0.8, -260, 2),
            pit(r, 0.27, 0.5, 34), pit(r, 0.63, -0.5, 34),
            boulder(r, 0.88, -0.8, 260, 1.4),
            ...scenery(r, [0.25, 0.65])
        ]),

        H({ name: 'Fumaroles', par: 4, path: [[0, 0], [0, -720], [620, -1120]], width: 480 }, r => {
            const c = r.p(0.96)
            const back = r.angle(0.96) + PI
            const ring: CourseObject[] = []
            for(let k = 0; k < 9; k++){
                const a = back + 0.6 + k * (2 * PI - 1.2) / 8
                ring.push({ id: `fumarole-${k}`, type: 'bumper', layer: 0, a: { x: Math.round(c.x + Math.cos(a) * 120), y: Math.round(c.y + Math.sin(a) * 120) }, b: { x: Math.round(c.x + Math.cos(a) * 120), y: Math.round(c.y + Math.sin(a) * 120) }, radius: 15, kick: 240, style: { skin: 'geyser' } })
            }
            return [...ring, pit(r, 0.35, -0.5, 45), pit(r, 0.55, 0.5, 45), pit(r, 0.75, 0, 30), ...scenery(r)]
        }),

        H({ name: 'Twin Craters', par: 4, path: [[0, 0], [460, -700], [0, -1400]], width: 600 , smooth: true }, r => [
            pit(r, 0.48, -0.55, 150),
            pit(r, 0.52, 0.55, 150),
            rockfall(r, 0.3, 0.7, 2),
            basalt(r, 0.2, 0, 18), basalt(r, 0.85, 0, 18),
            ...scenery(r)
        ]),

        H({ name: 'Lava Locks', par: 5, path: [[0, 0], [0, -900], [720, -900], [720, -1800]], width: 340 }, r => [
            ridge(r, 0.15, -1.2, -0.3), ridge(r, 0.15, 0.3, 1.2), gate(r, 0.15, -0.15, 100, 1.8),
            pit(r, 0.22, 0.5, 36),
            ridge(r, 0.42, -1.2, -0.3), ridge(r, 0.42, 0.3, 1.2), gate(r, 0.42, 0.15, -100, 1.4),
            pit(r, 0.5, -0.5, 36),
            ridge(r, 0.7, -1.2, -0.3), ridge(r, 0.7, 0.3, 1.2), gate(r, 0.7, -0.15, 100, 1.1),
            pit(r, 0.78, 0.5, 36),
            ...scenery(r)
        ]),

        H({ name: 'Spitting Vents', par: 4, path: [[0, 0], [340, -500], [-220, -1000], [240, -1450]], width: 440, rails: false , smooth: true }, r => [
            r.across(0.003, -1.4, 1.4, 6), r.across(0.997, -1.4, 1.4, 6),
            r.shore(1, 0.7, 'lava'), r.shore(-1, 0.7, 'lava'),
            geyser(r, 0.3, 0.2), geyser(r, 0.5, -0.2), geyser(r, 0.7, 0.2),
            rockfall(r, 0.35, 0.75, 1.7, 18)
        ]),

        H({ name: 'Hot Spring Hop', par: 5, path: [[0, 0], [0, -720], [720, -1020], [720, -1720], [100, -2020]], width: 380 }, r => [
            river(r, 0.38, 160), r.bridge(0.33, 0.43, 0.45, 70, false),
            geyser(r, 0.2, 0),
            river(r, 0.64, 170), r.bridge(0.59, 0.69, -0.45, 70, false),
            rockfall(r, 0.45, 0.56, 1.8),
            river(r, 0.88, 150), r.bridge(0.84, 0.92, 0.1, 70, false),
            ...scenery(r)
        ]),

        H({ name: 'Obsidian Spiral', par: 5, path: [[0, 0], [0, -520]], width: 320, teeAt: { x: 0, y: -40 }, cupAt: { x: 0, y: -960 } }, r => [
            r.fairway({ type: 'circle', x: 0, y: -960, r: 420 }),
            { id: 'spiral-outer', type: 'arcWall', layer: 0, x: 0, y: -960, radius: 330, start: PI / 2 + 0.3, end: PI / 2 - 0.3, thickness: 10, bounce: 0.6, style: { color: '#3b3230' } },
            { id: 'spiral-mid', type: 'arcWall', layer: 0, x: 0, y: -960, radius: 220, start: -PI / 2 + 0.42, end: -PI / 2 - 0.42, thickness: 10, bounce: 0.6, style: { color: '#3b3230' } },
            { id: 'spiral-inner', type: 'arcWall', layer: 0, x: 0, y: -960, radius: 115, start: PI / 2 + 0.6, end: PI / 2 - 0.6, thickness: 10, bounce: 0.6, style: { color: '#3b3230' } },
            { id: 'spiral-pit', type: 'lava', layer: 0, shape: { type: 'circle', x: -190, y: -1110, r: 16 } },
            r.decor(0.5, 1, 280, 'volcano', undefined, 160),
            r.decor(0.5, -1, 110, 'vent', undefined, 200)
        ]),

        H({ name: 'Heart of the Volcano', par: 5, path: [[0, 0], [0, -820], [-720, -1220], [-720, -2020], [-120, -2420]], width: 400 , smooth: true }, r => {
            const c = r.p(0.96)
            return [
                river(r, 0.15, 150), r.bridge(0.11, 0.2, 0.4, 70, false),
                boulder(r, 0.32, -0.8, 300, 2.2), boulder(r, 0.4, 0.8, -300, 1.8),
                rockfall(r, 0.5, 0.68, 1.2),
                geyser(r, 0.58, -0.3), geyser(r, 0.64, 0.35),
                { id: 'heart-ring', type: 'lava', layer: 0, shape: { type: 'donut', x: c.x, y: c.y, inner: 105, outer: 175 } },
                r.bridge(0.86, 0.95, 0, 64, false),
                basalt(r, 0.78, -0.5), basalt(r, 0.8, 0.5),
                ...scenery(r, [0.1, 0.35, 0.6, 0.85])
            ]
        })
    ])
}
