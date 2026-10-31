import { useSyncExternalStore } from 'react'
import { subscribe, getPrefs } from './store'

export function usePrefs(){
    return useSyncExternalStore(subscribe, getPrefs)
}