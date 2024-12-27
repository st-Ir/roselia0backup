import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  define: {
    'import.meta.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
    'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY),
  },
  plugins: [react()],
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
   },
 },
})