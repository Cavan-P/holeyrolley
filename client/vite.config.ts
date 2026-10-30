import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { version } from "./package.json";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: { proxy: { "/ws": { target: "ws://localhost:3001", ws: true } } },
    define: {
        __APP_VERSION__: JSON.stringify(version)
    }
});
