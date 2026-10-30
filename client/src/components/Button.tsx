type ButtonProps = {
    label: string;
    onClick: () => void;
    splash?: boolean;
}

export function Button({ label, onClick, splash = false }){
    let defaultClass = "bg-card"

    if(splash){
        defaultClass = "bg-putt font-extrabold"
    }

    return (
        <button onClick={onClick} className={`${defaultClass} h-14 rounded-xl`}>
            {label}
        </button>
    )
}
