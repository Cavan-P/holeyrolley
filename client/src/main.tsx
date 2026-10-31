
import { initSound } from './audio/music'
import { initTheme } from './settings/theme'
initSound()
initTheme()


import './style.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { BrowserRouter } from 'react-router'

createRoot(document.getElementById('ui')!).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
)
