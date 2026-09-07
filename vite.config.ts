import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import app from './src/server/index';

const apiServerPlugin = (): Plugin => ({
  name: 'api-server-middleware',
  configureServer(server) {
    server.middlewares.use(app);
  }
});

export default defineConfig({
  plugins: [react(), apiServerPlugin()],
  server: {
    port: 5173,
    host: true,
  }
});
