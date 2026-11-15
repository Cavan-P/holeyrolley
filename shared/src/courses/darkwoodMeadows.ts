import { COURSE_VERSION, type CourseData, type CourseObject } from '../course'
import { routeHole as H, setTier, type Route } from './kit'

setTier(0)

const forest = (r: Route, ts: number[] = [0.15, 0.45, 0.75]): CourseObject[] =>
    ts.flatMap((t, i) => [
        r.decor(t, -1, 110 + (i % 2) * 40, i % 3 ? 'tree' : 'bush', undefined, 30),
        r.decor(t + 0.1, 1, 120 + (i % 3) * 30, i % 2 ? 'bush' : 'tree', undefined, 40)
    ])

const trunk = (r: Route, t: number, side: number) => r.post(t, side, 16, { color: '#4a2e1c' })

export const darkwoodMeadows: CourseData = {
    version: COURSE_VERSION,
    name: 'Darkwood Meadows',
    theme: 'darkwood',
    assets: {},
    holes: [
        H({ name: 'First Steps', par: 2, path: [[0, 0], [0, -720]], width: 300 }, r => [
            trunk(r, 0.5, 0.65),
            ...forest(r)
        ]),

        H({ name: 'Sand Trap', par: 3, path: [[0, 0], [0, -880]], width: 320 }, r => [
            r.area('sand', r.circle(0.55, 0, 80)),
            r.area('sand', r.circle(0.85, 0.7, 50)),
            ...forest(r)
        ]),

        H({ name: 'The Bend', par: 3, path: [[0, 0], [0, -680], [620, -680]], width: 300 }, r => [
            r.area('sand', r.circle(0.5, -1, 80)),
            ...forest(r)
        ]),

        H({ name: 'Pond Hop', par: 3, path: [[0, 0], [0, -900]], width: 380 }, r => [
            r.area('water', r.circle(0.5, 0, 110)),
            ...forest(r)
        ]),

        H({ name: 'Gentle Hill', par: 3, path: [[0, 0], [0, -520], [420, -880]], width: 300 }, r => [
            r.slopeAt(0.45, 200, -140),
            r.area('sand', r.circle(0.93, 0.8, 45)),
            ...forest(r)
        ]),

        H({ name: 'Bumper Garden', par: 3, path: [[0, 0], [0, -560], [560, -860]], width: 380 }, r => [
            r.bumper(0.35, -0.3, 20), r.bumper(0.5, 0.3, 18), r.bumper(0.68, -0.2, 20), r.bumper(0.62, 0.45, 16),
            ...forest(r)
        ]),

        H({ name: 'Creek Crossing', par: 3, path: [[0, 0], [0, -980]], width: 340 }, r => [
            r.area('water', r.band(0.5, 140)),
            r.bridge(0.42, 0.58, 0.5, 90, true),
            ...forest(r)
        ]),

        H({ name: 'Pine Posts', par: 3, path: [[0, 0], [0, -450], [500, -800], [500, -1100]], width: 300 }, r => [
            trunk(r, 0.25, -0.4), trunk(r, 0.35, 0.4), trunk(r, 0.5, 0),
            trunk(r, 0.65, -0.4), trunk(r, 0.75, 0.4),
            ...forest(r)
        ]),

        H({ name: 'Dogleg Left', par: 4, path: [[0, 0], [0, -800], [-660, -1060]], width: 300 }, r => [
            r.area('sand', r.circle(0.58, 1, 90)),
            trunk(r, 0.62, -0.5),
            ...forest(r)
        ]),

        H({ name: 'Sliding Gate', par: 3, path: [[0, 0], [0, -1000]], width: 320 }, r => [
            r.across(0.5, -1.1, -0.3, 9),
            r.across(0.5, 0.3, 1.1, 9),
            r.across(0.5, -0.3, 0.05, 9, {}, r.slide(0.5, 110, 2.4)),
            ...forest(r)
        ]),

        H({ name: 'Old Windmill', par: 4, path: [[0, 0], [0, -720], [460, -1120]], width: 340 }, r => [
            r.across(0.38, -1.2, -0.42, 9),
            r.across(0.38, 0.42, 1.2, 9),
            r.spinner(0.48, 0, 130, 4.5),
            r.post(0.48, 0, 10, { color: '#4a2e1c' }),
            ...forest(r)
        ]),

        H({ name: 'Hairpin', par: 4, path: [[0, 0], [0, -880], [660, -880], [660, -160]], width: 300, smooth: true }, r => [
            r.area('sand', r.circle(0.4, -1, 80)),
            r.area('water', r.circle(0.5, 0.95, 60)),
            ...forest(r, [0.2, 0.8])
        ]),

        H({ name: 'Island Green', par: 4, path: [[0, 0], [0, -820], [560, -1080]], width: 440 }, r => {
            const c = r.p(0.96)
            return [
                { id: 'island-moat', type: 'water', layer: 0, shape: { type: 'donut', x: c.x, y: c.y, inner: 100, outer: 200 } },
                r.bridge(0.78, 0.92, 0, 80, true),
                ...forest(r)
            ]
        }),

        H({ name: 'Hillside', par: 4, path: [[0, 0], [0, -560], [780, -860], [780, -1380]], width: 340, smooth: true }, r => [
            r.slope(r.strip(0.35, 0.65, -1.2, 1.2), 0, 130),
            r.area('sand', r.strip(0.38, 0.62, 0.65, 1.2)),
            ...forest(r)
        ]),

        H({ name: 'Fork in the Road', par: 4, path: [[0, 0], [0, -700], [600, -1150]], width: 520 }, r => [
            r.lengthwise(0.12, 0.6, 0, 9),
            r.area('sand', r.strip(0.25, 0.45, -1, -0.15)),
            trunk(r, 0.3, 0.55), trunk(r, 0.42, 0.4),
            r.area('water', r.circle(0.82, 0.55, 60)),
            ...forest(r)
        ]),

        H({ name: 'Pinball Glade', par: 4, path: [[0, 0], [0, -600], [760, -1000], [760, -1560]], width: 400 }, r => [
            r.bumper(0.3, -0.4, 18), r.bumper(0.35, 0.4, 22), r.bumper(0.5, 0, 22),
            r.bumper(0.62, -0.45, 18), r.bumper(0.7, 0.45, 18),
            { id: 'flipper-l', type: 'bumper', layer: 0, a: r.p(0.83, -0.75), b: r.p(0.87, -0.35), radius: 10, kick: 180 },
            { id: 'flipper-r', type: 'bumper', layer: 0, a: r.p(0.83, 0.75), b: r.p(0.87, 0.35), radius: 10, kick: 180 },
            ...forest(r)
        ]),

        H({ name: 'Switchback Trail', par: 5, path: [[0, 0], [820, 0], [820, -520], [0, -520], [0, -1040], [820, -1040]], width: 300 }, r => [
            r.area('water', r.circle(0.3, 0, 60)),
            r.area('sand', r.circle(0.5, 0.4, 70)),
            r.spinner(0.69, 0, 85, 5),
            ...forest(r, [0.1, 0.5, 0.9])
        ]),

        H({ name: 'Darkwood Finale', par: 5, path: [[0, 0], [0, -800], [700, -1200], [700, -2000], [200, -2400]], width: 340, smooth: true }, r => [
            r.slopeAt(0.18, 200, -140),
            r.area('water', r.band(0.4, 140)),
            r.bridge(0.35, 0.45, 0.4, 85, true),
            r.across(0.62, -1.2, -0.42, 9),
            r.across(0.62, 0.42, 1.2, 9),
            r.spinner(0.7, 0, 115, 4.5),
            r.area('sand', r.circle(0.85, 0.8, 70)),
            ...forest(r, [0.1, 0.3, 0.5, 0.7, 0.9])
        ])
    ]
}
