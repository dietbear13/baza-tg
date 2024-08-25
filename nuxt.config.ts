import {defineNuxtConfig} from 'nuxt/config';
import vuetify, {transformAssetUrls} from 'vite-plugin-vuetify';


export default defineNuxtConfig({
  css: [
      '@/assets/styles/main.scss',
      'vuetify/lib/labs/VCalendar/VCalendarDay.css'
  ],

  ssr: false,

  app: {
      head: {
          meta: [
              { hid: 'robots', name: 'robots', content: 'noindex, nofollow' }
          ],
          script: [
              {
                  src: 'https://telegram.org/js/telegram-web-app.js', defer: false, async: false,
              }
          ],
      }
  },

  build: {
      transpile: ['vuetify'],
  },

  components: true,
  pages: true,

  modules: [
      (_options, nuxt) => {
          nuxt.hooks.hook('vite:extendConfig', (config) => {
              // @ts-expect-error
              config.plugins.push(vuetify({ autoImport: true }));
          });
      },


  ],

  // Подключаем плагин Vuetify
  plugins: ['~/plugins/vuetify'],

  vite: {
      vue: {
          template: {
              transformAssetUrls,
          },
      },

  },

  compatibilityDate: '2024-08-25',
});