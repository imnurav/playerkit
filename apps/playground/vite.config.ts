import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@nurav/player-core": resolve(
        __dirname,
        "../../packages/player-core/src/index.ts",
      ),
      "@nurav/player-react": resolve(
        __dirname,
        "../../packages/player-react/src/index.ts",
      ),
      "@nurav/player-ui": resolve(
        __dirname,
        "../../packages/player-ui/src/index.ts",
      ),
      "@nurav/shared": resolve(__dirname, "../../packages/shared/src/index.ts"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        player: resolve(__dirname, "player.html"),
      },
    },
  },
  server: {
    allowedHosts: true,
    fs: {
      allow: [resolve(__dirname, "../..")],
    },
  },
});
