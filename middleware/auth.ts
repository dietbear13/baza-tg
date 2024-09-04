import {defineNuxtRouteMiddleware, navigateTo} from 'nuxt/app';
import {useStore} from 'vuex';
import {key} from '@/store';

export default defineNuxtRouteMiddleware((to) => {
    console.log("key", key);
    const store = useStore(key); // Использование ключа

    // Логирование состояния для проверки
    console.log("Store state:", store.state);

    if (!store || !store.state) {
        console.error("Store или state не доступны.");
        return;
    }


    // Проверка аутентификации
    if (!store.state.isAuthenticated) {
        console.log("Не аутентифицирован. Перенаправление на /admin/login");
        return navigateTo('/admin/login');
    }
});
