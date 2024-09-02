import {defineNuxtConfig} from 'nuxt/config';
import vuetify, {transformAssetUrls} from 'vite-plugin-vuetify';

export default defineNuxtConfig({
    css: [
        '@/assets/styles/main.scss',
        'vuetify/lib/labs/VCalendar/VCalendarDay.css'
    ],

    ssr: false,
    runtimeConfig: {
        // Переменные окружения, которые будут доступны и на клиенте, и на сервере
        public: {
            telegramBotApiKey: process.env.TELEGRAM_BOT_API_KEY || '',
            vueAppApiUrl : process.env.VUE_APP_API_URL || ''

        }
    },

    app: {
        head: {
            meta: [
                { hid: 'robots', name: 'robots', content: 'noindex, nofollow' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },

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
