import { COURSE_VERSION, type CourseData, type CourseObject } from '../course'
import { routeHole as H, type Route, ordered, setTier } from './kit'

setTier(5)

const portal = (r: Route, t1: number, s1: number, t2: number, s2: number, color?: string): CourseObject =>
    ({ id: r.next('portal'), type: 'portal', layer: 0, a: r.p(t1, s1), b: r.p(t2, s2), radius: 26, ...(color ? { style: { color } } : {}) })
const neonPost = (r: Route, t: number, side: number, color = '#4fd1ff') => r.post(t, side, 15, { skin: 'neon', color })
const neonBumper = (r: Route, t: number, side: number, radius = 18) => r.bumper(t, side, radius, { skin: 'neon', color: '#ffe14f' })
const neonWall = (r: Route, t: number, from: number, to: number, color = '#ff4fd8') => r.across(t, from, to, 9, { skin: 'neon', color })
const laser = (r: Route, t: number, at: number, travel: number, seconds: number) => r.across(t, at - 0.2, at + 0.2, 8, { skin: 'neon', color: '#ff5d5d' }, r.slide(t, travel, seconds))
const pixelPool = (r: Route, t: number, side: number, size: number): CourseObject => {
    const c = r.p(t, side)
    return { id: r.next('pool'), type: 'water', layer: 0, shape: { type: 'rect', x: c.x - size / 2, y: c.y - size / 2, w: size, h: size, radius: 0 } }
}

const arcade = (r: Route, ts = [0.15, 0.45, 0.75]): CourseObject[] => ts.flatMap((t, i) => [
    r.decor(t, -1, 90, 'cabinet', ['#ff4fd8', '#4fd1ff', '#ffe14f'][i % 3], 40),
    r.decor(t + 0.1, 1, 110, 'slime', ['#7cff6b', '#ff4fd8', '#4fd1ff'][i % 3], 40),
    r.decor(t + 0.2, i % 2 ? 1 : -1, 60, 'coin', undefined, 30)
])

