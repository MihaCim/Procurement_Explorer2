import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

import tailwindcss from '@tailwindcss/vite';
// import mkcert from "vite-plugin-mkcert";
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react(), svgr(), tailwindcss()],
    server: {
      port: 3399,
      proxy: {
        '/api': {
          target: `http://${env.VITE_API_BASE_URL}:${env.VITE_API_PORT}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/'),
        },
        '/swagger': {
          target: `http://${env.VITE_API_BASE_URL}:${env.VITE_API_PORT}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api-docs/, '/api-docs'),
        },
      },
    },
    build: {
      // Ensure that fonts are copied to the output directory
      assetsInlineLimit: 0,
    },
  };
});
