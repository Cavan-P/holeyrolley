import { COURSE_VERSION, type CourseData, type CourseObject } from '../course'
import { routeHole as H, type Route, ordered, setTier } from './kit'

setTier(1)

const pad = (r: Route, t: number, side: number, power = 1, radius = 46): CourseObject =>
    ({ id: r.next('pad'), type: 'spring', layer: 0, shape: r.circle(t, side, radius), power })
const padBand = (r: Route, t: number, power = 1, depth = 70): CourseObject =>
    ({ id: r.next('pad'), type: 'spring', layer: 0, shape: r.band(t, depth, 1.1), power })
const candyWall = (r: Route, t: number, from: number, to: number, low = true) => r.across(t, from, to, 11, { skin: 'candycane', low })
const gumball = (r: Route, t: number, side: number, color: string, radius = 18) => r.bumper(t, side, radius, { skin: 'gumball', color })
const syrup = (r: Route, t: number, side: number, radius: number) => r.area('sand', r.circle(t, side, radius))
const soda = (r: Route, t: number, depth: number) => r.area('water', r.band(t, depth))
const sodaPool = (r: Route, t: number, side: number, radius: number) => r.area('water', r.circle(t, side, radius))
const drop = (r: Route, t: number, side: number, color: string) => r.post(t, side, 18, { skin: 'gumball', color, low: true })

const COLORS = ['#ff5d8f', '#4fd1ff', '#ffd23f', '#9b5de5', '#8fe3c0']

const sweets = (r: Route, ts = [0.15, 0.45, 0.75]): CourseObject[] => ts.flatMap((t, i) => [
    r.decor(t, -1, 120, 'lollipop', COLORS[i % 5], 30),
    r.decor(t + 0.1, 1, 110, 'cupcake', COLORS[(i + 2) % 5], 40),
    r.decor(t + 0.2, i % 2 ? 1 : -1, 80, 'gumdrop', COLORS[(i + 3) % 5], 40)
])

