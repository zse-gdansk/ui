import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/index.ts", "src/code-block.ts"],
    format: "esm",
    platform: "browser",
    unbundle: true,
    dts: true,
    clean: true,
    inputOptions: {
        onLog(level, log, handler) {
            if (log.code === "MODULE_LEVEL_DIRECTIVE") return;
            handler(level, log);
        },
    },
});
