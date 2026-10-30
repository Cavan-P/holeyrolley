// main.tsx
import "./style.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("ui")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
