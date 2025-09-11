import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react({ jsxImportSource: "react" })],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react-core';
            if (id.includes('react-router')) return 'router';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('@tanstack')) return 'query';
            if (id.includes('@radix-ui')) return 'ui';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('recharts') || id.includes('framer-motion')) return 'heavy';
            return 'vendor';
          }
        },
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'lucide-react',
      'recharts',
      'framer-motion',
    ],
  },
}));
