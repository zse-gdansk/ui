import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    // "@zse-gdansk/ui" comes from tsconfig paths: the library's source, not
    // a build, so edits in ../src reload instantly.
    resolve: { tsconfigPaths: true },
});
