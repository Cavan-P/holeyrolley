export function createGrassPattern(ctx: CanvasRenderingContext2D): CanvasPattern {
    const STRIPE = 56

    const css = getComputedStyle(document.documentElement)
    const turf = css.getPropertyValue('--color-turf').trim()
    const turfStripe = css.getPropertyValue('--color-turf-stripe').trim()

    const tile = document.createElement('canvas')
    tile.width = STRIPE * 2
    tile.height = 1
    const tileCtx = tile.getContext('2d')
    if (!tileCtx) throw new Error('2D canvas not supported')

    tileCtx.fillStyle = turf
    tileCtx.fillRect(0, 0, STRIPE, 1)
    tileCtx.fillStyle = turfStripe
    tileCtx.fillRect(STRIPE, 0, STRIPE, 1)

    const pattern = ctx.createPattern(tile, 'repeat')
    if (!pattern) throw new Error('Could not create grass pattern')
    return pattern
}