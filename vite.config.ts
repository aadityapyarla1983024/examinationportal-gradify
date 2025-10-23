// import history from "connect-history-api-fallback";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // {
    //   name: "single-page-app-fallback",
    //   configureServer(server) {
    //     server.middlewares.use(
    //       history({
    //         index: "/index.html",
    //         disableDotRule: true,
    //       })
    //     );
    //   },
    // },
  ],
  server: {
    host: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
