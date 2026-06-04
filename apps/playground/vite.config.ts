import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: process.env["VITE_BASE_PATH"] || "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@playerkit/core": resolve(__dirname, "../../packages/core/src/index.ts"),
      "@playerkit/react": resolve(
        __dirname,
        "../../packages/react/src/index.ts",
      ),
      "@playerkit/ui/styles": resolve(
        __dirname,
        "../../packages/ui/src/styles",
      ),
      "@playerkit/ui": resolve(__dirname, "../../packages/ui/src/index.ts"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        player: resolve(__dirname, "player.html"),
      },
      onwarn(warning, warn) {
        if (warning.code === "INEFFECTIVE_DYNAMIC_IMPORT") return;
        warn(warning);
      },
    },
  },
  server: {
    host: true,
    allowedHosts: true,
    fs: {
      allow: [resolve(__dirname, "../..")],
    },
  },
});
