// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import node from "@astrojs/node";

import react from "@astrojs/react";

export default defineConfig({
  output: "server",

  vite: {
      resolve: {
          alias: {
              "@/*": "./src/*"
          }
      },
      plugins: [tailwindcss()]
  },

  adapter: node({
      mode: "standalone"
  }),

  integrations: [react()]
});