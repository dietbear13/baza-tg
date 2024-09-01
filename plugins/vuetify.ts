// plugins/vuetify.ts
import {createVuetify} from 'vuetify'
import {VCalendar} from 'vuetify/labs/VCalendar'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import {aliases, mdi} from 'vuetify/iconsets/mdi';
import {ru} from 'vuetify/locale'

import {defineNuxtPlugin} from "nuxt/app";

export default defineNuxtPlugin(WebApp => {
    const vuetify = createVuetify({
        locale: {
            locale: 'ru',
            messages: { ru },
        },

        components: {
            ...components,
            VCalendar,
        },
        directives,
        theme: {
            defaultTheme: 'dark',
            themes: {
                dark: {
                    dark: true,
                    colors: {
                        background: '#121212',
                        surface: '#1E1E1E',
                        primary: '#009688',
                        secondary: '#4CAF50',
                        error: '#CF6679',
                        info: '#2196F3',
                        success: '#4CAF50',
                        warning: '#FB8C00',
                    },
                },
            },
        },
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: {
                mdi,
            },
        },
    });

    WebApp.vueApp.use(vuetify)
})
