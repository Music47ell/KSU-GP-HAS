import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://ksu-gp-has.ahmetalmaz.com",
  base: "/",
  trailingSlash: "never",
  output: "server",
  integrations: [tailwind()],
  adapter: cloudflare({ mode: "advanced" }),
});
