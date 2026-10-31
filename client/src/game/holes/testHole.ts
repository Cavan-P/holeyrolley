import { Hole } from '../classes/Hole'
import { Ball } from '../classes/Ball'
import { Wall } from '../classes/Wall'
import { Cup } from '../classes/Cup'

import { Bumper } from '../classes/Bumper'
import { ArcWall } from '../classes/ArcWall'

import { Sand } from '../surfaces/Sand'
import { Slope } from '../surfaces/Slope'
import { Ice } from '../surfaces/Ice'
import { Water } from '../surfaces/Water'

import { RectShape } from '../shapes/RectShape'
import { ArcShape } from '../shapes/ArcShape'
import { PolygonShape } from '../shapes/PolygonShape'

const RAIL = 6
const RAIL_BOUNCE = 0.6
const BUMPER_BOUNCE = 0.9

// Joins the points into a closed ring of walls, last point back to the first
function wallLoop(points: [number, number][], r: number, bounce: number): Wall[] {
    const walls: Wall[] = []

    for(let i = 0; i < points.length; i++){
        const a = points[i]
        const b = points[(i + 1) % points.length]
        if(!a || !b) continue

        walls.push(new Wall(a[0], a[1], b[0], b[1], r, bounce))
    }

    return walls
}

function diamond(cx: number, cy: number, size: number): Wall[] {
    return wallLoop([
        [cx, cy - size],
        [cx + size, cy],
        [cx, cy + size],
        [cx - size, cy]
    ], RAIL, BUMPER_BOUNCE)
}

export function createTestHole(): Hole {
    const tee = { x: 180, y: 1200 }

    // Used for both the rails and the grass, so they always line up
    const outline: [number, number][] = [
        [0, 160],
        [160, 0],
        [1500, 0],
        [1500, 360],
        [360, 360],
        [360, 1300],
        [0, 1300]
    ]

    return new Hole({
        par: 3,
        tee,
        course: new PolygonShape(outline),
        balls: [new Ball(tee.x, tee.y, '#FF0000')],
        walls: [
            ...wallLoop(outline, RAIL, RAIL_BOUNCE),

            ...diamond(180, 1000, 40),

            new Wall(800, 0, 800, 130, RAIL, RAIL_BOUNCE),
            new Wall(800, 230, 800, 360, RAIL, RAIL_BOUNCE),

            // Round posts (same start and end point) that kick the ball away
            new Bumper(250, 240, 250, 240, 14),
            new Bumper(600, 250, 600, 250, 12),

            // Curved backstop behind the cup
            new ArcWall(1370, 170, 80, -1.2, 1.2, RAIL, RAIL_BOUNCE)
        ],
        surfaces: [
            // Pushes the ball toward the right rail on the way up
            new Slope(new RectShape(0, 620, 360, 140), 160, 0),

            new Ice(new RectShape(40, 800, 280, 110, 30)),

            // Hit it hard enough to skip across, or go round through the gap above
            new Water(new RectShape(900, 140, 200, 220, 40)),

            // Curved sand trap guarding the front of the cup
            new Sand(new ArcShape(1370, 170, 36, 66, 2.2, 4.1))
        ],
        cup: new Cup(1370, 170)
    })
}
