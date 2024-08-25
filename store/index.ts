import { createStore } from 'vuex';
import { getModule } from 'vuex-module-decorators';
import AuthModule from './auth';

const store = createStore({
    modules: {
        auth: AuthModule
    }
});

export default store;

// Экспортируйте типобезопасный модуль
export const authStore = getModule(AuthModule, store);
