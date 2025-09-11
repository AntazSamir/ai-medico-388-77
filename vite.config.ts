import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Enable SWC optimizations for better mobile performance
      jsxImportSource: "@emotion/react",
      plugins: [
        // Optimize for mobile devices
        ["@swc/plugin-emotion", {}],
      ],
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize for mobile performance
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Optimize chunk splitting for mobile performance
          if (id.includes('node_modules')) {
            // Core React libraries
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            // UI components - split by usage frequency
            if (id.includes('@radix-ui')) {
              if (id.includes('dialog') || id.includes('dropdown') || id.includes('sheet')) {
                return 'ui-core';
              }
              return 'ui-extended';
            }
            // Router
            if (id.includes('react-router')) {
              return 'router';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // Query management
            if (id.includes('@tanstack')) {
              return 'query';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Forms
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms';
            }
            // Charts and heavy libraries
            if (id.includes('recharts') || id.includes('framer-motion')) {
              return 'charts-motion';
            }
            // Everything else
            return 'vendor';
          }
          // Split pages for lazy loading
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0];
            return `page-${pageName}`;
          }
          // Split components
          if (id.includes('/components/')) {
            return 'components';
          }
        },
        // Optimize chunk file names for caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `img/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Optimize chunk size for mobile
    chunkSizeWarningLimit: 500,
    // Enable source maps for debugging in production
    sourcemap: mode === 'development',
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'lucide-react',
    ],
    exclude: ['@capacitor/core', '@capacitor/android', '@capacitor/ios'],
  },
}));
