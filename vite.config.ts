import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        /*
         * The render-critical dependencies change far less often than the
         * editor does, so they get their own chunk and stay in the browser
         * cache across deploys. Everything else — mediabunny above all — must
         * stay out, or it would lose the lazy chunk the exporter loads it from.
         */
        advancedChunks: {
          groups: [
            {
              name: "vendor",
              test: /node_modules\/(react|react-dom|scheduler|@base-ui|@floating-ui|@hugeicons|tailwind-merge|clsx|class-variance-authority)\//,
            },
          ],
        },
      },
    },
  },
})
