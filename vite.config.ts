import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/kiwi-pdf": {
        target: "https://kiwi-pdf-equilibaco.up.railway.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kiwi-pdf/, ""),
      },
    },
  },
});
