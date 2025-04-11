import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy all API requests to your Flask backend
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false,
      },
      // Proxy candidates endpoints
      "/candidates": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      // Proxy resumes endpoints
      "/resumes": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      // Proxy jobs endpoints
      "/jobs": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});