export const sugarRush: CourseData = {
    version: COURSE_VERSION,
    name: 'Sugar Rush',
    theme: 'candy',
    assets: {},
    holes: ordered([
        H({ name: 'Sugar Cube', par: 3, path: [[0, 0], [0, -680], [520, -1040]], width: 330 }, r => [
            padBand(r, 0.32, 0.8),
            candyWall(r, 0.4, -1.2, 1.2),
            gumball(r, 0.7, 0.3, COLORS[0]!),
            ...sweets(r)
        ]),

        H({ name: 'Gumdrop Hop', par: 4, path: [[0, 0], [440, -440], [0, -880], [440, -1320]], width: 320 }, r => [
            drop(r, 0.2, -0.3, COLORS[1]!), drop(r, 0.24, 0.3, COLORS[2]!),
            pad(r, 0.42, 0, 1),
            drop(r, 0.5, 0, COLORS[3]!), drop(r, 0.52, -0.5, COLORS[4]!), drop(r, 0.52, 0.5, COLORS[0]!),
            syrup(r, 0.75, 0.5, 60),
            ...sweets(r)
        ]),

        H({ name: 'Candy Cane Lane', par: 4, path: [[0, 0], [0, -720], [-720, -720], [-720, -1340]], width: 340 }, r => [
            padBand(r, 0.2), candyWall(r, 0.27, -1.2, 1.2),
            padBand(r, 0.52), candyWall(r, 0.58, -1.2, 1.2),
            padBand(r, 0.76), candyWall(r, 0.82, -1.2, 1.2),
            ...sweets(r)
        ]),

        H({ name: 'Soda Springs', par: 4, path: [[0, 0], [380, -650], [0, -1300]], width: 460 }, r => [
            pad(r, 0.36, -0.4, 1.2), pad(r, 0.36, 0.4, 0.7),
            soda(r, 0.5, 240),
            syrup(r, 0.7, 0.5, 60),
            gumball(r, 0.8, -0.3, COLORS[3]!),
            ...sweets(r)
        ]),

        H({ name: 'Lollipop Loop', par: 4, path: [[0, 0], [0, -950], [700, -950], [700, -150]], width: 300 }, r => [
            gumball(r, 0.2, -0.3, COLORS[0]!), gumball(r, 0.28, 0.35, COLORS[1]!),
            syrup(r, 0.5, -0.8, 70),
            gumball(r, 0.7, 0.3, COLORS[2]!), gumball(r, 0.78, -0.35, COLORS[3]!),
            padBand(r, 0.88, 0.8), candyWall(r, 0.93, -1.2, -0.2),
            ...sweets(r, [0.2, 0.8])
        ]),

        H({ name: 'Cotton Candy Clouds', par: 4, path: [[0, 0], [-320, -600], [200, -1200], [-120, -1600]], width: 400 , smooth: true }, r => [
            syrup(r, 0.25, -0.3, 80), syrup(r, 0.45, 0.4, 90), syrup(r, 0.65, -0.35, 85),
            pad(r, 0.36, 0, 0.9), pad(r, 0.56, 0, 0.9),
            gumball(r, 0.82, 0.3, COLORS[4]!),
            ...sweets(r)
        ]),

        H({ name: 'Jawbreaker', par: 4, path: [[0, 0], [0, -650], [900, -950], [900, -1570]], width: 430 }, r => [
            gumball(r, 0.25, -0.4, COLORS[0]!, 24), gumball(r, 0.3, 0.4, COLORS[1]!, 24),
            gumball(r, 0.42, 0, COLORS[2]!, 28),
            gumball(r, 0.58, -0.45, COLORS[3]!, 24), gumball(r, 0.64, 0.45, COLORS[4]!, 24),
            pad(r, 0.75, 0, 1),
            ...sweets(r)
        ]),

        H({ name: 'Licorice Ladder', par: 5, path: [[0, 0], [760, 0], [760, -500], [0, -500], [0, -1000], [760, -1000]], width: 300 }, r => [
            candyWall(r, 0.1, -1.2, 1.2), padBand(r, 0.06, 0.8),
            candyWall(r, 0.3, -0.3, 1.2, false), syrup(r, 0.36, -0.4, 60),
            padBand(r, 0.5, 1), soda(r, 0.56, 110),
            candyWall(r, 0.72, -1.2, 0.3, false),
            padBand(r, 0.85, 0.8), candyWall(r, 0.9, -1.2, 1.2),
            ...sweets(r, [0.3, 0.7])
        ]),

        H({ name: 'Taffy Twist', par: 4, path: [[0, 0], [740, -260], [0, -660], [740, -1020]], width: 320 , smooth: true }, r => [
            r.spinner(0.22, 0, 110, 3.5, { skin: 'candycane' }),
            syrup(r, 0.45, 0, 70),
            r.spinner(0.72, 0, 110, -3, { skin: 'candycane' }),
            gumball(r, 0.6, 0.5, COLORS[1]!),
            ...sweets(r)
        ]),

        H({ name: 'Chocolate River', par: 4, path: [[0, 0], [0, -620], [720, -920], [720, -1540]], width: 380 }, r => [
            { id: 'river', type: 'water', layer: 0, shape: r.band(0.5, 260), style: { color: '#6b3f22' } },
            padBand(r, 0.37, 1.3),
            r.bridge(0.4, 0.6, 0.7, 70, true, '#c99a64'),
            gumball(r, 0.75, -0.3, COLORS[2]!),
            ...sweets(r)
        ]),

        H({ name: 'Sprinkle Slide', par: 4, path: [[0, 0], [-300, -620], [220, -1240], [-120, -1700]], width: 380 , smooth: true }, r => [
            r.area('ice', r.strip(0.15, 0.85, -0.9, 0.9)),
            syrup(r, 0.3, 0.5, 60), syrup(r, 0.55, -0.5, 60), syrup(r, 0.8, 0.4, 60),
            drop(r, 0.42, 0, COLORS[0]!), drop(r, 0.68, 0, COLORS[3]!),
            ...sweets(r)
        ]),

        H({ name: 'Marshmallow Moat', par: 5, path: [[0, 0], [0, -720], [680, -1070]], width: 460, cup: 0.93 }, r => {
            const c = r.p(0.93)
            return [
                { id: 'moat', type: 'water', layer: 0, shape: { type: 'donut', x: c.x, y: c.y, inner: 110, outer: 220 } },
                { id: 'moat-pad', type: 'spring', layer: 0, shape: r.circle(0.72, 0, 50), power: 1.2 },
                candyWall(r, 0.55, -1.2, -0.3), candyWall(r, 0.55, 0.3, 1.2),
                gumball(r, 0.35, 0.3, COLORS[4]!),
                ...sweets(r)
            ]
        }),

        H({ name: 'Peppermint Pass', par: 4, path: [[0, 0], [0, -900], [800, -900]], width: 320 }, r => [
            candyWall(r, 0.3, -1.2, -0.2, false), candyWall(r, 0.3, 0.2, 1.2, false),
            padBand(r, 0.47, 1.1),
            sodaPool(r, 0.55, 0, 90),
            candyWall(r, 0.75, -1.2, 1.2), padBand(r, 0.69, 0.8),
            ...sweets(r, [0.2, 0.85])
        ]),

        H({ name: 'Rock Candy Ridge', par: 5, path: [[0, 0], [0, -800], [-720, -1100], [-720, -1900]], width: 360 }, r => [
            r.slopeAt(0.2, 160, -150),
            drop(r, 0.32, -0.4, COLORS[1]!), drop(r, 0.32, 0.4, COLORS[2]!),
            padBand(r, 0.45, 1), soda(r, 0.52, 120),
            r.slopeAt(0.68, 160, -170),
            gumball(r, 0.8, 0, COLORS[0]!, 22),
            ...sweets(r)
        ]),

        H({ name: 'Fudge Falls', par: 4, path: [[0, 0], [380, -650], [0, -1300]], width: 440 , smooth: true }, r => [
            r.slope(r.strip(0.25, 0.75, -1.2, 1.2), -60, 140),
            { id: 'fudge', type: 'water', layer: 0, shape: r.strip(0.25, 0.75, 0.65, 1.3), style: { color: '#6b3f22' } },
            pad(r, 0.5, -0.4, 0.9),
            gumball(r, 0.85, 0.2, COLORS[3]!),
            ...sweets(r)
        ]),

        H({ name: 'Caramel Canyon', par: 5, path: [[0, 0], [0, -820], [720, -1120], [720, -1920], [100, -2220]], width: 340 }, r => [
            syrup(r, 0.15, 0, 70),
            padBand(r, 0.28), r.area('water', r.band(0.35, 150)),
            candyWall(r, 0.5, -1.2, 0.2, false),
            padBand(r, 0.62, 1.1), candyWall(r, 0.68, -1.2, 1.2),
            gumball(r, 0.8, 0.3, COLORS[4]!),
            syrup(r, 0.9, -0.4, 60),
            ...sweets(r, [0.1, 0.4, 0.7, 0.95])
        ]),

        H({ name: 'Bubblegum Bounce', par: 4, path: [[0, 0], [0, -700], [-700, -1000], [-700, -1600]], width: 420 }, r => [
            gumball(r, 0.2, -0.3, COLORS[0]!, 22), gumball(r, 0.25, 0.4, COLORS[0]!, 20),
            pad(r, 0.38, 0, 1.1), sodaPool(r, 0.47, 0, 90),
            gumball(r, 0.6, -0.4, COLORS[0]!, 22), gumball(r, 0.66, 0.35, COLORS[0]!, 20),
            pad(r, 0.78, 0.3, 0.8), candyWall(r, 0.84, -1.2, 1.2),
            ...sweets(r)
        ]),

        H({ name: 'Sugar Crash', par: 5, path: [[0, 0], [0, -820], [720, -1180], [720, -1980], [120, -2380]], width: 380 }, r => [
            padBand(r, 0.1), candyWall(r, 0.15, -1.2, 1.2),
            soda(r, 0.28, 150), padBand(r, 0.22, 1.1),
            r.spinner(0.42, 0, 140, 3, { skin: 'candycane' }),
            syrup(r, 0.52, -0.5, 60),
            gumball(r, 0.6, 0.4, COLORS[1]!), gumball(r, 0.64, -0.3, COLORS[2]!),
            padBand(r, 0.74, 1.2), soda(r, 0.8, 160),
            candyWall(r, 0.9, -1.2, -0.2), candyWall(r, 0.9, 0.2, 1.2),
            ...sweets(r, [0.1, 0.35, 0.6, 0.85])
        ])
    ])
}
