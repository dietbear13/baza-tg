import { defineNuxtConfig } from 'nuxt/config';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

module.exports = {
    /* ... other settings */
    transpileDependencies: ['vuex-module-decorators']}

export default defineNuxtConfig({
    css: [
        '@/assets/styles/main.scss',
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
        transpile: ['vuetify', 'vuex-module-decorators'],
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
    plugins: ['~/plugins/vuetify', '~/plugins/vuex.ts'],  // Подключаем плагин Vuetify
    vite: {
        vue: {
            template: {
                transformAssetUrls,
            },
        },
        resolve: {
            alias: {
                'vuex-module-decorators': 'vuex-module-decorators/dist/index.js'
            }
        },
    }
});