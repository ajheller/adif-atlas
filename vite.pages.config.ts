import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "github-pages",
  base: "/adif-atlas/",
  plugins: [react()],
  build: {
    outDir: "../pages-dist",
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, "github-pages/index.html"),
        workshop: resolve(import.meta.dirname, "github-pages/workshop.html"),
      },
    },
  },
});
