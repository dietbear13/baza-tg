<script setup lang="ts">
import {inject, ref} from 'vue';
import {useRouter} from 'vue-router';
import {key} from '@/store'; // Импортируем ключ

const store = inject(key);

// Инжектируем store через ключ
console.log("store", store);
if (!store) {
  throw new Error('Store не был предоставлен');
}

// Переменные для имени пользователя и пароля
const username = ref('');
const password = ref('');
const router = useRouter();

// Логика для входа
const login = async () => {
  try {
    // Выполняем действие login в хранилище Vuex
    const success = await store.dispatch('login', { username: username.value, password: password.value });

    // Если успешный логин, перенаправляем на админскую панель
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
