import {createStore, Store} from 'vuex';
import {InjectionKey} from 'vue';

// Интерфейс состояния
export interface State {
    isAuthenticated: boolean;
    apiError: string | null;
    userRole: string | null;
    token: string | null;
}

// Интерфейсы для ответов от API
interface LoginResponse {
    success: boolean;
    role: string;
    token: string;
}

interface ValidateTokenResponse {
    success: boolean;
    role: string;
}

// Создайте ключ для инъекции
export const key: InjectionKey<Store<State>> = Symbol('vuex-key');

// Store
const store = createStore<State>({
    state: {
        isAuthenticated: false, // По умолчанию пользователь не авторизован
        apiError: null, // Ошибки API
        userRole: null, // Роль пользователя
        token: null, // Токен авторизации
    },
    mutations: {
        // Обновление состояния аутентификации и токена
        setAuthentication(state, { isAuthenticated, token }: { isAuthenticated: boolean, token: string | null }) {
            state.isAuthenticated = isAuthenticated;
            state.token = token;

            // Сохраняем токен в cookie
            if (isAuthenticated && token) {
                document.cookie = `authToken=${token}; path=/; max-age=86400`; // Устанавливаем cookie с токеном на 24 часа
            } else {
                document.cookie = 'authToken=; Max-Age=0; path=/'; // Удаляем cookie
            }
        },
        // Устанавливает роль пользователя
        setUserRole(state, role: string | null) {
            state.userRole = role;
        },
        // Обновление ошибок API
        setApiError(state, error: string | null) {
            state.apiError = error;
        }
    },
    actions: {
        // Логин
        async login({ commit }, { username: login, password }): Promise<boolean> {
            try {
                // Указываем тип данных, которые ожидаем от API
                const response: LoginResponse = await $fetch<LoginResponse>('http://localhost:3001/api/admin/login', {
                    method: 'POST',
                    body: {
                        username: login,
                        password
                    },
                    credentials: 'include'
                });

                const { success, role, token } = response;

                // Если успешная аутентификация
                commit('setAuthentication', { isAuthenticated: success, token });
                if (success) {
                    commit('setApiError', null);
                    commit('setUserRole', role); // Сохраняем роль пользователя
                    return true;
                } else {
                    commit('setAuthentication', { isAuthenticated: false, token: null });
                    commit('setApiError', 'Invalid username or password');
                    return false;
                }
            } catch (error) {
                commit('setAuthentication', { isAuthenticated: false, token: null });
                commit('setApiError', 'Failed to connect to API');
                throw error;
            }
        },

        // Восстановление авторизации
        async tryAutoLogin({ commit }) {
            // Извлекаем токен из cookie
            const authToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('authToken='))
                ?.split('=')[1];

            if (authToken) {
                try {
                    // Указываем тип данных, которые ожидаем от API
                    const response: ValidateTokenResponse = await $fetch<ValidateTokenResponse>('http://localhost:3001/api/validateToken', {
                        method: 'POST',
                        body: { token: authToken },
                    });

                    const { success, role } = response;

                    if (success) {
                        commit('setAuthentication', { isAuthenticated: true, token: authToken });
                        commit('setUserRole', role);
                    } else {
                        commit('setAuthentication', { isAuthenticated: false, token: null });
                    }
                } catch (error) {
                    commit('setAuthentication', { isAuthenticated: false, token: null });
                }
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
                    commit('setAuthentication', { isAuthenticated: false, token: null });
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
