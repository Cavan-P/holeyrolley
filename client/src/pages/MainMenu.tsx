// pages/MainMenu.tsx
export function MainMenu({ onPlay }: { onPlay: () => void }) {
    return (
        <div className="flex flex-col gap-3 w-80 p-14 text-ink">
            <h1 className="text-6xl font-bold">Holey Rolley</h1>
            <button onClick={onPlay} className="h-14 rounded-xl bg-putt font-extrabold">Play Online</button>
            <button className="h-12 rounded-xl bg-white shadow">Party</button>
        </div>
    );
}
