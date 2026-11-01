const KEY = 'holeyrolley:name'

export function loadName(): string {
    try {
        return localStorage.getItem(KEY) ?? ''
    }
    catch {
        return ''
    }
}

export function saveName(name: string): void {
    try {
        localStorage.setItem(KEY, name)
    }
    catch {}
}
