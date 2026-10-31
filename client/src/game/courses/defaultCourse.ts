import { COURSE_VERSION, type CourseData } from '@holey/shared'

export const defaultCourse: CourseData = {
    version: COURSE_VERSION,
    name: 'Test Course',
    theme: 'classic',
    assets: {},
    holes: [
        {
            name: 'The Dogleg',
            par: 3,
            tee: { x: 180, y: 1200 },
            cup: { x: 1370, y: 170 },
            objects: [
                {
                    id: 'h1-fairway', type: 'fairway', layer: 0, rails: true,
                    shape: { type: 'polygon', points: [
                        { x: 0, y: 160 }, { x: 160, y: 0 }, { x: 1500, y: 0 }, { x: 1500, y: 360 },
                        { x: 360, y: 360 }, { x: 360, y: 1300 }, { x: 0, y: 1300 }
                    ] }
                },
                { id: 'h1-slope', type: 'slope', layer: 0, shape: { type: 'rect', x: 0, y: 620, w: 360, h: 140, radius: 0 }, push: { x: 160, y: 0 } },
                { id: 'h1-ice', type: 'ice', layer: 0, shape: { type: 'rect', x: 40, y: 800, w: 280, h: 110, radius: 30 } },
                { id: 'h1-water', type: 'water', layer: 0, shape: { type: 'rect', x: 900, y: 140, w: 200, h: 220, radius: 40 } },
                { id: 'h1-sand', type: 'sand', layer: 0, shape: { type: 'arc', x: 1370, y: 170, inner: 36, outer: 66, start: 2.2, end: 4.1 } },
                {
                    id: 'h1-diamond', type: 'wall', layer: 0, closed: true, thickness: 6, bounce: 0.9,
                    points: [{ x: 180, y: 960 }, { x: 220, y: 1000 }, { x: 180, y: 1040 }, { x: 140, y: 1000 }]
                },
                { id: 'h1-gate-top', type: 'wall', layer: 0, closed: false, thickness: 6, bounce: 0.6, points: [{ x: 800, y: 0 }, { x: 800, y: 130 }] },
                { id: 'h1-gate-bottom', type: 'wall', layer: 0, closed: false, thickness: 6, bounce: 0.6, points: [{ x: 800, y: 230 }, { x: 800, y: 360 }] },
                { id: 'h1-post-1', type: 'bumper', layer: 0, a: { x: 250, y: 240 }, b: { x: 250, y: 240 }, radius: 14, kick: 260 },
                { id: 'h1-post-2', type: 'bumper', layer: 0, a: { x: 600, y: 250 }, b: { x: 600, y: 250 }, radius: 12, kick: 260 },
                { id: 'h1-backstop', type: 'arcWall', layer: 0, x: 1370, y: 170, radius: 80, start: -1.2, end: 1.2, thickness: 6, bounce: 0.6 }
            ]
        },
        {
            name: 'Over the River',
            par: 3,
            tee: { x: 130, y: 250 },
            cup: { x: 1290, y: 250 },
            objects: [
                { id: 'h2-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 1420, h: 500, radius: 60 } },
                { id: 'h2-river', type: 'water', layer: 0, shape: { type: 'curve', points: [
                    { x: 640, y: -20 }, { x: 760, y: -20 }, { x: 790, y: 250 }, { x: 760, y: 520 }, { x: 640, y: 520 }, { x: 610, y: 250 }
                ] } },
                { id: 'h2-bridge', type: 'bridge', layer: 1, a: { x: 540, y: 250 }, b: { x: 860, y: 250 }, width: 90, rails: true },
                {
                    id: 'h2-spinner', type: 'wall', layer: 0, closed: false, thickness: 7, bounce: 0.7,
                    points: [{ x: 1080, y: 170 }, { x: 1080, y: 330 }],
                    motion: {
                        mode: 'loop',
                        pivot: { x: 1080, y: 250 },
                        keys: [
                            { t: 0, x: 0, y: 0, angle: 0, ease: 'linear' },
                            { t: 4, x: 0, y: 0, angle: Math.PI * 2, ease: 'linear' }
                        ]
                    }
                },
                { id: 'h2-sand', type: 'sand', layer: 0, shape: { type: 'curve', points: [
                    { x: 1200, y: 360 }, { x: 1300, y: 330 }, { x: 1380, y: 400 }, { x: 1300, y: 460 }, { x: 1210, y: 440 }
                ] } },
                {
                    id: 'h2-slider', type: 'bumper', layer: 0, a: { x: 330, y: 120 }, b: { x: 330, y: 120 }, radius: 16, kick: 220,
                    motion: {
                        mode: 'pingpong',
                        pivot: { x: 330, y: 120 },
                        keys: [
                            { t: 0, x: 0, y: 0, angle: 0, ease: 'smooth' },
                            { t: 2.5, x: 0, y: 260, angle: 0, ease: 'smooth' }
                        ]
                    }
                }
            ]
        }
    ]
}
