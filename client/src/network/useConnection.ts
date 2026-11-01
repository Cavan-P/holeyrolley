import { useSyncExternalStore } from 'react'
import { subscribe, getSnapshot } from './connection'

export function useConnection(){
    return useSyncExternalStore(subscribe, getSnapshot)
}
