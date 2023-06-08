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
        description: 'Another Pixiv Service Proxy.',
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
            urlPattern: /.*\.css/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'css-cache',
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: /.*\.js/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'js-cache',
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: /.*\.(png|gif|jpg|jpeg|svg)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'image-cache',
              cacheableResponse: {
                statuses: [200],
              },
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 31536000,
              },
            },
          },
          {
            urlPattern: /^https:\/\/(nfn\.kanata\.ml|i\.pixiv\.re)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              cacheableResponse: {
                statuses: [200],
              },
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 31536000,
              },
            },
          },
        ],
      },
    }),
  ],
}))
