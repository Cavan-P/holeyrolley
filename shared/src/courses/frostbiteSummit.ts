import { COURSE_VERSION, type CourseData, type CourseObject } from '../course'
import { routeHole as H, type Route, ordered, setTier } from './kit'

setTier(4)

const block = (r: Route, t: number, side: number, hits = 1, radius = 18) => r.post(t, side, radius, { skin: 'iceblock', hits })
const iceWall = (r: Route, t: number, from: number, to: number, hits = 2) => r.across(t, from, to, 13, { skin: 'iceblock', hits })
const rink = (r: Route, t0: number, t1: number, s0 = -1.2, s1 = 1.2) => r.area('ice', r.strip(t0, t1, s0, s1))
const drift = (r: Route, t: number, side: number, radius: number) => r.area('sand', r.circle(t, side, radius))
const pond = (r: Route, t: number, side: number, radius: number) => r.area('water', r.circle(t, side, radius))
const snowball = (r: Route, t: number, side: number) => r.bumper(t, side, 17, { skin: 'iceblock' })

const winter = (r: Route, ts = [0.15, 0.45, 0.75]): CourseObject[] => ts.flatMap((t, i) => [
    r.decor(t, -1, 120 + (i % 2) * 40, 'pine', undefined, 30),
    r.decor(t + 0.1, 1, 130, 'pine', undefined, 40),
    r.decor(t + 0.2, i % 2 ? -1 : 1, i % 2 ? 90 : 160, i % 2 ? 'snowman' : 'igloo', '#e8304a', 50)
])

