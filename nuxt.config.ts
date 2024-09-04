import {defineNuxtConfig} from 'nuxt/config';
import vuetify, {transformAssetUrls} from 'vite-plugin-vuetify';

export default defineNuxtConfig({
    imports: {
        autoImport: true,
    },

    css: [
        '@/assets/styles/main.scss',
        'vuetify/lib/labs/VCalendar/VCalendarDay.css'
    ],
    nitro: {
        devProxy: {
            '/api': {
                target: 'http://localhost:3001', // Локальный сервер на деве
                changeOrigin: true,

            }
        },
        // Правила маршрутизации для продакшена
        routeRules: {
            '/api/**': {
                proxy: 'https://giveaway-bot.ru.tuna.am'
            }
        }
    },

    ssr: false,
    runtimeConfig: {
        telegramBotApiKey: process.env.TELEGRAM_BOT_API_KEY || '',

        // Переменные окружения, которые будут доступны и на клиенте, и на сервере
        public: {
            apiBaseUrl: process.env.NODE_ENV === 'production'
                ? process.env.VITE_API_BASE_URL_PROD
                : process.env.VITE_API_BASE_URL_DEV,

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

    plugins: [
        '~/plugins/vuetify',
        '~/plugins/vuex',
    ],

    vite: {
        vue: {
            template: {
                transformAssetUrls,
            },
        },
    },

    compatibilityDate: '2024-08-25',
});
