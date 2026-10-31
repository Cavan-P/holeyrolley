export const BALL_COLORS = [
    '#ffffff', '#ff5d5d', '#ff9f1c', '#ffd23f', '#2ec4b6',
    '#3a86ff', '#9b5de5', '#f15bb5', '#8d5a3b', '#1d3319'
] as const

export const HATS = ['none', 'cap', 'beanie', 'party', 'topHat', 'crown'] as const

export const CELEBRATIONS = ['confetti', 'sparkles', 'leaves', 'bubbles'] as const

export type BallColor = (typeof BALL_COLORS)[number]
export type HatId = (typeof HATS)[number]
export type CelebrationId = (typeof CELEBRATIONS)[number]

export type Cosmetics = {
    color: BallColor
    hat: HatId
    celebration: CelebrationId
}

export const DEFAULT_COSMETICS: Cosmetics = {
    color: '#ff5d5d',
    hat: 'none',
    celebration: 'confetti'
}
