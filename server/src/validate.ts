import { BALL_COLORS, CELEBRATIONS, HATS, maxNameLength, type ClientMsg, type Cosmetics } from '@holey/shared'

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

        case 'join': {
            const name = parseName(value.name)
            const cosmetics = parseCosmetics(value.cosmetics)

            if(name === null) return null
            if(cosmetics === null) return null

            if(typeof value.room !== 'string') return null

            return {
                type: 'join',
                room: value.room,
                name,
                cosmetics
            }
        }

        case 'update': {
            if(!isObject(value.settings)) return null
            if(typeof value.settings.collision !== 'boolean') return null

            return {
                type: 'update',
                settings: {
                    collision: value.settings.collision
                }
            }
        }

        case 'leave': {
            return { type: 'leave' }
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


        default:
            return null
    }
}