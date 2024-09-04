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
    token: string;
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
            console.log('Updating authentication state:', { isAuthenticated, token });
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
            console.log('Updating user role:', role);  // Логирование обновления роли
            state.userRole = role;
        },
        // Обновление ошибок API
        setApiError(state, error: string | null) {
            console.log('Updating API error state:', error);  // Логирование ошибок API
            state.apiError = error;
        }
    },
    actions: {
        // Логин
        async login({ commit }, { username: login, password }): Promise<boolean> {
            try {
                const response: LoginResponse = await $fetch<LoginResponse>('http://localhost:3001/api/admin/login', {
                    method: 'POST',
                    body: {
                        username: login,
                        password,
                    },
                });

                console.log("Ответ сервера:", response); // Проверьте, что содержится в response
                const { success, role, token } = response;
                console.log("Полученный токен:", token); // Проверка наличия токена


                if (success) {
                    commit('setAuthentication', { isAuthenticated: success, token });
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
            const authToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('authToken='))
                ?.split('=')[1];

            console.log('authToken from cookie:', authToken);  // Логируем токен для проверки

            if (authToken) {
                try {
                    const response: ValidateTokenResponse = await $fetch<ValidateTokenResponse>('http://localhost:3001/api/validateToken', {
                        method: 'POST',
                        body: { token: authToken },
                        credentials: 'include',
                    });

                    console.log('Token validation response:', response);  // Логируем ответ сервера

                    const { success, role } = response;

                    if (success) {
                        commit('setAuthentication', { isAuthenticated: true, token: authToken });
                        commit('setUserRole', role);
                    } else {
                        commit('setAuthentication', { isAuthenticated: false, token: null });
                    }
                } catch (error) {
                    console.error('Error during token validation:', error);
                    commit('setAuthentication', { isAuthenticated: false, token: null });
                }
            } else {
                console.log('No auth token found in cookies');
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
