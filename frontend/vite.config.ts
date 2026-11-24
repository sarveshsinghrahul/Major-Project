/// <reference types="vitest" />
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// API_PROXY_TARGET lets Docker Compose point the dev proxy at the api container.
const apiTarget = process.env.API_PROXY_TARGET ?? "http://localhost:8000";

// The landing page is a static page in public/welcome/. Vite's dev server does not serve a folder's
// index.html for "/welcome/" (the SPA fallback answers instead), so rewrite it here. Static hosts
// serve the folder's index.html on their own.
const welcomePage: Plugin = {
  name: "welcome-page",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === "/welcome" || req.url === "/welcome/") req.url = "/welcome/index.html";
      next();
    });
  },
};

export default defineConfig({
  plugins: [welcomePage, react()],
  server: {
    port: 5173,
    proxy: { "/api": apiTarget },
    // The taste skill's checker keeps headless-Chrome profiles in .taste-skill; Windows locks their
    // files, which crashes the watcher.
    watch: { ignored: ["**/.taste-skill/**"] },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
