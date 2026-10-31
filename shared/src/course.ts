
export const COURSE_VERSION = 1

export type Vec = { x: number, y: number }

export type ShapeData =
    | { type: 'rect', x: number, y: number, w: number, h: number, radius: number }
    | { type: 'circle', x: number, y: number, r: number }
    | { type: 'donut', x: number, y: number, inner: number, outer: number }
    | { type: 'arc', x: number, y: number, inner: number, outer: number, start: number, end: number }
    | { type: 'polygon', points: Vec[] }
    | { type: 'curve', points: Vec[] }

export type ShapeType = ShapeData['type']

export type Style = {
    color?: string
    image?: string
    opacity?: number
}

export type Keyframe = {
    t: number
    x: number
    y: number
    angle: number
    ease: 'linear' | 'smooth'
}

export type MotionPath = {
    keys: Keyframe[]
    mode: 'loop' | 'pingpong'
    pivot: Vec
}

export type Layer = 0 | 1

type Base = {
    id: string
    layer: Layer
    style?: Style
    motion?: MotionPath
}

export type FairwayObject = Base & { type: 'fairway', shape: ShapeData, rails: boolean }
export type AreaObject = Base & { type: 'sand' | 'ice' | 'water', shape: ShapeData }
export type SlopeObject = Base & { type: 'slope', shape: ShapeData, push: Vec }

export type WallObject = Base & { type: 'wall', points: Vec[], closed: boolean, thickness: number, bounce: number }

export type CurveWallObject = Base & { type: 'curveWall', points: Vec[], closed: boolean, thickness: number, bounce: number }
export type ArcWallObject = Base & { type: 'arcWall', x: number, y: number, radius: number, start: number, end: number, thickness: number, bounce: number }

export type BumperObject = Base & { type: 'bumper', a: Vec, b: Vec, radius: number, kick: number }
export type PostObject = Base & { type: 'post', x: number, y: number, radius: number, bounce: number }

export type BridgeObject = Base & { type: 'bridge', a: Vec, b: Vec, width: number, rails: boolean }

export type DecorObject = Base & { type: 'decor', x: number, y: number, w: number, h: number, rotation: number }

export type CourseObject =
    | FairwayObject
    | AreaObject
    | SlopeObject
    | WallObject
    | CurveWallObject
    | ArcWallObject
    | BumperObject
    | PostObject
    | BridgeObject
    | DecorObject

export type ObjectType = CourseObject['type']

export type HoleData = {
    name: string
    par: number
    tee: Vec
    cup: Vec
    
    objects: CourseObject[]
}

export type CourseData = {
    version: typeof COURSE_VERSION
    name: string
    theme: string
    holes: HoleData[]

    assets: Record<string, string>
}
