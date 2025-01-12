import path from "path";
import { defineConfig } from "vite";
import packageJson from "./package.json";

const getPackageName = () => {
  return packageJson.name;
};

const getPackageNameCamelCase = () => {
  try {
    return getPackageName().replace(/-./g, (char) => char[1].toUpperCase());
  } catch (err) {
    throw new Error("Name property in package.json is missing.");
  }
};

const fileName = {
  es: `esm/${getPackageName()}.js`,
  cjs: `cjs/${getPackageName()}.js`,
  umd: `umd/${getPackageName()}.js`,
};

module.exports = defineConfig({
  base: "./",
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: getPackageNameCamelCase(),
      formats: ["es", "cjs", "umd"],
      fileName: (format) => fileName[format],
    },
    emptyOutDir: true,
  },
});
