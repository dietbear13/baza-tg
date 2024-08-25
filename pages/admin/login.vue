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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '@/store'; // Импортируйте типобезопасный модуль

const username = ref('');
const password = ref('');
const router = useRouter();

const login = async () => {
  try {
    await authStore.login({ username: username.value, password: password.value });
    router.push('/admin');
  } catch (error) {
    alert(error.message);
  }
};

definePageMeta({
  layout: 'admin',
});
</script>
