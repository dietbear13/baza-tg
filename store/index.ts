import {createStore, Store} from 'vuex';
import {InjectionKey} from 'vue';


// Определите интерфейс для состояния
export interface State {
    isAuthenticated: boolean;
    apiError: string | null;
}

// Создайте уникальный ключ инъекции
export const key: InjectionKey<Store<State>> = Symbol('vuex-key');

// Создайте store
const store = createStore<State>({
    state: {
        isAuthenticated: false,
        apiError: null,
    },
    mutations: {
        setAuthentication(state, isAuthenticated) {
            state.isAuthenticated = isAuthenticated;
        },
        setApiError(state, error) {
            state.apiError = error;
        }
    },
    actions: {
        async login({ commit }, { username: login, password }) {
            try {
                const {success} = await $fetch('http://localhost:3001/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: login, password }),
                });


                console.log("data", success)
                commit('setAuthentication', success);
                if (success) {
                    commit('setAuthentication', true);
                    commit('setApiError', null);
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
    },
});

// Экспортируем store и ключ инъекции
export { store };
