export const TRACKS = [
    {
        id: 'bumperBounce',
        name: 'Bumper Bounce',
        src: '/audio/bumperBounce.mp3'
    },
    {
        id: 'windyFairway',
        name: 'Windy Fairway',
        src: '/audio/windyFairway.mp3'
    },
    {
        id: 'holeInOne',
        name: 'Hole in One',
        src: '/audio/holeInOne.mp3'
    },
    {
        id: 'loopDeLoop',
        name: 'Loop-De-Loop',
        src: '/audio/loopDeLoop.mp3'
    },
    {
        id: 'castleCourse',
        name: 'Castle Course',
        src: '/audio/castleCourse.mp3'
    }
] as const

export type TrackId = (typeof TRACKS)[number]['id']