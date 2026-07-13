import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/styles/hls.css",
    "src/styles/mp4.css",
    "src/styles/index.css",
    "src/styles/common.css",
    "src/styles/youtube.css",
  ],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ["react", "react/jsx-runtime", "@playerkit/core"],
  tsconfig: "tsconfig.build.json",
});
