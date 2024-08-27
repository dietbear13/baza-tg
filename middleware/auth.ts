import {defineNuxtRouteMiddleware, navigateTo} from 'nuxt/app';
import {useStore} from 'vuex';

export default defineNuxtRouteMiddleware((to) => {
    const store = useStore();

    if (!store || !store.state) {
        console.error("Store или state не доступны.");
        return;
    }

    console.log("Store state:", store.state);

    if (!store.state.isAuthenticated) {
        return navigateTo('/admin/login');
    }
});

