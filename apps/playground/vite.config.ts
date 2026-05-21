import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@varun/player-core": resolve(
        __dirname,
        "../../packages/player-core/src/index.ts",
      ),
      "@varun/player-react": resolve(
        __dirname,
        "../../packages/player-react/src/index.ts",
      ),
      "@varun/player-themes": resolve(
        __dirname,
        "../../packages/player-themes/src/index.ts",
      ),
      "@varun/player-ui": resolve(
        __dirname,
        "../../packages/player-ui/src/index.ts",
      ),
      "@varun/shared": resolve(__dirname, "../../packages/shared/src/index.ts"),
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
    fs: {
      allow: [resolve(__dirname, "../..")],
    },
  },
});

