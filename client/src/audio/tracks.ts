export const TRACKS = [
    {
        id: 'bumperBounce',
        name: 'Bumper Bounce',
        src: '/audio/bumperBounce.wav'
    },
    {
        id: 'windyFairway',
        name: 'Windy Fairway',
        src: '/audio/windyFairway.wav'
    },
    {
        id: 'holeInOne',
        name: 'Hole in One',
        src: '/audio/holeInOne.wav'
    },
    {
        id: 'loopDeLoop',
        name: 'Loop-De-Loop',
        src: '/audio/loopDeLoop.wav'
    },
    {
        id: 'castleCourse',
        name: 'Castle Course',
        src: '/audio/castleCourse.wav'
    }
] as const

export type TrackId = (typeof TRACKS)[number]['id']