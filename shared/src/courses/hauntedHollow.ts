import { COURSE_VERSION, type CourseData, type CourseObject } from '../course'
import { routeHole as H, type Route, ordered, setTier } from './kit'

setTier(6)

const ghost = (r: Route, t: number, from: number, to: number, on: number, off: number, offset = 0) =>
    r.across(t, from, to, 12, { skin: 'ghost', phase: { on, off, offset } })
const ghostPost = (r: Route, t: number, side: number, on: number, off: number, offset = 0) =>
    r.post(t, side, 18, { skin: 'ghost', phase: { on, off, offset } })
const fence = (r: Route, t: number, from: number, to: number) => r.across(t, from, to, 8, { skin: 'fence' })
const stone = (r: Route, t: number, side: number) => r.post(t, side, 15, { color: '#77708a' })
const pumpkin = (r: Route, t: number, side: number, radius = 18) => r.bumper(t, side, radius)
const bog = (r: Route, t: number, side: number, radius: number) => r.area('water', r.circle(t, side, radius))

const graveyard = (r: Route, ts = [0.15, 0.45, 0.75]): CourseObject[] => ts.flatMap((t, i) => [
    r.decor(t, -1, 150 + (i % 2) * 40, 'deadtree', undefined, 30),
    r.decor(t + 0.08, 1, 60, 'tombstone', undefined, 30),
    r.decor(t + 0.14, 1, 60, 'tombstone', undefined, 110),
    r.decor(t + 0.2, i % 2 ? 1 : -1, 80, 'pumpkin', undefined, 40)
])

