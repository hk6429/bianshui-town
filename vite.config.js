import {defineConfig} from 'vite';

// three.js 佔主包大半；拆成 core／renderer／addons 三個 vendor chunk，
// 讓每個檔案都低於 500 kB，也讓瀏覽器能平行下載與獨立快取。
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/three/')) return undefined;
          if (id.includes('/build/three.core.js')) return 'three-core';
          if (id.includes('/examples/jsm/')) return 'three-addons';
          return 'three';
        }
      }
    }
  }
});
