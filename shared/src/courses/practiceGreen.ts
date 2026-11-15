import type { CourseObject, HoleData, Vec } from '../course'

export const OBSTACLE_KINDS = ['post', 'bumper', 'sand', 'water', 'wall'] as const
export type ObstacleKind = typeof OBSTACLE_KINDS[number]

export type GreenPiece = { owner: string, kind: ObstacleKind, x: number, y: number }

const W = 1000
const H = 680
const EDGE = 50
const CLEARANCE = 70

export const practiceGreen: HoleData = {
    name: 'Practice Green',
    par: 2,
    tee: { x: 500, y: 340 },
    cup: { x: 880, y: 120 },
    extraCups: [{ x: 130, y: 120 }, { x: 140, y: 570 }],
    objects: [
        { id: 'practice-fairway', type: 'fairway', layer: 0, rails: true, shape: { type: 'rect', x: 0, y: 0, w: W, h: H, radius: 40 } },
        { id: 'practice-sand', type: 'sand', layer: 0, shape: { type: 'circle', x: 820, y: 540, r: 70 } },
        { id: 'practice-post-1', type: 'post', layer: 0, x: 250, y: 190, radius: 14, bounce: 0.8 },
        { id: 'practice-post-2', type: 'post', layer: 0, x: 270, y: 480, radius: 14, bounce: 0.8 },
        { id: 'practice-bumper', type: 'bumper', layer: 0, a: { x: 700, y: 210 }, b: { x: 700, y: 210 }, radius: 18, kick: 220 }
    ]
}

export function pieceObject(p: GreenPiece): CourseObject {
    const id = `piece-${p.owner}`

    switch(p.kind){
        case 'post': return { id, type: 'post', layer: 0, x: p.x, y: p.y, radius: 18, bounce: 0.8 }
        case 'bumper': return { id, type: 'bumper', layer: 0, a: { x: p.x, y: p.y }, b: { x: p.x, y: p.y }, radius: 20, kick: 220 }
        case 'sand': return { id, type: 'sand', layer: 0, shape: { type: 'circle', x: p.x, y: p.y, r: 55 } }
        case 'water': return { id, type: 'water', layer: 0, shape: { type: 'circle', x: p.x, y: p.y, r: 40 } }
        case 'wall': return { id, type: 'wall', layer: 0, points: [{ x: p.x - 50, y: p.y }, { x: p.x + 50, y: p.y }], closed: false, thickness: 8, bounce: 0.7 }
    }
}

export function practiceGreenWith(pieces: GreenPiece[]): HoleData {
    return { ...practiceGreen, objects: [...practiceGreen.objects, ...pieces.map(pieceObject)] }
}

export function canPlace(x: number, y: number): boolean {
    if(x < EDGE || x > W - EDGE || y < EDGE || y > H - EDGE) return false

    const keepClear: Vec[] = [practiceGreen.tee, practiceGreen.cup, ...(practiceGreen.extraCups ?? [])]
    return keepClear.every(p => Math.hypot(p.x - x, p.y - y) > CLEARANCE)
}
