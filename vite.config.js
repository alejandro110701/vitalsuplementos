import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // WordPress.com does not send `access-control-allow-origin`, so the Store
    // API is unreachable from the browser cross-origin. This proxy is for
    // poking at live data in development; the shipped catalogue is baked by
    // `npm run sync:woo`, so the build has no runtime dependency on it.
    proxy: {
      '/woo': {
        target: 'https://vitalsuplementos.com.mx',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/woo/, '/wp-json/wc/store/v1')
      }
    }
  }
});
