import type { CourseData } from '../course'
import { darkwoodMeadows } from './darkwoodMeadows'
import { sunsetBeach } from './sunsetBeach'
import { cosmicDrift } from './cosmicDrift'
import { magmaPeak } from './magmaPeak'
import { frostbiteSummit } from './frostbiteSummit'
import { neonArcade } from './neonArcade'
import { hauntedHollow } from './hauntedHollow'
import { sugarRush } from './sugarRush'
import { gearworks } from './gearworks'

export const COURSES: Record<string, CourseData> = {
    darkwood: darkwoodMeadows,
    candy: sugarRush,
    beach: sunsetBeach,
    factory: gearworks,
    frost: frostbiteSummit,
    arcade: neonArcade,
    haunted: hauntedHollow,
    volcano: magmaPeak,
    space: cosmicDrift
}

export const DEFAULT_COURSE = 'darkwood'
