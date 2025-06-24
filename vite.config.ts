import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://ebsegrbkrmbundqhrvfc.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVic2VncmJrcm1idW5kcWhydmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjI5MjMsImV4cCI6MjA2NjMzODkyM30.K9FpAtr06HCdmVFHl-SOWho6Fgi77klCUjaWJmRHv6A'),
  },
}) 