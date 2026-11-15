import type { HoleData } from '../course'

export const practiceGreen: HoleData = {
    name: 'Practice Green',
    par: 2,
    tee: { x: 500, y: 340 },
    cup: { x: 880, y: 120 },
    objects: [
        { id: 'practice-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: 1000, h: 680, radius: 40 } }
    ]
}
