import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` → normal multi-file production build (BrowserRouter).
// `npm run build:single` → one self-contained HTML file with an in-memory router,
// used for the shareable preview.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  define: {
    __SINGLE_FILE__: JSON.stringify(mode === 'single'),
  },
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    chunkSizeWarningLimit: 2500,
  },
}));
