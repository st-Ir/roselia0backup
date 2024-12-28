import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from '@astrojs/vercel';

import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [react(), tailwind()],
  output: "server", // atau 'hybrid'
  adapter: vercel(),
  vite: {
    define: {
      'import.meta.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY),
    },
  },
});

