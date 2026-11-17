import { defineConfig } from 'vite';

export default defineConfig({
  // Polling avoids depending on native fsevents in managed macOS runtimes.
  server: { watch: { usePolling: true, interval: 350 } },
  // Three.js is already distributed as native ES modules.
  optimizeDeps: { noDiscovery: true, include: [] },
});
