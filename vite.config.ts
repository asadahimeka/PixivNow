import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'
import { VitePWA as pwa } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  server: {
    proxy: {
      '/dev-api': {
        target: 'https://pixiv.js.org',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/dev-api/, '')
      }
    }
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  plugins: [
    vue(),
    createHtmlPlugin({
      minify: true,
      entry: 'src/main.ts',
    }),
    pwa({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifestFilename: 'manifest.json',
      manifest: {
        name: 'Pixiv Now',
        short_name: 'PixivNow',
        description: 'Now, everyone can enjoy Pixiv!',
        theme_color: '#3697e7',
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        navigateFallbackDenylist: [
          /^\/api/,
          /^\/-/,
          /^\/~/,
          /^\/(ajax|rpc|.+\.php)/,
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(?:nf\.cocomi\.eu\.org|i\.pixiv\.re|unpkg\.com)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
        ],
      },
    }),
  ],
}))
