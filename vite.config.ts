import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],

  server: {
    host: "0.0.0.0", // Allows access from LAN or VM
    port: 5173,

    // Proxy only in development mode
    proxy:
      mode === "development"
        ? {
            "/api": {
              target: "http://localhost:3000", // backend server
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
  },

  build: {
    outDir: "dist", // output folder (served by Express)
    sourcemap: false, // disable for smaller prod builds
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  preview: {
    port: 4173, // vite preview port if you run `npm run preview`
    strictPort: true,
  },
}));
