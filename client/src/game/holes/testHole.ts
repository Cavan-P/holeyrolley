import { Hole } from '../classes/Hole'
import { Ball } from '../classes/Ball'
import { Wall } from '../classes/Wall'
import { Cup } from '../classes/Cup'

import { Sand } from '../surfaces/Sand'
import { Slope } from '../surfaces/Slope'

import { CircleShape } from '../shapes/CircleShape'
import { RectShape } from '../shapes/RectShape'

// The hard-coded scene from before, as a Hole. Later this gets built from course data instead
export function createTestHole(): Hole {
    const tee = { x: 150, y: 100 }

    return new Hole({
        par: 3,
        tee,
        balls: [new Ball(tee.x, tee.y, '#FF0000')],
        walls: [new Wall(300, 300, 1000, 500, 3, 0.6)],
        surfaces: [
            new Sand(new CircleShape(400, 400, 200)),
            new Slope(new RectShape(800, 800, 300, 100), 200, 100)
        ],
        cup: new Cup(1200, 1200)
    })
}
