import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react()],
    base: "/",
    server: {
      proxy: {
        "/api": {
          target: isProduction
            ? "https://tweetwavee.onrender.com" // Updated to correct backend URL
            : "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      minify: true,
      assetsDir: "assets",
      emptyOutDir: true,
    },
    define: {
      __APP_ENV__: JSON.stringify(mode),
    },
  };
});
