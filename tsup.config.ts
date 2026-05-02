import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "plugins/gregorian": "src/plugins/gregorian.ts",
    "plugins/islamic": "src/plugins/islamic.ts",
    "plugins/hebrew": "src/plugins/hebrew.ts",
    "plugins/roman": "src/plugins/roman.ts",
    "plugins/japanese": "src/plugins/japanese.ts",
    "plugins/regnal": "src/plugins/regnal.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  splitting: false,
});
