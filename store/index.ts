import {createStore, Store} from 'vuex';
import {InjectionKey} from 'vue';

// Интерфейс состояния
export interface State {
    isAuthenticated: boolean;
    apiError: string | null;
    userRole: string | null;
}


// Создайте ключ для инъекции
export const key: InjectionKey<Store<State>> = Symbol('vuex-key');

// Store
const store = createStore<State>({
    state: {
        isAuthenticated: false, // По умолчанию пользователь не авторизован
        apiError: null, // Ошибки API
        userRole: null, // Роль пользователя
    },
    mutations: {
        // Обновление состояния аутентификации
        setAuthentication(state, isAuthenticated) {
            state.isAuthenticated = isAuthenticated;
        },
        // Устанавливает роль пользователя
        setUserRole(state, role) {
            state.userRole = role;
        },
        // Обновление ошибок API
        setApiError(state, error) {
            state.apiError = error;
        }
    },
    actions: {
        // Логин
        async login({ commit }, { username: login, password }) {
            try {
                // Отправка данных на сервер
                const { success, role } = await $fetch('http://localhost:3001/api/admin/login', {
                    method: 'POST',
                    body: {
                        username: login,
                        password
                    }
                });

                // Если успешная аутентификация
                commit('setAuthentication', success);
                if (success) {
                    commit('setApiError', null);
                    commit('setUserRole', role); // Сохраняем роль пользователя
                    return true;
                } else {
                    commit('setAuthentication', false);
                    commit('setApiError', 'Invalid username or password');
                    return false;
                }
            } catch (error) {
                commit('setAuthentication', false);
                commit('setApiError', 'Failed to connect to API');
                throw error;
            }
        },

        // Логика выхода из системы
        async logout({ commit }) {
            try {
                // Отправляем запрос на выход
                const response = await $fetch('http://localhost:3001/api/admin/logout', {
                    method: 'POST',
                });

                if (response.ok) {
                    // Сбрасываем авторизацию и роль пользователя
                    commit('setAuthentication', false);
                    commit('setUserRole', null);
                } else {
                    console.error('Ошибка при выходе из системы');
                }
            } catch (error) {
                console.error('Ошибка при выполнении выхода:', error);
            }
        }
    },
});

export { store };
