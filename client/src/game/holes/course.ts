import { createTestHole } from './testHole'
import { createHole2 } from './hole2'
import { type Hole } from '../classes/Hole'

export const course: (() => Hole)[] = [createTestHole, createHole2]