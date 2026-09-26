import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    resolve: { tsconfigPaths: true },
    // Osobne strony: komponenty i szkielet aplikacji.
    build: {
        rolldownOptions: {
            input: { main: "index.html", layout: "layout.html" },
        },
    },
});
