import {defineNuxtPlugin} from 'nuxt/app';
import {key, store} from '@/store';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(store, key);
});
