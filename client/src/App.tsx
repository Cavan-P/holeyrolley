// App.tsx
import { MainMenu } from './pages/MainMenu'
import { Routes, Route } from 'react-router'
import { Game } from './pages/Game'
import { Public } from './pages/Public'
import { Party } from './pages/Party'
import { Settings } from './pages/Settings'
import { Locker } from './pages/Locker'
import { TeeBox } from './pages/TeeBox'


export function App(){

    return (
        <Routes>
            <Route path='/' element={ <MainMenu />} />
            <Route path='/play' element={ <Game /> } />
            <Route path='/party' element={ <Party /> } />
            <Route path='/public' element={ <Public /> } />
            <Route path='/settings' element={ <Settings /> } />
            <Route path='/locker' element={ <Locker /> } />
            <Route path='/room/:code' element={ <TeeBox /> } />
            <Route path='*' />
        </Routes>
    )

    
}
