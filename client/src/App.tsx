// App.tsx
import { MainMenu } from './pages/MainMenu'
import { useNavigate, Routes, Route } from 'react-router'


export function App(){
    const navigate = useNavigate()

    return (
        <Routes>
            <Route path="/" element={ <MainMenu onPlay={() => { navigate('/play') }} />} />
        </Routes>
    )

    
}
