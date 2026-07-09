import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Build 1: Content script as IIFE (no ES module imports — required for MV3 content scripts)
// Build 2: Everything else as ES modules

export default defineConfig(({ mode }) => {
  if (mode === "content") {
    return {
      plugins: [],
      build: {
        outDir: "dist",
        emptyOutDir: false,
        lib: {
          entry: resolve(__dirname, "content/index.ts"),
          name: "NeatCodeContent",
          fileName: () => "content/index.js",
          formats: ["iife"],
        },
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
          },
        },
      },
    };
  }

  // Default build: UI + popup + background
  return {
    plugins: [react()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          "background/service-worker": resolve(__dirname, "background/service-worker.ts"),
          "ui/index": resolve(__dirname, "ui/src/main.tsx"),
          "popup/index": resolve(__dirname, "popup/src/main.tsx"),
        },
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "chunks/[name]-[hash].js",
          assetFileNames: (info) => {
            const src = (info as unknown as { originalFileNames?: string[] }).originalFileNames?.[0] ?? "";
            if (info.name?.endsWith(".css")) {
              return src.includes("popup") ? "popup/index.css" : "ui/index.css";
            }
            return "assets/[name][extname]";
          },
        },
      },
    },
    resolve: {
      alias: { "@shared": resolve(__dirname, "shared") },
    },
  };
});
