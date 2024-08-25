import { defineNuxtPlugin } from 'nuxt/app';
import store from '@/store';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(store);
});
