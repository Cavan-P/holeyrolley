
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

export const SKINS = [
    'rock', 'shell', 'starfish', 'crab', 'ocean', 'palm', 'umbrella', 'towel',
    'asteroid', 'ufo', 'pulsar', 'zerog', 'meteor', 'planet', 'satellite', 'rocket',
    'basalt', 'geyser', 'lavarock', 'volcano', 'vent',
    'iceblock', 'pine', 'snowman', 'igloo',
    'neon', 'cabinet', 'slime', 'coin',
    'ghost', 'fence', 'tombstone', 'deadtree', 'pumpkin',
    'candycane', 'gumball', 'lollipop', 'cupcake', 'gumdrop',
    'gear', 'girder', 'pipe', 'barrel', 'tree', 'bush'
] as const
export type Skin = typeof SKINS[number]

export type Style = {
    color?: string
    image?: string
    opacity?: number
    skin?: Skin
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
export type AreaObject = Base & { type: 'sand' | 'ice' | 'water' | 'lava', shape: ShapeData }
export type SlopeObject = Base & { type: 'slope', shape: ShapeData, push: Vec }

export type Phase = { on: number, off: number, offset: number }

type Solid = { low?: boolean, hits?: number, phase?: Phase }

export type WallObject = Base & Solid & { type: 'wall', points: Vec[], closed: boolean, thickness: number, bounce: number }

export type CurveWallObject = Base & Solid & { type: 'curveWall', points: Vec[], closed: boolean, thickness: number, bounce: number }
export type ArcWallObject = Base & Solid & { type: 'arcWall', x: number, y: number, radius: number, start: number, end: number, thickness: number, bounce: number }

export type BumperObject = Base & Solid & { type: 'bumper', a: Vec, b: Vec, radius: number, kick: number }
export type PostObject = Base & Solid & { type: 'post', x: number, y: number, radius: number, bounce: number }

export type BridgeObject = Base & { type: 'bridge', a: Vec, b: Vec, width: number, rails: boolean }

export type SpringObject = Base & { type: 'spring', shape: ShapeData, power: number }
export type ConveyorObject = Base & { type: 'conveyor', shape: ShapeData, push: Vec }
export type PortalObject = Base & { type: 'portal', a: Vec, b: Vec, radius: number }

export type MagnetObject = Base & { type: 'magnet', x: number, y: number, radius: number, strength: number }
export type FallerObject = Base & { type: 'faller', shape: ShapeData, every: number, size: number }

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
    | MagnetObject
    | SpringObject
    | ConveyorObject
    | PortalObject
    | FallerObject
    | DecorObject

export type ObjectType = CourseObject['type']

export type HoleData = {
    name: string
    par: number
    tee: Vec
    cup: Vec
    extraCups?: Vec[]
    voidEdge?: boolean
    
    objects: CourseObject[]
}

export type CourseData = {
    version: typeof COURSE_VERSION
    name: string
    theme: string
    holes: HoleData[]

    assets: Record<string, string>
}
