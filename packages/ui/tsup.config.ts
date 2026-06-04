import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/styles/common.css",
    "src/styles/hls.css",
    "src/styles/youtube.css",
    "src/styles/index.css",
  ],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ["react", "react/jsx-runtime", "@playerkit/core"],
});
