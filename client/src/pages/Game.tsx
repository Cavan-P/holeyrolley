import { useEffect, useRef } from 'react'
import { startGame } from '../game'

export function Game() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current

        if (!canvas) return
        return startGame(canvas)
    }, [])

    return <canvas ref={canvasRef} className='touch-none fixed inset-0 w-full h-full block' />
}