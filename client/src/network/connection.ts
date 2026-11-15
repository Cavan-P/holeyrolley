import type { ClientMsg, ServerMsg } from '@holey/shared'

type RoomMsg = Extract<ServerMsg, { type: 'room' }>
type StateMsg = Extract<ServerMsg, { type: 'state' }>

export type TimedState = { msg: StateMsg, at: number }

const STATE_BUFFER = 10

export type ErrorReason =Extract<ServerMsg, { type: 'error' }>['reason']

export type ConnectionState = {
    status: 'idle' | 'connecting' | 'open' | 'closed'
    room: RoomMsg | null
    error: ErrorReason | null
}

let current: ConnectionState = {
    status: 'idle',
    room: null,
    error: null
}
const listeners = new Set<() => void>()

let socket: WebSocket | null = null
let states: TimedState[] = []

export function getSnapshot(): ConnectionState {
    return current
}

export function getLatestState(): StateMsg | null {
    return states.at(-1)?.msg ?? null
}

export function getStates(): TimedState[] {
    return states
}

export function subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
}

function update(changes: Partial<ConnectionState>): void {
    current = { ...current, ...changes }
    listeners.forEach(l => l())
}

export function connect(): void {
    if(socket) return

    const url = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws`

    socket = new WebSocket(url)

    update({ status: 'connecting' })

    socket.onopen = () => 
        update({ status: 'open' })
    

    socket.onclose = () => {
        update({ status: 'closed', room: null })
        socket = null
        states = []
    }

    socket.onmessage = event => {
        let msg: ServerMsg
        try {
            msg = JSON.parse(event.data) as ServerMsg
        }
        catch { return }

        switch(msg.type){
            case 'room': { 
                update({ room: msg, error: null })
            break }
            case 'error': { 
                update({ error: msg.reason })
            break }
            case 'state': {
                states.push({ msg, at: performance.now() })
                if(states.length > STATE_BUFFER) states.shift()
            break }
        }
    }
}

export function send(msg: ClientMsg): void {
    if(socket?.readyState !== WebSocket.OPEN) return

    socket.send(JSON.stringify(msg))
}

export function leave(): void {
    send({ type: 'leave' })
    states = []
    update({ room: null })
}