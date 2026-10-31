import { useSyncExternalStore } from 'react'
import { subscribeCosmetics, getCosmetics } from './store'

export function useCosmetics(){
    return useSyncExternalStore(subscribeCosmetics, getCosmetics)
}
