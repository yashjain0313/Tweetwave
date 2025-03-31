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
            ? "https://tweetwave-4.onrender.com"
            : "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      minify: true,
      // Ensure we generate with correct paths
      assetsDir: "assets",
      emptyOutDir: true,
    },
    define: {
      // Make environment variables available in frontend code
      __APP_ENV__: JSON.stringify(mode),
    },
  };
});
