import { COURSE_VERSION, type CourseData, type CourseObject } from '../course'
import { routeHole as H, type Route, ordered, setTier } from './kit'

setTier(3)

const belt = (r: Route, t0: number, t1: number, along: number, across = 0, s0 = -0.9, s1 = 0.9): CourseObject => {
    const [dx, dy] = r.dir((t0 + t1) / 2)
    return { id: r.next('belt'), type: 'conveyor', layer: 0, shape: r.strip(t0, t1, s0, s1), push: { x: Math.round(dx * along - dy * across), y: Math.round(dy * along + dx * across) } }
}
const cog = (r: Route, t: number, side: number, radius = 22) => r.post(t, side, radius, { skin: 'gear', color: '#b08a3a' })
const arm = (r: Route, t: number, half: number, seconds: number) => r.spinner(t, 0, half, seconds, { skin: 'girder', color: '#c9772a' })
const piston = (r: Route, t: number, at: number, travel: number, seconds: number) => r.across(t, at - 0.22, at + 0.22, 12, { skin: 'girder', color: '#c9772a' }, r.slide(t, travel, seconds))
const beam = (r: Route, t: number, from: number, to: number) => r.across(t, from, to, 11, { skin: 'girder', color: '#7d838a' })
const oil = (r: Route, t: number, side: number, radius: number) => r.area('water', r.circle(t, side, radius))

const factory = (r: Route, ts = [0.15, 0.45, 0.75]): CourseObject[] => ts.flatMap((t, i) => [
    r.decor(t, -1, 150 + (i % 2) * 40, 'gear', '#6b7178', 30),
    r.decor(t + 0.1, 1, 80, 'barrel', i % 2 ? '#e8b23a' : '#c94b3a', 40),
    r.decor(t + 0.18, i % 2 ? 1 : -1, 140, 'pipe', undefined, 40)
])

