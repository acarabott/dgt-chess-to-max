import { defineConfig } from "vitest/config";

export default defineConfig({
    root: "./app/",
    build: {
        emptyOutDir: true,
        outDir: "../build/",
        sourcemap: true,
        assetsInlineLimit: 0,
    },
    server: {
        port: 6060,
        open: true,
    },
    test: {
        include: ["**/*.test.ts"],
        setupFiles: ["@vitest/web-worker"],
        typecheck: {},
        hideSkippedTests: true,
        coverage: {
            provider: "v8",
            all: true,
            include: ["src/**/*.ts"],
        },
    },
});
