import { getPrefs, subscribe } from './store'

const deviceDark = window.matchMedia('(prefers-color-scheme: dark)')

function apply(){
    const theme = getPrefs().theme
    const night = theme === 'night' || (theme === 'system' && deviceDark.matches)

    document.documentElement.classList.toggle('dark', night)
}

export function initTheme(){
    apply()
    subscribe(apply)
    deviceDark.addEventListener('change', apply)
}
