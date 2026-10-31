export type ClientMsg = | { type: "join"; room: string; name: string } | { type: "shoot"; angle: number; power: number }

export * from './course'
