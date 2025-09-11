import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react({ jsxImportSource: "react" })],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  esbuild: {
    keepNames: true,
  },
  build: {
    minify: 'esbuild',
    sourcemap: mode === 'development',
  },
}));
