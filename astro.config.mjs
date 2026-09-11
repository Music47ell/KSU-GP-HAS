import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://ksu-gp-has.ahmetalmaz.com",
  base: "/",
  trailingSlash: "never",
  output: "server",
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: cloudflare({ mode: "advanced" }),
});