export const neonArcade: CourseData = {
    version: COURSE_VERSION,
    name: 'Neon Arcade',
    theme: 'arcade',
    assets: {},
    holes: ordered([
        H({ name: 'Insert Coin', par: 3, path: [[0, 0], [0, -680], [520, -1040]], width: 330 }, r => [
            neonBumper(r, 0.35, -0.3), neonBumper(r, 0.5, 0.35), neonPost(r, 0.7, -0.2),
            ...arcade(r)
        ]),

        H({ name: 'Warp Zone', par: 3, path: [[0, 0], [0, -920], [720, -920], [720, -150]], width: 300 }, r => [
            portal(r, 0.2, 0.3, 0.8, -0.3),
            neonWall(r, 0.4, -1.2, 0.4),
            neonWall(r, 0.6, -0.4, 1.2),
            neonPost(r, 0.9, 0.3),
            ...arcade(r, [0.2, 0.8])
        ]),

        H({ name: 'Pinball Wizard', par: 4, path: [[0, 0], [0, -620], [900, -980], [900, -1560]], width: 440 }, r => [
            neonBumper(r, 0.25, -0.4), neonBumper(r, 0.3, 0.4), neonBumper(r, 0.42, 0, 22),
            neonBumper(r, 0.58, -0.45), neonBumper(r, 0.62, 0.45),
            { id: 'flip-l', type: 'bumper', layer: 0, a: r.p(0.8, -0.8), b: r.p(0.84, -0.35), radius: 10, kick: 200, style: { skin: 'neon', color: '#4fd1ff' } },
            { id: 'flip-r', type: 'bumper', layer: 0, a: r.p(0.8, 0.8), b: r.p(0.84, 0.35), radius: 10, kick: 200, style: { skin: 'neon', color: '#4fd1ff' } },
            ...arcade(r)
        ]),

        H({ name: 'Pellet Lanes', par: 4, path: [[0, 0], [760, 0], [760, -480], [0, -480], [0, -960], [760, -960]], width: 280 }, r => [
            neonWall(r, 0.12, 0.2, 1.2, '#4fd1ff'), neonWall(r, 0.3, -1.2, -0.2, '#4fd1ff'),
            neonPost(r, 0.45, 0.3, '#ffe14f'), neonPost(r, 0.5, -0.3, '#ffe14f'),
            neonWall(r, 0.68, 0.2, 1.2, '#4fd1ff'), neonWall(r, 0.86, -1.2, -0.2, '#4fd1ff'),
            ...arcade(r, [0.3, 0.7])
        ]),

        H({ name: 'Teleport Tango', par: 4, path: [[0, 0], [460, -460], [0, -920], [460, -1380]], width: 320 }, r => [
            portal(r, 0.28, -0.5, 0.48, 0.5, '#ff4fd8'),
            pixelPool(r, 0.38, 0, 90),
            portal(r, 0.62, 0.5, 0.82, -0.5),
            neonBumper(r, 0.72, 0),
            ...arcade(r)
        ]),

        H({ name: 'Laser Grid', par: 4, path: [[0, 0], [0, -700], [-700, -1000], [-700, -1600]], width: 340 }, r => [
            laser(r, 0.22, -0.5, 260, 1.8),
            laser(r, 0.38, 0.5, -260, 1.4),
            laser(r, 0.62, -0.5, 260, 1.2),
            laser(r, 0.8, 0.5, -260, 1.6),
            ...arcade(r)
        ]),

        H({ name: 'High Score', par: 5, path: [[0, 0], [0, -800], [720, -1100], [720, -1900], [100, -2200]], width: 360 }, r => [
            neonBumper(r, 0.15, -0.3), neonBumper(r, 0.2, 0.35),
            portal(r, 0.3, 0.4, 0.55, -0.4, '#ffe14f'),
            pixelPool(r, 0.42, 0, 110),
            laser(r, 0.68, -0.5, 250, 1.5),
            neonBumper(r, 0.8, 0), neonPost(r, 0.88, -0.4), neonPost(r, 0.88, 0.4),
            ...arcade(r, [0.1, 0.4, 0.7, 0.95])
        ]),

        H({ name: 'Glitch', par: 4, path: [[0, 0], [0, -700], [700, -1000], [700, -1600]], width: 380 }, r => [
            pixelPool(r, 0.3, -0.4, 100), pixelPool(r, 0.36, 0.45, 80),
            portal(r, 0.55, 0.5, 0.12, -0.5, '#ff5d5d'),
            portal(r, 0.55, -0.5, 0.8, 0.4),
            pixelPool(r, 0.68, 0, 90),
            ...arcade(r)
        ]),

        H({ name: 'Combo Breaker', par: 4, path: [[0, 0], [380, -650], [0, -1300]], width: 440 , smooth: true }, r => [
            r.spinner(0.3, 0, 130, 3.5, { skin: 'neon', color: '#ff4fd8' }),
            neonBumper(r, 0.45, -0.55), neonBumper(r, 0.5, 0.55),
            r.spinner(0.7, 0, 130, -3, { skin: 'neon', color: '#4fd1ff' }),
            ...arcade(r)
        ]),

        H({ name: 'Pixel Pond', par: 4, path: [[0, 0], [740, -260], [0, -660], [740, -1020]], width: 320 }, r => [
            pixelPool(r, 0.2, 0.2, 110), pixelPool(r, 0.45, -0.3, 120),
            pixelPool(r, 0.7, 0.3, 110), neonPost(r, 0.58, 0.4),
            ...arcade(r)
        ]),

        H({ name: 'Bonus Round', par: 4, path: [[0, 0], [0, -900], [720, -900]], width: 340 }, r => [
            neonWall(r, 0.45, -1.2, 1.2),
            portal(r, 0.38, 0, 0.6, 0, '#ffe14f'),
            neonBumper(r, 0.75, 0.3), neonBumper(r, 0.8, -0.3),
            ...arcade(r, [0.2, 0.8])
        ]),

        H({ name: 'Joystick', par: 4, path: [[0, 0], [0, -1100]], width: 300, fairway: true, cup: 0.97 }, r => [
            r.fairway({ type: 'rect', x: -480, y: -700, w: 960, h: 260, radius: 60 }),
            neonWall(r, 0.6, -1.2, 1.2),
            portal(r, 0.5, 2.6, 0.75, 0, '#4fd1ff'),
            portal(r, 0.5, -2.6, 0.75, 0.6, '#ff4fd8'),
            neonBumper(r, 0.25, 0),
            ...arcade(r, [0.2, 0.85])
        ]),

        H({ name: 'Arcade Maze', par: 5, path: [[0, 0], [0, -720], [720, -720], [720, -1440], [0, -1440], [0, -2000]], width: 300 }, r => [
            neonWall(r, 0.12, -0.2, 1.2), neonWall(r, 0.25, -1.2, 0.2),
            laser(r, 0.38, 0, 120, 1.4),
            neonWall(r, 0.5, -0.2, 1.2), neonWall(r, 0.62, -1.2, 0.2),
            portal(r, 0.7, 0.4, 0.88, -0.4, '#ffe14f'),
            neonBumper(r, 0.8, 0),
            ...arcade(r, [0.15, 0.5, 0.85])
        ]),

        H({ name: 'Boss Level', par: 5, path: [[0, 0], [0, -800], [-720, -1100], [-720, -1900]], width: 420 }, r => [
            r.spinner(0.2, 0, 150, 3, { skin: 'neon', color: '#ff5d5d' }),
            laser(r, 0.38, 0, 140, 1.2),
            neonBumper(r, 0.5, -0.4, 22), neonBumper(r, 0.55, 0.4, 22),
            portal(r, 0.62, 0, 0.3, 0.6, '#ff5d5d'),
            r.spinner(0.8, 0, 150, -2.6, { skin: 'neon', color: '#ff4fd8' }),
            ...arcade(r)
        ]),

        H({ name: 'Pixel Storm', par: 4, path: [[0, 0], [-300, -600], [200, -1200], [-100, -1600]], width: 400 , smooth: true }, r => [
            laser(r, 0.25, -0.5, 300, 1.6), laser(r, 0.32, 0.5, -300, 1.2),
            neonBumper(r, 0.48, 0),
            laser(r, 0.65, -0.5, 300, 1.4), laser(r, 0.72, 0.5, -300, 1),
            ...arcade(r)
        ]),

        H({ name: 'Speed Run', par: 4, path: [[0, 0], [760, -260], [0, -660], [760, -1020], [0, -1380]], width: 280 }, r => [
            portal(r, 0.1, 0, 0.42, 0.3, '#4fd1ff'),
            pixelPool(r, 0.55, 0, 90),
            portal(r, 0.6, -0.4, 0.88, 0.2, '#ff4fd8'),
            neonPost(r, 0.75, 0.3), neonPost(r, 0.3, -0.4),
            ...arcade(r)
        ]),

        H({ name: 'Extra Life', par: 4, path: [[0, 0], [0, -620], [720, -920], [720, -1540]], width: 360 }, r => [
            r.area('water', r.band(0.5, 220)),
            portal(r, 0.38, -0.4, 0.62, 0.4, '#7cff6b'),
            neonBumper(r, 0.25, 0.3), neonBumper(r, 0.75, -0.3),
            ...arcade(r)
        ]),

        H({ name: 'Game Over', par: 5, path: [[0, 0], [0, -820], [720, -1180], [720, -1980], [120, -2380]], width: 380 }, r => [
            laser(r, 0.12, 0, 160, 1.3),
            portal(r, 0.2, 0.5, 0.45, -0.5, '#ffe14f'),
            neonBumper(r, 0.3, -0.3), pixelPool(r, 0.35, 0.35, 90),
            r.spinner(0.55, 0, 140, 3, { skin: 'neon', color: '#ff4fd8' }),
            laser(r, 0.7, -0.5, 260, 1.3), laser(r, 0.76, 0.5, -260, 1.1),
            portal(r, 0.85, -0.5, 0.92, 0.5, '#ff5d5d'),
            neonWall(r, 0.97, -1.2, -0.25), neonWall(r, 0.97, 0.25, 1.2),
            ...arcade(r, [0.1, 0.4, 0.7, 0.95])
        ])
    ])
}
