// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },

  // Development server
  server: {
    port: 5173,
    open: true,
    host: true, // Allow access from network
    cors: true,
  },

  // Build configuration
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@mui/material', '@mui/icons-material'],
          '3d-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'state-vendor': ['zustand']
        }
      }
    },
    // Increase chunk size warning limit for 3D libraries
    chunkSizeWarningLimit: 1000,
  },

  // Optimized dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@supabase/supabase-js',
      'zustand'
    ],
    exclude: ['@react-three/fiber', '@react-three/drei'] // Let them handle their own bundling
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // Preview server (for production build testing)
  preview: {
    port: 4173,
    open: true,
  },
})