export const gearworks: CourseData = {
    version: COURSE_VERSION,
    name: 'Gearworks',
    theme: 'factory',
    assets: {},
    holes: ordered([
        H({ name: 'Assembly Line', par: 3, path: [[0, 0], [0, -680], [520, -1040]], width: 330 }, r => [
            belt(r, 0.2, 0.55, 140),
            cog(r, 0.65, -0.3), cog(r, 0.75, 0.35),
            ...factory(r)
        ]),

        H({ name: 'Cog Corner', par: 4, path: [[0, 0], [440, -440], [0, -880], [440, -1320]], width: 320 }, r => [
            cog(r, 0.2, 0.3), cog(r, 0.33, -0.4, 26), cog(r, 0.5, 0.2),
            cog(r, 0.66, 0.4, 26), cog(r, 0.8, -0.3),
            belt(r, 0.4, 0.58, 0, 160),
            ...factory(r)
        ]),

        H({ name: 'Conveyor Crossing', par: 4, path: [[0, 0], [0, -720], [-720, -720], [-720, -1340]], width: 360 }, r => [
            belt(r, 0.2, 0.3, 0, 220, -1.2, 1.2),
            belt(r, 0.45, 0.55, 0, -240, -1.2, 1.2),
            oil(r, 0.5, 1.1, 80),
            belt(r, 0.72, 0.82, 0, 220, -1.2, 1.2),
            ...factory(r)
        ]),

        H({ name: 'Piston Pass', par: 4, path: [[0, 0], [380, -650], [0, -1300]], width: 420 }, r => [
            piston(r, 0.3, -0.5, 200, 1.4),
            piston(r, 0.45, 0.5, -200, 1.1),
            piston(r, 0.6, -0.5, 200, 1.3),
            piston(r, 0.75, 0.5, -200, 1),
            ...factory(r)
        ]),

        H({ name: 'Gear Grinder', par: 4, path: [[0, 0], [0, -950], [700, -950], [700, -150]], width: 320 }, r => [
            arm(r, 0.22, 120, 3),
            belt(r, 0.38, 0.48, 160),
            arm(r, 0.62, 120, -2.6),
            arm(r, 0.82, 120, 2.2),
            ...factory(r, [0.2, 0.8])
        ]),

        H({ name: 'Loading Dock', par: 4, path: [[0, 0], [-300, -600], [200, -1200], [-120, -1600]], width: 400 , smooth: true }, r => [
            beam(r, 0.3, -1.2, -0.1), beam(r, 0.3, 0.3, 1.2),
            belt(r, 0.38, 0.55, 180),
            beam(r, 0.6, -1.2, -0.3), beam(r, 0.6, 0.1, 1.2),
            oil(r, 0.75, 0.4, 60),
            ...factory(r)
        ]),

        H({ name: 'Boiler Room', par: 4, path: [[0, 0], [0, -650], [720, -950], [720, -1570]], width: 440 }, r => [
            r.bumper(0.25, -0.35, 20), r.bumper(0.32, 0.4, 20),
            oil(r, 0.45, 0, 90),
            r.bumper(0.58, -0.45, 20), r.bumper(0.64, 0.4, 20),
            belt(r, 0.75, 0.9, -120),
            ...factory(r)
        ]),

        H({ name: 'Sprocket Spiral', par: 5, path: [[0, 0], [0, -1000], [820, -1000], [820, -320], [380, -320]], width: 280 , smooth: true }, r => [
            belt(r, 0.1, 0.3, 200),
            cog(r, 0.38, 0, 24),
            belt(r, 0.45, 0.6, -150),
            arm(r, 0.7, 95, 3),
            cog(r, 0.88, 0.3),
            ...factory(r, [0.1, 0.35, 0.6])
        ]),

        H({ name: 'Quality Control', par: 4, path: [[0, 0], [740, -260], [0, -660], [740, -1020]], width: 320 }, r => [
            piston(r, 0.25, 0, 120, 1.2),
            belt(r, 0.42, 0.58, 0, 200),
            oil(r, 0.5, 1.1, 70),
            piston(r, 0.75, 0, 120, 0.9),
            ...factory(r)
        ]),

        H({ name: 'Overtime', par: 5, path: [[0, 0], [760, 0], [760, -500], [0, -500], [0, -1000], [760, -1000]], width: 300 }, r => [
            belt(r, 0.05, 0.18, -160),
            beam(r, 0.28, -1.2, 0.2),
            belt(r, 0.4, 0.5, 0, 200, -1.2, 1.2),
            arm(r, 0.6, 95, 2.6),
            belt(r, 0.75, 0.9, 180),
            cog(r, 0.95, 0.4),
            ...factory(r, [0.3, 0.7])
        ]),

        H({ name: 'Factory Floor', par: 4, path: [[0, 0], [0, -900], [800, -900]], width: 360 }, r => [
            belt(r, 0.15, 0.4, 0, 180, -1.2, 0.2),
            cog(r, 0.3, 0.6, 26),
            belt(r, 0.6, 0.85, 0, -180, -0.2, 1.2),
            cog(r, 0.72, -0.5, 26),
            ...factory(r, [0.2, 0.85])
        ]),

        H({ name: 'Chain Drive', par: 4, path: [[0, 0], [380, -650], [0, -1300]], width: 460 }, r => [
            belt(r, 0.2, 0.8, 160, 0, -0.9, -0.1),
            belt(r, 0.2, 0.8, -160, 0, 0.1, 0.9),
            r.lengthwise(0.25, 0.75, 0, 10, { skin: 'girder', color: '#7d838a' }),
            cog(r, 0.2, 0, 26), cog(r, 0.8, 0, 26),
            ...factory(r)
        ]),

        H({ name: 'Crusher', par: 4, path: [[0, 0], [0, -720], [-720, -1020], [-720, -1640]], width: 340 }, r => [
            r.across(0.3, -1.2, -0.05, 14, { skin: 'girder', color: '#c9772a' }, r.slide(0.3, -150, 1.2)),
            r.across(0.3, 0.05, 1.2, 14, { skin: 'girder', color: '#c9772a' }, r.slide(0.3, 150, 1.2)),
            belt(r, 0.45, 0.6, 140),
            r.across(0.72, -1.2, -0.05, 14, { skin: 'girder', color: '#c9772a' }, r.slide(0.72, -150, 0.9)),
            r.across(0.72, 0.05, 1.2, 14, { skin: 'girder', color: '#c9772a' }, r.slide(0.72, 150, 0.9)),
            ...factory(r)
        ]),

        H({ name: 'Freight Elevator', par: 5, path: [[0, 0], [0, -820], [720, -1120], [720, -1920]], width: 380 }, r => [
            belt(r, 0.1, 0.4, -180),
            cog(r, 0.25, -0.5), cog(r, 0.3, 0.5),
            r.slopeAt(0.5, 150, -160),
            belt(r, 0.6, 0.75, 0, 200),
            arm(r, 0.86, 130, 2.4),
            ...factory(r)
        ]),

        H({ name: 'Clocktower', par: 4, path: [[0, 0], [0, -720], [680, -1070]], width: 460, cup: 0.93 }, r => {
            const c = r.p(0.93)
            const hand = (id: string, len: number, seconds: number, color: string): CourseObject => ({
                id, type: 'wall', layer: 0, closed: false, thickness: 8, bounce: 0.7, points: [{ x: c.x, y: c.y }, { x: c.x, y: c.y - len }], style: { skin: 'girder', color },
                motion: { mode: 'loop', pivot: c, keys: [{ t: 0, x: 0, y: 0, angle: 0, ease: 'linear' }, { t: seconds, x: 0, y: 0, angle: Math.PI * 2, ease: 'linear' }] }
            })
            return [
                hand('minute-hand', 170, 6, '#c9772a'),
                hand('hour-hand', 110, 14, '#7d838a'),
                belt(r, 0.3, 0.55, 150),
                cog(r, 0.6, -0.5), cog(r, 0.65, 0.5),
                ...factory(r)
            ]
        }),

        H({ name: 'Rivet Row', par: 4, path: [[0, 0], [-300, -620], [220, -1240], [-120, -1700]], width: 380 , smooth: true }, r => [
            cog(r, 0.2, -0.4, 14), cog(r, 0.22, 0, 14), cog(r, 0.24, 0.4, 14),
            belt(r, 0.35, 0.5, 0, 180),
            cog(r, 0.55, -0.2, 14), cog(r, 0.57, 0.2, 14),
            piston(r, 0.72, 0, 150, 1.1),
            cog(r, 0.86, -0.4, 14), cog(r, 0.88, 0.4, 14),
            ...factory(r)
        ]),

        H({ name: 'Night Shift', par: 5, path: [[0, 0], [0, -820], [720, -1120], [720, -1920], [100, -2220]], width: 360 }, r => [
            belt(r, 0.06, 0.2, 200),
            oil(r, 0.26, 0.5, 70),
            arm(r, 0.38, 120, 3),
            belt(r, 0.5, 0.62, 0, -200, -1.2, 1.2),
            piston(r, 0.72, 0, 140, 1.1),
            belt(r, 0.8, 0.92, -150),
            ...factory(r, [0.1, 0.4, 0.7, 0.95])
        ]),

        H({ name: 'Final Shift', par: 5, path: [[0, 0], [0, -820], [-720, -1180], [-720, -1980], [-120, -2380]], width: 380 }, r => [
            belt(r, 0.08, 0.22, -150),
            arm(r, 0.3, 130, 2.6),
            r.across(0.42, -1.2, -0.05, 14, { skin: 'girder', color: '#c9772a' }, r.slide(0.42, -150, 1.1)),
            r.across(0.42, 0.05, 1.2, 14, { skin: 'girder', color: '#c9772a' }, r.slide(0.42, 150, 1.1)),
            belt(r, 0.52, 0.64, 0, 220, -1.2, 1.2),
            oil(r, 0.58, 1.1, 70),
            cog(r, 0.72, -0.4, 26), cog(r, 0.76, 0.4, 26),
            piston(r, 0.86, 0, 150, 0.9),
            ...factory(r, [0.1, 0.35, 0.6, 0.85])
        ])
    ])
}
