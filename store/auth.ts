import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

@Module({ namespaced: true })
export default class AuthModule extends VuexModule {
    public isAuthenticated = false;

    @Mutation
    public SET_AUTHENTICATED(authenticated: boolean): void {
        this.isAuthenticated = authenticated;
    }

    @Action
    public async login(payload: { username: string; password: string }): Promise<void> {
        const { username, password } = payload;
        if (username === 'admin' && password === 'password') {
            this.SET_AUTHENTICATED(true);
        } else {
            throw new Error('Неправильный логин или пароль');
        }
    }
}
