import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: "https://ksu-gp-has.news47ell.com",
  base: "/",
  trailingSlash: "never",
  output: "server",
  integrations: [tailwind()],
  adapter: vercel()
});