import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // forward these paths to Flask
      "/health": "http://localhost:5050",
      "/api": "http://localhost:5050",
      "/recommendations": "http://localhost:5050"
    }
  }
});