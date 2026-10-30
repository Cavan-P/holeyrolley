// App.tsx
import { MainMenu } from "./pages/MainMenu";

// TODO: keep track of the current screen in state and render the matching page
export function App() {
    return <MainMenu onPlay={() => console.log("play!")} />;
}