export const frostbiteSummit: CourseData = {
    version: COURSE_VERSION,
    name: 'Frostbite Summit',
    theme: 'frost',
    assets: {},
    holes: ordered([
        H({ name: 'First Frost', par: 3, path: [[0, 0], [0, -650], [500, -1020]], width: 330 }, r => [
            block(r, 0.35, -0.3), block(r, 0.42, 0.35), block(r, 0.6, 0),
            drift(r, 0.75, 0.9, 60),
            ...winter(r)
        ]),

        H({ name: 'Snowdrift', par: 4, path: [[0, 0], [440, -450], [0, -900], [440, -1350]], width: 320 }, r => [
            drift(r, 0.33, 1, 85), drift(r, 0.66, -1, 85),
            block(r, 0.5, 0.2), block(r, 0.2, -0.3), block(r, 0.85, 0.3),
            ...winter(r)
        ]),

        H({ name: 'Ice Rink', par: 4, path: [[0, 0], [0, -720], [720, -720], [720, -1340]], width: 380 }, r => [
            rink(r, 0.18, 0.62),
            iceWall(r, 0.45, -1.2, -0.25, 1), iceWall(r, 0.45, 0.25, 1.2, 1),
            drift(r, 0.75, 0, 70),
            ...winter(r)
        ]),

        H({ name: 'Crackle Wall', par: 4, path: [[0, 0], [0, -620], [720, -920], [720, -1540]], width: 330 }, r => [
            iceWall(r, 0.5, -1.2, 1.2, 2),
            block(r, 0.25, 0.3), block(r, 0.3, -0.3),
            block(r, 0.75, 0), drift(r, 0.85, 0.7, 55),
            ...winter(r)
        ]),

        H({ name: 'Frozen Pond', par: 4, path: [[0, 0], [380, -650], [0, -1300]], width: 470 , smooth: true }, r => [
            rink(r, 0.3, 0.7),
            pond(r, 0.5, 0, 130),
            block(r, 0.3, -0.6), block(r, 0.7, 0.6),
            ...winter(r)
        ]),

        H({ name: 'Icicle Alley', par: 4, path: [[0, 0], [0, -950], [700, -950], [700, -150]], width: 300 }, r => [
            block(r, 0.15, -0.5), block(r, 0.2, 0.5), block(r, 0.25, -0.2), block(r, 0.3, 0.4),
            drift(r, 0.5, -0.9, 70),
            block(r, 0.7, 0.5), block(r, 0.75, -0.4), block(r, 0.8, 0.2), block(r, 0.85, -0.5),
            ...winter(r, [0.2, 0.8])
        ]),

        H({ name: 'Glacier Glide', par: 5, path: [[0, 0], [0, -820], [-720, -1120], [-720, -1920]], width: 340 , smooth: true }, r => [
            rink(r, 0.08, 0.88),
            drift(r, 0.4, -0.95, 75), drift(r, 0.6, 0.95, 70),
            block(r, 0.3, 0.3, 2), block(r, 0.7, -0.3, 2),
            drift(r, 0.95, 0, 90),
            ...winter(r)
        ]),

        H({ name: 'Avalanche', par: 4, path: [[0, 0], [0, -700], [-680, -1050]], width: 360 }, r => [
            r.slopeAt(0.25, 160, -150),
            block(r, 0.32, -0.4, 1, 22), block(r, 0.36, 0.45, 1, 22),
            r.slopeAt(0.62, 170, -170),
            iceWall(r, 0.75, -0.3, 0.3, 1),
            ...winter(r)
        ]),

        H({ name: 'Ice Castle', par: 5, path: [[0, 0], [0, -720], [680, -1070]], width: 460, cup: 0.93 }, r => {
            const c = r.p(0.93)
            const [dx, dy] = r.dir(0.93)
            const at = (along: number, across: number) => ({ x: Math.round(c.x + dx * along - dy * across), y: Math.round(c.y + dy * along + dx * across) })
            const wall = (id: string, a: ReturnType<typeof at>, b: ReturnType<typeof at>, hits: number): CourseObject =>
                ({ id, type: 'wall', layer: 0, closed: false, thickness: 13, bounce: 0.6, points: [a, b], hits, style: { skin: 'iceblock' } })
            return [
                wall('keep-front', at(-110, -120), at(-110, 120), 3),
                wall('keep-left', at(-110, -120), at(110, -120), 2),
                wall('keep-right', at(-110, 120), at(110, 120), 2),
                wall('keep-back', at(110, -120), at(110, 120), 4),
                rink(r, 0.3, 0.7), snowball(r, 0.5, 0),
                ...winter(r)
            ]
        }),

        H({ name: 'Penguin Slide', par: 4, path: [[0, 0], [740, -260], [0, -660], [740, -1020]], width: 310 }, r => [
            rink(r, 0.05, 0.3), drift(r, 0.33, -1, 80),
            rink(r, 0.38, 0.62), drift(r, 0.66, 1, 80),
            rink(r, 0.7, 0.9),
            block(r, 0.5, 0, 2),
            ...winter(r)
        ]),

        H({ name: 'Blizzard Pass', par: 4, path: [[0, 0], [-260, -450], [200, -900], [-180, -1350], [120, -1700]], width: 280 , smooth: true }, r => [
            drift(r, 0.2, 0.6, 55), drift(r, 0.45, -0.6, 55), drift(r, 0.7, 0.6, 55),
            block(r, 0.32, 0), block(r, 0.58, 0.1), block(r, 0.82, -0.2),
            ...winter(r)
        ]),

        H({ name: 'Frostbite Fork', par: 4, path: [[0, 0], [0, -700], [640, -1150]], width: 520 }, r => [
            r.lengthwise(0.12, 0.62, 0, 12, { skin: 'iceblock', hits: 3 }),
            rink(r, 0.2, 0.55, -1.2, -0.05),
            drift(r, 0.35, 0.5, 70),
            pond(r, 0.8, 0.55, 55),
            ...winter(r)
        ]),

        H({ name: 'Crystal Maze', par: 5, path: [[0, 0], [760, 0], [760, -480], [0, -480], [0, -960], [760, -960]], width: 290 }, r => [
            iceWall(r, 0.12, -1.2, 0.3, 1),
            iceWall(r, 0.3, -0.3, 1.2, 1),
            block(r, 0.4, 0),
            iceWall(r, 0.55, -1.2, 0.3, 2),
            rink(r, 0.62, 0.75),
            iceWall(r, 0.88, -0.3, 1.2, 2),
            ...winter(r, [0.3, 0.7])
        ]),

        H({ name: 'Thin Ice', par: 4, path: [[0, 0], [0, -450], [340, -760], [340, -1260]], width: 460 , smooth: true }, r => [
            r.area('water', r.band(0.5, 340)),
            r.area('ice', r.strip(0.38, 0.62, -0.18, 0.18)),
            block(r, 0.45, 0, 1, 14), block(r, 0.56, 0, 1, 14),
            ...winter(r)
        ]),

        H({ name: 'Snowball Fight', par: 4, path: [[0, 0], [0, -650], [900, -950], [900, -1550]], width: 420 }, r => [
            snowball(r, 0.25, -0.4), snowball(r, 0.32, 0.35), snowball(r, 0.42, -0.1),
            snowball(r, 0.55, 0.5), snowball(r, 0.62, -0.45), snowball(r, 0.7, 0.1),
            drift(r, 0.85, 0.6, 55),
            ...winter(r)
        ]),

        H({ name: 'Summit Switchbacks', par: 5, path: [[0, 0], [760, 0], [760, -500], [0, -500], [0, -1000], [760, -1000]], width: 300 }, r => [
            r.slopeAt(0.3, 120, -150),
            rink(r, 0.38, 0.5),
            block(r, 0.55, 0.3, 2),
            r.slopeAt(0.72, 120, -170),
            drift(r, 0.85, -0.5, 55),
            ...winter(r, [0.25, 0.75])
        ]),

        H({ name: 'Ice Breaker', par: 5, path: [[0, 0], [0, -800], [-700, -1100], [-700, -1900]], width: 330 }, r => [
            iceWall(r, 0.2, -1.2, 1.2, 1),
            iceWall(r, 0.42, -1.2, 1.2, 2),
            rink(r, 0.5, 0.65),
            iceWall(r, 0.7, -1.2, 1.2, 3),
            block(r, 0.85, -0.3), block(r, 0.85, 0.3),
            ...winter(r)
        ]),

        H({ name: 'Frostbite Summit', par: 5, path: [[0, 0], [0, -800], [720, -1180], [720, -1980], [120, -2380]], width: 360 }, r => [
            rink(r, 0.1, 0.25),
            iceWall(r, 0.28, -1.2, 1.2, 2),
            pond(r, 0.42, -0.4, 70), r.slopeAt(0.5, 150, -160),
            block(r, 0.58, 0.3, 2), block(r, 0.62, -0.3, 2),
            rink(r, 0.68, 0.85),
            snowball(r, 0.76, 0),
            iceWall(r, 0.9, -1.2, -0.2, 3), iceWall(r, 0.9, 0.2, 1.2, 3),
            ...winter(r, [0.1, 0.35, 0.6, 0.85])
        ])
    ])
}
