import type { Ball } from '@holey/shared'
import { audio } from './music'
import { getPrefs } from '../settings/store'

function level(): number {
    const p = getPrefs()
    if(p.muteInBackground && document.hidden) return 0
    return p.masterVolume * p.sfxVolume
}

function out(gain: number, at: number, decay: number): GainNode {
    const g = audio.createGain()
    g.gain.setValueAtTime(gain * level(), at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + decay)
    g.connect(audio.destination)
    return g
}

function tone(type: OscillatorType, from: number, to: number, gain: number, decay: number): void {
    const t = audio.currentTime
    const osc = audio.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(from, t)
    osc.frequency.exponentialRampToValueAtTime(to, t + decay)
    osc.connect(out(gain, t, decay))
    osc.start(t)
    osc.stop(t + decay)
}

let noiseBuffer: AudioBuffer | null = null

function noise(filter: BiquadFilterType, from: number, to: number, gain: number, decay: number): void {
    if(!noiseBuffer){
        noiseBuffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate)
        const data = noiseBuffer.getChannelData(0)
        for(let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    }

    const t = audio.currentTime
    const src = audio.createBufferSource()
    src.buffer = noiseBuffer
    const f = audio.createBiquadFilter()
    f.type = filter
    f.frequency.setValueAtTime(from, t)
    f.frequency.exponentialRampToValueAtTime(to, t + decay)
    src.connect(f)
    f.connect(out(gain, t, decay))
    src.start(t)
    src.stop(t + decay)
}

export const sfx = {
    putt: (power: number) => {
        noise('bandpass', 2400, 1200, 0.5 + power * 0.5, 0.06)
        tone('sine', 180, 90, 0.4 * (0.4 + power), 0.08)
    },
    bounce: (strength: number) => tone('triangle', 520, 300, Math.min(0.5, 0.08 + strength * 0.4), 0.07),
    cup: (gain = 1) => {
        tone('sine', 900, 320, 0.4 * gain, 0.25)
        setTimeout(() => tone('sine', 600, 250, 0.25 * gain, 0.18), 90)
    },
    splash: () => noise('lowpass', 3000, 200, 0.6, 0.45),
    drift: () => tone('sine', 500, 120, 0.25, 0.9),
    spring: () => tone('square', 160, 720, 0.12, 0.3),
    portal: () => tone('sine', 300, 1400, 0.25, 0.3)
}

export function ballSounds(): (ball: Ball) => void {
    let prev: { x: number, y: number, vx: number, vy: number, strokes: number, holed: boolean, sinking: boolean, air: boolean } | null = null

    return (ball: Ball) => {
        const now = { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy, strokes: ball.strokes, holed: ball.holed(), sinking: ball.sinking(), air: ball.airTime > 0 }
        const p = prev
        prev = now
        if(!p) return

        const speed = Math.hypot(now.vx, now.vy)
        const before = Math.hypot(p.vx, p.vy)

        if(now.holed && !p.holed) sfx.cup()
        else if(now.sinking && !p.sinking) ball.drifting ? sfx.drift() : sfx.splash()
        else if(now.air && !p.air) sfx.spring()
        else if(now.strokes > p.strokes && before < 1 && speed > 0) sfx.putt(Math.min(1, speed / ball.maxSpeed))
        else if(Math.hypot(now.x - p.x, now.y - p.y) > 60 && !now.sinking && !p.sinking) sfx.portal()
        else if(before > 60 && speed > 0 && !now.sinking){
            const turn = (p.vx * now.vx + p.vy * now.vy) / (before * speed)
            if(turn < 0.8) sfx.bounce(Math.min(1, before / ball.maxSpeed))
        }
    }
}
