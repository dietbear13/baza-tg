<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Вход в панель администратора</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field v-model="username" label="Логин" required></v-text-field>
              <v-text-field v-model="password" label="Пароль" type="password" required></v-text-field>
              <v-btn color="primary" type="submit">Войти</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {useStore} from 'vuex';
import {key} from '@/store';

const store = useStore(key);
const username = ref('');
const password = ref('');
const router = useRouter();

const login = async () => {
  try {
    const success = await store.dispatch('login', { username: username.value, password: password.value });

    if (success) {
      await router.push('/admin');
    } else {
      console.error('Неправильное имя пользователя или пароль');
    }
  } catch (error) {
    console.error('Ошибка при выполнении входа:', error);
  }
};
</script>
