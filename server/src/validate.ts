import { BALL_COLORS, CELEBRATIONS, COURSES, HATS, HOLE_RANGES, STROKE_LIMITS, TIME_LIMITS, maxNameLength, type ClientMsg, type Cosmetics, type HoleRange } from '@holey/shared'

export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

export function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
    return typeof value === 'string' && list.includes(value as T)
}

export function parseCosmetics(value: unknown): Cosmetics | null {
    if(!isObject(value)) return null

    if(!isOneOf(BALL_COLORS, value.color)) return null
    if(!isOneOf(HATS, value.hat)) return null
    if(!isOneOf(CELEBRATIONS, value.celebration)) return null

    return {
        color: value.color,
        hat: value.hat,
        celebration: value.celebration
    }
}

export function parseName(value: unknown): string | null {
    if(typeof value !== 'string') return null

    const name = value.trim()

    if(name.length > 0 && name.length <= maxNameLength) return name

    return null
}

export function parseClientMsg(value: unknown): ClientMsg | null {
    if(!isObject(value)) return null

    switch(value.type){
        case 'create': {
            const name = parseName(value.name)
            const cosmetics = parseCosmetics(value.cosmetics)
            if(name === null) return null
            if(cosmetics === null) return null

            return {
                type: 'create',
                name,
                cosmetics
            }
        }
        case 'quickplay': {
            const name = parseName(value.name)
            const cosmetics = parseCosmetics(value.cosmetics)
            if(name === null || cosmetics === null) return null

            return { type: 'quickplay', name, cosmetics }
        }

        case 'join': {
            const name = parseName(value.name)
            const cosmetics = parseCosmetics(value.cosmetics)

            if(name === null) return null
            if(cosmetics === null) return null

            if(typeof value.room !== 'string') return null
            if(value.token !== undefined && typeof value.token !== 'string') return null

            return {
                type: 'join',
                room: value.room,
                name,
                cosmetics,
                ...(value.token === undefined ? {} : { token: value.token })
            }
        }

        case 'update': {
            if(!isObject(value.settings)) return null
            if(typeof value.settings.collision !== 'boolean') return null
            if(typeof value.settings.course !== 'string' || !Object.hasOwn(COURSES, value.settings.course)) return null
            const { strokeLimit, timeLimit } = value.settings
            if(!STROKE_LIMITS.some(l => l === strokeLimit)) return null
            if(!TIME_LIMITS.some(l => l === timeLimit)) return null
            const holes = value.settings.holes
            if(!HOLE_RANGES.some(r => r === holes)) return null

            return {
                type: 'update',
                settings: {
                    collision: value.settings.collision,
                    course: value.settings.course,
                    strokeLimit: strokeLimit as number | null,
                    timeLimit: timeLimit as number | null,
                    holes: holes as HoleRange
                }
            }
        }

        case 'leave': {
            return { type: 'leave' }
        }
        case 'place': {
            if(typeof value.x !== 'number' || !Number.isFinite(value.x)) return null
            if(typeof value.y !== 'number' || !Number.isFinite(value.y)) return null

            return { type: 'place', x: value.x, y: value.y }
        }
        case 'shoot': {
            if(typeof value.angle !== 'number' || !Number.isFinite(value.angle)) return null
            if(typeof value.power !== 'number' || !Number.isFinite(value.power) || value.power < 0 || value.power > 1) return null

            return {
                type: 'shoot',
                angle: value.angle,
                power: value.power
            }
        }
        case 'start': {
            return { type: 'start' }
        }
        case 'next': {
            return { type: 'next' }
        }
        case 'endHole': {
            return { type: 'endHole' }
        }

        default:
            return null
    }
}