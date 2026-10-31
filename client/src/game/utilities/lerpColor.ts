import { lerp, clamp } from './math'

type RGB = {
    r: number
    g: number
    b: number
}

export function hexToRgb(hex: string): RGB {
    const cleanHex = hex.replace('#', '')
    const num = parseInt(cleanHex, 16)

    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    }
}

function rgbToHex(rgb: RGB): string {
    const toHex = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0')

    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

export function lerpColor(hexA: string, hexB: string, t: number): string {
    const colA = hexToRgb(hexA)
    const colB = hexToRgb(hexB)

    const clampT = clamp(t, 0, 1)

    const res: RGB = {
        r: lerp(colA.r, colB.r, clampT),
        g: lerp(colA.g, colB.g, clampT),
        b: lerp(colA.b, colB.b, clampT)
    }

    return rgbToHex(res)
}