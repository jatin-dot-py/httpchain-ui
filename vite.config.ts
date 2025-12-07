import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteStaticCopy } from "vite-plugin-static-copy"


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Copy WASM files needed by curlconverter (tree-sitter)
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/web-tree-sitter/tree-sitter.wasm",
          dest: ".",
        },
        {
          src: "node_modules/curlconverter/dist/tree-sitter-bash.wasm",
          dest: ".",
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'codemirror': ['@uiw/react-codemirror', '@codemirror/lang-python', '@codemirror/theme-one-dark'],
          'react-flow': ['@xyflow/react'],
        },
      },
    },
  },
})