export const hauntedHollow: CourseData = {
    version: COURSE_VERSION,
    name: 'Haunted Hollow',
    theme: 'haunted',
    assets: {},
    holes: ordered([
        H({ name: 'Graveyard Gate', par: 3, path: [[0, 0], [0, -680], [520, -1040]], width: 330 }, r => [
            fence(r, 0.4, -1.2, -0.25), fence(r, 0.4, 0.25, 1.2),
            ghost(r, 0.4, -0.25, 0.25, 2, 1.5),
            stone(r, 0.7, 0.3),
            ...graveyard(r)
        ]),

        H({ name: 'Crooked Path', par: 4, path: [[0, 0], [440, -440], [0, -880], [440, -1320]], width: 300 }, r => [
            stone(r, 0.2, 0.4), stone(r, 0.35, -0.3), stone(r, 0.55, 0.4), stone(r, 0.8, -0.3),
            bog(r, 0.66, -1, 80),
            ghostPost(r, 0.45, 0, 1.6, 1.6),
            ...graveyard(r)
        ]),

        H({ name: 'Phantom Fence', par: 4, path: [[0, 0], [0, -720], [-720, -720], [-720, -1340]], width: 360 }, r => [
            ghost(r, 0.3, -1.2, 1.2, 1.8, 1.4),
            ghost(r, 0.55, -1.2, 1.2, 1.8, 1.4, 1),
            fence(r, 0.78, -1.2, -0.2),
            ...graveyard(r)
        ]),

        H({ name: 'Misty Bog', par: 4, path: [[0, 0], [360, -650], [0, -1300]], width: 470 , smooth: true }, r => [
            bog(r, 0.35, -0.3, 90), bog(r, 0.5, 0.45, 70), bog(r, 0.65, -0.35, 85),
            ghostPost(r, 0.5, -0.4, 1.2, 1.2), ghostPost(r, 0.42, 0.1, 1.2, 1.2, 0.6),
            ...graveyard(r)
        ]),

        H({ name: 'Lantern Lane', par: 4, path: [[0, 0], [0, -950], [700, -950], [700, -150]], width: 300 }, r => [
            pumpkin(r, 0.2, -0.4), pumpkin(r, 0.3, 0.4),
            ghost(r, 0.5, -1.2, 1.2, 2.2, 1.2),
            pumpkin(r, 0.7, -0.4), pumpkin(r, 0.8, 0.4),
            ...graveyard(r, [0.2, 0.8])
        ]),

        H({ name: 'Will-o-Wisp', par: 4, path: [[0, 0], [-300, -600], [200, -1200], [-100, -1600]], width: 380 , smooth: true }, r => [
            ghostPost(r, 0.25, -0.3, 1, 1), ghostPost(r, 0.3, 0.35, 1, 1, 0.5),
            ghostPost(r, 0.5, 0, 1, 1, 0.25),
            ghostPost(r, 0.7, -0.35, 1, 1, 0.75), ghostPost(r, 0.75, 0.3, 1, 1),
            bog(r, 0.4, 0.9, 70),
            ...graveyard(r)
        ]),

        H({ name: 'Pumpkin Patch', par: 4, path: [[0, 0], [0, -650], [720, -950], [720, -1570]], width: 440 }, r => [
            pumpkin(r, 0.22, -0.4), pumpkin(r, 0.28, 0.4), pumpkin(r, 0.36, 0, 22),
            pumpkin(r, 0.58, -0.45), pumpkin(r, 0.64, 0.45), pumpkin(r, 0.7, 0),
            r.area('sand', r.circle(0.85, 0.6, 60)),
            ...graveyard(r)
        ]),

        H({ name: 'Banshee Bend', par: 4, path: [[0, 0], [0, -900], [800, -900]], width: 320 }, r => [
            ghost(r, 0.35, -1.2, 0.2, 1.6, 1.6),
            ghost(r, 0.35, -0.2, 1.2, 1.6, 1.6, 1.6),
            bog(r, 0.53, 1.1, 90),
            ghost(r, 0.75, -1.2, 1.2, 1.4, 1.2, 0.5),
            ...graveyard(r, [0.2, 0.85])
        ]),

        H({ name: 'Moonlit Crypt', par: 5, path: [[0, 0], [0, -720], [680, -1070]], width: 460, cup: 0.93 }, r => {
            const c = r.p(0.93)
            const [dx, dy] = r.dir(0.93)
            const at = (along: number, across: number) => ({ x: Math.round(c.x + dx * along - dy * across), y: Math.round(c.y + dy * along + dx * across) })
            return [
                { id: 'crypt', type: 'wall', layer: 0, closed: false, thickness: 12, bounce: 0.6, style: { color: '#4a4258' },
                    points: [at(-110, -50), at(-110, -130), at(120, -130), at(120, 130), at(-110, 130), at(-110, 50)] },
                { id: 'crypt-door', type: 'wall', layer: 0, closed: false, thickness: 12, bounce: 0.6, points: [at(-110, -50), at(-110, 50)], phase: { on: 2, off: 1.2, offset: 0 }, style: { skin: 'ghost' } },
                fence(r, 0.4, -1.2, -0.3), fence(r, 0.4, 0.3, 1.2),
                stone(r, 0.2, 0.3), stone(r, 0.6, -0.3),
                ...graveyard(r)
            ]
        }),

        H({ name: 'Raven Roost', par: 4, path: [[0, 0], [740, -260], [0, -660], [740, -1020]], width: 310 }, r => [
            r.spinner(0.2, 0, 85, 4, { color: '#3a3040' }),
            ghostPost(r, 0.45, 0, 1.5, 1),
            r.spinner(0.8, 0, 85, -4, { color: '#3a3040' }),
            bog(r, 0.58, 0.6, 55),
            ...graveyard(r)
        ]),

        H({ name: 'Cobweb Corner', par: 4, path: [[0, 0], [0, -800], [-700, -800], [-700, -300]], width: 330 }, r => [
            fence(r, 0.3, -1.2, 0.3), fence(r, 0.4, -0.3, 1.2),
            ghost(r, 0.52, -1.2, 1.2, 1.5, 1.5),
            fence(r, 0.68, -1.2, 0.3), fence(r, 0.78, -0.3, 1.2),
            ...graveyard(r, [0.2, 0.8])
        ]),

        H({ name: 'Gloom Gardens', par: 4, path: [[0, 0], [380, -650], [0, -1300]], width: 520 , smooth: true }, r => [
            r.lengthwise(0.15, 0.85, 0, 10, { skin: 'ghost', phase: { on: 2.5, off: 1.5, offset: 0 } }),
            bog(r, 0.35, 0.5, 70), stone(r, 0.5, -0.5), stone(r, 0.6, -0.3),
            pumpkin(r, 0.55, 0.5),
            ...graveyard(r)
        ]),

        H({ name: 'Witching Hour', par: 5, path: [[0, 0], [760, 0], [760, -500], [0, -500], [0, -1000], [760, -1000]], width: 300 }, r => [
            ghost(r, 0.12, -1.2, 1.2, 1.2, 1.2),
            ghost(r, 0.3, -1.2, 1.2, 1.2, 1.2, 0.6),
            bog(r, 0.45, 0, 55),
            ghost(r, 0.55, -1.2, 1.2, 1, 1.4),
            ghost(r, 0.72, -1.2, 1.2, 1, 1.4, 0.8),
            ghost(r, 0.88, -1.2, 1.2, 0.8, 1.4, 0.4),
            ...graveyard(r, [0.3, 0.7])
        ]),

        H({ name: 'Spectral Switchback', par: 5, path: [[0, 0], [0, -800], [720, -1100], [720, -1900], [100, -2200]], width: 360 }, r => [
            fence(r, 0.2, -1.2, -0.2),
            ghost(r, 0.2, -0.2, 1.2, 2, 1),
            bog(r, 0.38, 0.4, 70),
            ghostPost(r, 0.5, -0.3, 1.2, 1.2), ghostPost(r, 0.55, 0.3, 1.2, 1.2, 0.6),
            fence(r, 0.72, 0.2, 1.2),
            ghost(r, 0.72, -1.2, 0.2, 2, 1, 1),
            pumpkin(r, 0.88, 0),
            ...graveyard(r, [0.1, 0.4, 0.7, 0.95])
        ]),

        H({ name: 'The Seance', par: 4, path: [[0, 0], [0, -720], [-720, -1020], [-720, -1640]], width: 400 }, r => {
            const c = r.p(0.5)
            const ring: CourseObject[] = []
            for(let k = 0; k < 6; k++){
                const a = k / 6 * Math.PI * 2
                ring.push({ id: `seance-${k}`, type: 'post', layer: 0, x: Math.round(c.x + Math.cos(a) * 110), y: Math.round(c.y + Math.sin(a) * 110), radius: 16, bounce: 0.7, phase: { on: 1.5, off: 1.5, offset: k * 0.5 }, style: { skin: 'ghost' } })
            }
            return [...ring, pumpkin(r, 0.5, 0, 20), bog(r, 0.25, 0.6, 55), bog(r, 0.78, -0.6, 55), ...graveyard(r)]
        }),

        H({ name: 'Bone Bridge', par: 4, path: [[0, 0], [0, -620], [720, -920], [720, -1540]], width: 360 }, r => [
            bog(r, 0.5, 0, 190),
            r.area('water', r.band(0.5, 260)),
            r.bridge(0.4, 0.6, -0.35, 76, false, '#d8d2c4'),
            ghost(r, 0.5, 0.1, 0.6, 1.5, 1.5),
            stone(r, 0.25, 0.4), stone(r, 0.8, -0.4),
            ...graveyard(r)
        ]),

        H({ name: 'Midnight Mausoleum', par: 5, path: [[0, 0], [-260, -700], [200, -1400], [-200, -2100]], width: 400 , smooth: true }, r => [
            ghost(r, 0.18, -1.2, 1.2, 1.4, 1.4),
            fence(r, 0.32, -1.2, -0.3), fence(r, 0.32, 0.3, 1.2),
            bog(r, 0.45, 0.5, 70), bog(r, 0.5, -0.5, 60),
            ghost(r, 0.62, -1.2, 1.2, 1.2, 1.6, 0.7),
            pumpkin(r, 0.75, -0.3), pumpkin(r, 0.8, 0.3),
            ghost(r, 0.9, -1.2, 1.2, 1, 1.4, 0.3),
            ...graveyard(r, [0.1, 0.4, 0.7])
        ]),

        H({ name: 'Final Haunt', par: 5, path: [[0, 0], [0, -820], [720, -1180], [720, -1980], [120, -2380]], width: 380 }, r => [
            ghost(r, 0.12, -1.2, 1.2, 1.6, 1.2),
            bog(r, 0.25, -0.4, 70), stone(r, 0.25, 0.4),
            r.spinner(0.38, 0, 140, 4, { color: '#3a3040' }),
            ghostPost(r, 0.5, -0.4, 1, 1), ghostPost(r, 0.52, 0.4, 1, 1, 0.5),
            ghost(r, 0.65, -1.2, 0, 1.4, 1.4), ghost(r, 0.65, 0, 1.2, 1.4, 1.4, 1.4),
            pumpkin(r, 0.78, 0, 22),
            ghost(r, 0.9, -1.2, 1.2, 1, 1.6, 0.5),
            ...graveyard(r, [0.1, 0.35, 0.6, 0.85])
        ])
    ])
}
