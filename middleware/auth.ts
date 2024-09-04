import {defineNuxtRouteMiddleware, navigateTo} from 'nuxt/app';
import {useStore} from 'vuex';

export default defineNuxtRouteMiddleware((to) => {
    const store = useStore();

    if (!store || !store.state) {
        console.error("Store или state не доступны.");
        return;
    }

    // Логирование состояния для проверки
    console.log("Store state:", store.state);

    // Проверка аутентификации
    if (!store.state.isAuthenticated) {
        console.log("Не аутентифицирован. Перенаправление на /admin/login");
        return navigateTo('/admin/login');
    }
});
