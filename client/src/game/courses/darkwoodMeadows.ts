import { COURSE_VERSION, type CourseData } from '@holey/shared'

const PI = Math.PI

export const darkwoodMeadows: CourseData = {
    version: COURSE_VERSION,
    name: 'Darkwood Meadows',
    theme: 'darkwood',
    assets: {},
    holes: [
        {
            name: 'First Steps',
            par: 2,
            tee: { x: 120, y: 620 },
            cup: { x: 120, y: 130 },
            objects: [
                { id: 'h1-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 240, h: 720, radius: 40 } }
            ]
        },

        {
            name: 'The Bend',
            par: 3,
            tee: { x: 130, y: 760 },
            cup: { x: 640, y: 130 },
            objects: [
                {
                    id: 'h2-fairway', type: 'fairway', layer: 0, rails: true,
                    shape: { type: 'polygon', points: [
                        { x: 0, y: 140 }, { x: 140, y: 0 }, { x: 760, y: 0 }, { x: 760, y: 260 },
                        { x: 260, y: 260 }, { x: 260, y: 860 }, { x: 0, y: 860 }
                    ] }
                }
            ]
        },

        {
            name: 'Pine Posts',
            par: 3,
            tee: { x: 140, y: 760 },
            cup: { x: 140, y: 120 },
            objects: [
                { id: 'h3-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 280, h: 860, radius: 40 } },
                { id: 'h3-post-1', type: 'post', layer: 0, x: 90, y: 560, radius: 16, bounce: 0.8 },
                { id: 'h3-post-2', type: 'post', layer: 0, x: 190, y: 560, radius: 16, bounce: 0.8 },
                { id: 'h3-post-3', type: 'post', layer: 0, x: 140, y: 420, radius: 16, bounce: 0.8 },
                { id: 'h3-post-4', type: 'post', layer: 0, x: 80, y: 290, radius: 16, bounce: 0.8 },
                { id: 'h3-post-5', type: 'post', layer: 0, x: 200, y: 290, radius: 16, bounce: 0.8 }
            ]
        },

        {
            name: 'Sandy Lane',
            par: 3,
            tee: { x: 170, y: 880 },
            cup: { x: 170, y: 140 },
            objects: [
                { id: 'h4-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 340, h: 980, radius: 50 } },
                { id: 'h4-bunker', type: 'sand', layer: 0, shape: { type: 'rect', x: 80, y: 300, w: 180, h: 120, radius: 40 } },
                { id: 'h4-lip', type: 'sand', layer: 0, shape: { type: 'arc', x: 170, y: 140, inner: 30, outer: 62, start: -2.4, end: -0.7 } }
            ]
        },

        {
            name: 'Fork in the Road',
            par: 3,
            tee: { x: 260, y: 880 },
            cup: { x: 260, y: 140 },
            objects: [
                { id: 'h5-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 520, h: 1000, radius: 50 } },
                { id: 'h5-divider', type: 'wall', layer: 0, closed: false, thickness: 8, bounce: 0.6, points: [{ x: 260, y: 260 }, { x: 260, y: 760 }] },
                { id: 'h5-sand', type: 'sand', layer: 0, shape: { type: 'rect', x: 30, y: 430, w: 140, h: 150, radius: 40 } },
                { id: 'h5-post-1', type: 'post', layer: 0, x: 350, y: 600, radius: 16, bounce: 0.8 },
                { id: 'h5-post-2', type: 'post', layer: 0, x: 440, y: 420, radius: 16, bounce: 0.8 }
            ]
        },

        {
            name: 'Gentle Hill',
            par: 3,
            tee: { x: 150, y: 940 },
            cup: { x: 150, y: 150 },
            objects: [
                { id: 'h6-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 300, h: 1040, radius: 40 } },
                { id: 'h6-hill', type: 'slope', layer: 0, shape: { type: 'rect', x: 0, y: 380, w: 300, h: 220, radius: 0 }, push: { x: 0, y: 150 } }
            ]
        },

        {
            name: 'Meadow Bean',
            par: 3,
            tee: { x: 180, y: 820 },
            cup: { x: 590, y: 200 },
            objects: [
                {
                    id: 'h7-fairway', type: 'fairway', layer: 0, rails: true,
                    shape: { type: 'curve', points: [
                        { x: 120, y: 900 }, { x: 40, y: 700 }, { x: 60, y: 450 }, { x: 150, y: 220 }, { x: 330, y: 90 },
                        { x: 560, y: 80 }, { x: 700, y: 180 }, { x: 680, y: 330 }, { x: 520, y: 330 }, { x: 380, y: 400 },
                        { x: 300, y: 560 }, { x: 300, y: 760 }, { x: 260, y: 900 }
                    ] }
                },
                { id: 'h7-bunker', type: 'sand', layer: 0, shape: { type: 'circle', x: 290, y: 300, r: 60 } }
            ]
        },

        {
            name: 'Bumper Garden',
            par: 3,
            tee: { x: 110, y: 700 },
            cup: { x: 490, y: 110 },
            objects: [
                { id: 'h8-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 600, h: 800, radius: 60 } },
                { id: 'h8-bumper-1', type: 'bumper', layer: 0, a: { x: 300, y: 400 }, b: { x: 300, y: 400 }, radius: 22, kick: 220 },
                { id: 'h8-bumper-2', type: 'bumper', layer: 0, a: { x: 190, y: 280 }, b: { x: 190, y: 280 }, radius: 18, kick: 220 },
                { id: 'h8-bumper-3', type: 'bumper', layer: 0, a: { x: 410, y: 520 }, b: { x: 410, y: 520 }, radius: 18, kick: 220 },
                { id: 'h8-bumper-4', type: 'bumper', layer: 0, a: { x: 420, y: 250 }, b: { x: 420, y: 250 }, radius: 16, kick: 220 },
                { id: 'h8-bumper-5', type: 'bumper', layer: 0, a: { x: 180, y: 540 }, b: { x: 180, y: 540 }, radius: 16, kick: 220 }
            ]
        },

        {
            name: 'Lily Pond',
            par: 3,
            tee: { x: 260, y: 900 },
            cup: { x: 260, y: 130 },
            objects: [
                { id: 'h9-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 520, h: 1000, radius: 60 } },
                {
                    id: 'h9-pond', type: 'water', layer: 0,
                    shape: { type: 'curve', points: [
                        { x: 110, y: 500 }, { x: 160, y: 390 }, { x: 260, y: 370 }, { x: 370, y: 400 },
                        { x: 410, y: 500 }, { x: 360, y: 610 }, { x: 260, y: 630 }, { x: 150, y: 600 }
                    ] }
                }
            ]
        },

        {
            name: 'Creek Crossing',
            par: 3,
            tee: { x: 250, y: 1000 },
            cup: { x: 250, y: 140 },
            objects: [
                { id: 'h10-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 340, h: 1100, radius: 40 } },
                { id: 'h10-creek', type: 'water', layer: 0, shape: { type: 'rect', x: 0, y: 460, w: 340, h: 150, radius: 0 } },
                { id: 'h10-bridge', type: 'bridge', layer: 1, a: { x: 100, y: 670 }, b: { x: 100, y: 400 }, width: 90, rails: true }
            ]
        },

        {
            name: 'Fern Loop',
            par: 3,
            tee: { x: 420, y: 770 },
            cup: { x: 420, y: 70 },
            objects: [
                { id: 'h11-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'donut', x: 420, y: 420, inner: 160, outer: 380 } },
                { id: 'h11-sand', type: 'sand', layer: 0, shape: { type: 'arc', x: 420, y: 420, inner: 180, outer: 360, start: PI * 0.88, end: PI * 1.12 } },
                { id: 'h11-post-1', type: 'post', layer: 0, x: 690, y: 420, radius: 16, bounce: 0.8 },
                { id: 'h11-post-2', type: 'post', layer: 0, x: 640, y: 250, radius: 16, bounce: 0.8 }
            ]
        },

        {
            name: 'Hillside',
            par: 3,
            tee: { x: 210, y: 960 },
            cup: { x: 110, y: 140 },
            objects: [
                { id: 'h12-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 420, h: 1040, radius: 40 } },
                { id: 'h12-slope', type: 'slope', layer: 0, shape: { type: 'rect', x: 0, y: 300, w: 300, h: 420, radius: 0 }, push: { x: 140, y: 0 } },
                { id: 'h12-sand', type: 'sand', layer: 0, shape: { type: 'rect', x: 300, y: 300, w: 120, h: 420, radius: 0 } }
            ]
        },

        {
            name: 'Sliding Gate',
            par: 3,
            tee: { x: 160, y: 900 },
            cup: { x: 160, y: 150 },
            objects: [
                { id: 'h13-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 320, h: 1000, radius: 40 } },
                { id: 'h13-wall-left', type: 'wall', layer: 0, closed: false, thickness: 8, bounce: 0.6, points: [{ x: 0, y: 500 }, { x: 100, y: 500 }] },
                { id: 'h13-wall-right', type: 'wall', layer: 0, closed: false, thickness: 8, bounce: 0.6, points: [{ x: 220, y: 500 }, { x: 320, y: 500 }] },
                {
                    id: 'h13-gate', type: 'wall', layer: 0, closed: false, thickness: 8, bounce: 0.6,
                    points: [{ x: 100, y: 500 }, { x: 160, y: 500 }],
                    motion: {
                        mode: 'pingpong',
                        pivot: { x: 130, y: 500 },
                        keys: [
                            { t: 0, x: 0, y: 0, angle: 0, ease: 'smooth' },
                            { t: 2.4, x: 60, y: 0, angle: 0, ease: 'smooth' }
                        ]
                    }
                }
            ]
        },

        {
            name: 'Old Windmill',
            par: 3,
            tee: { x: 180, y: 900 },
            cup: { x: 180, y: 150 },
            objects: [
                { id: 'h14-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 360, h: 1000, radius: 40 } },
                { id: 'h14-funnel-left', type: 'wall', layer: 0, closed: false, thickness: 8, bounce: 0.6, points: [{ x: 0, y: 560 }, { x: 130, y: 480 }] },
                { id: 'h14-funnel-right', type: 'wall', layer: 0, closed: false, thickness: 8, bounce: 0.6, points: [{ x: 360, y: 560 }, { x: 230, y: 480 }] },
                {
                    id: 'h14-blades', type: 'wall', layer: 0, closed: false, thickness: 7, bounce: 0.7,
                    points: [{ x: 110, y: 400 }, { x: 250, y: 400 }],
                    motion: {
                        mode: 'loop',
                        pivot: { x: 180, y: 400 },
                        keys: [
                            { t: 0, x: 0, y: 0, angle: 0, ease: 'linear' },
                            { t: 4, x: 0, y: 0, angle: PI * 2, ease: 'linear' }
                        ]
                    }
                },
                { id: 'h14-hub', type: 'post', layer: 0, x: 180, y: 400, radius: 10, bounce: 0.6 }
            ]
        },

        {
            name: 'Island Green',
            par: 3,
            tee: { x: 150, y: 820 },
            cup: { x: 430, y: 320 },
            objects: [
                { id: 'h15-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 760, h: 900, radius: 60 } },
                { id: 'h15-moat', type: 'water', layer: 0, shape: { type: 'donut', x: 380, y: 360, inner: 140, outer: 290 } },
                { id: 'h15-bridge', type: 'bridge', layer: 1, a: { x: 380, y: 690 }, b: { x: 380, y: 460 }, width: 90, rails: true },
                { id: 'h15-backstop', type: 'arcWall', layer: 0, x: 380, y: 360, radius: 125, start: PI * 1.15, end: PI * 1.85, thickness: 6, bounce: 0.5 }
            ]
        },

        {
            name: 'Pinball Glade',
            par: 3,
            tee: { x: 280, y: 880 },
            cup: { x: 280, y: 120 },
            objects: [
                { id: 'h16-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 560, h: 960, radius: 60 } },
                { id: 'h16-flipper-left', type: 'bumper', layer: 0, a: { x: 120, y: 620 }, b: { x: 200, y: 560 }, radius: 10, kick: 180 },
                { id: 'h16-flipper-right', type: 'bumper', layer: 0, a: { x: 440, y: 620 }, b: { x: 360, y: 560 }, radius: 10, kick: 180 },
                { id: 'h16-bumper-1', type: 'bumper', layer: 0, a: { x: 280, y: 420 }, b: { x: 280, y: 420 }, radius: 22, kick: 220 },
                { id: 'h16-bumper-2', type: 'bumper', layer: 0, a: { x: 170, y: 330 }, b: { x: 170, y: 330 }, radius: 18, kick: 220 },
                { id: 'h16-bumper-3', type: 'bumper', layer: 0, a: { x: 390, y: 330 }, b: { x: 390, y: 330 }, radius: 18, kick: 220 },
                { id: 'h16-guard', type: 'arcWall', layer: 0, x: 280, y: 120, radius: 60, start: PI / 2 + 0.7, end: PI / 2 - 0.7, thickness: 6, bounce: 0.5 }
            ]
        },

        {
            name: 'Switchback Trail',
            par: 4,
            tee: { x: 110, y: 880 },
            cup: { x: 600, y: 140 },
            objects: [
                { id: 'h17-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 720, h: 1000, radius: 50 } },
                { id: 'h17-divider-low', type: 'wall', layer: 0, closed: false, thickness: 8, bounce: 0.6, points: [{ x: 0, y: 680 }, { x: 520, y: 680 }] },
                { id: 'h17-divider-high', type: 'wall', layer: 0, closed: false, thickness: 8, bounce: 0.6, points: [{ x: 720, y: 360 }, { x: 200, y: 360 }] },
                { id: 'h17-pond', type: 'water', layer: 0, shape: { type: 'circle', x: 360, y: 520, r: 70 } },
                { id: 'h17-sand', type: 'sand', layer: 0, shape: { type: 'rect', x: 400, y: 90, w: 90, h: 140, radius: 35 } }
            ]
        },

        {
            name: 'Darkwood Finale',
            par: 4,
            tee: { x: 210, y: 1400 },
            cup: { x: 210, y: 140 },
            objects: [
                { id: 'h18-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 420, h: 1500, radius: 50 } },
                { id: 'h18-creek', type: 'water', layer: 0, shape: { type: 'rect', x: 0, y: 1000, w: 420, h: 120, radius: 0 } },
                { id: 'h18-bridge', type: 'bridge', layer: 1, a: { x: 320, y: 1180 }, b: { x: 320, y: 940 }, width: 90, rails: true },
                { id: 'h18-funnel-left', type: 'wall', layer: 0, closed: false, thickness: 8, bounce: 0.6, points: [{ x: 0, y: 780 }, { x: 140, y: 720 }] },
                { id: 'h18-funnel-right', type: 'wall', layer: 0, closed: false, thickness: 8, bounce: 0.6, points: [{ x: 420, y: 780 }, { x: 280, y: 720 }] },
                {
                    id: 'h18-blades', type: 'wall', layer: 0, closed: false, thickness: 7, bounce: 0.7,
                    points: [{ x: 140, y: 640 }, { x: 280, y: 640 }],
                    motion: {
                        mode: 'loop',
                        pivot: { x: 210, y: 640 },
                        keys: [
                            { t: 0, x: 0, y: 0, angle: 0, ease: 'linear' },
                            { t: 4, x: 0, y: 0, angle: PI * 2, ease: 'linear' }
                        ]
                    }
                },
                { id: 'h18-hub', type: 'post', layer: 0, x: 210, y: 640, radius: 10, bounce: 0.6 },
                { id: 'h18-hill', type: 'slope', layer: 0, shape: { type: 'rect', x: 0, y: 260, w: 420, h: 200, radius: 0 }, push: { x: 0, y: 140 } },
                { id: 'h18-backstop', type: 'arcWall', layer: 0, x: 210, y: 140, radius: 70, start: PI * 1.15, end: PI * 1.85, thickness: 6, bounce: 0.5 }
            ]
        }
    ]
}
