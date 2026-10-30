import { Button } from '../components/Button'

export function MainMenu({ onPlay }: { onPlay: () => void }) {
    return (
        <div className='w-full h-full bg-sky'>
            <div className="flex flex-col gap-3 w-80 p-14 text-ink bg-sky">
                <h1 className="text-6xl font-bold font-display">
                    Holey <span className="text-brand">Rolley</span>
                </h1>
                <p className="color-sub">Online mini golf with friends</p>
                <Button label='Play Online' onClick={onPlay} splash={true} />
                <Button label='Party' onClick={onPlay} splash={false} />
            </div>
        </div>
    )
}
