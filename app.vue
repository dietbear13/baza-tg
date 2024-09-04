<script setup lang="ts">
import {computed, onMounted, provide} from 'vue';
import {key, store} from '@/store'; // Импортируем store и ключ
import FooterMenu from '../test-bot/components/ui/FooterMenu.vue';
import {useRuntimeConfig} from "nuxt/app";


const config  = useRuntimeConfig();

let tgObj = window.Telegram;

function sendUserDataToServer() {
  const user = tgObj.WebApp.initDataUnsafe?.user;
  console.log('Attempting to send user data to server. User:', user);

  if (user?.id) {
    fetch(`${config.public.apiBaseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegramId: user.id, // Передаем ID пользователя на сервер
      }),
    })
        .then((response) => {
          console.log('Server response:', response);
          return response.json();
        })
        .then((data) => {
          console.log('User data sent to server successfully:', data);
        })
        .catch((error) => {
          console.error('Error sending user data:', error);
        });
  } else {
    console.error('No user data found to send to the server');
  }
}

let userData = computed(() => tgObj.WebApp.initDataUnsafe);

onMounted(() => {
  console.log('mounted', tgObj);
  console.log('mounted initDataUnsafe', userData.value);
  sendUserDataToServer(); // Отправляем данные пользователя на сервер при монтировании компонента
  tgObj.WebApp.expand();
  tgObj.WebApp.setHeaderColor('#252525');

});

// Provide userData and store to the whole application
provide('userData', userData);
provide(key, store);
</script>
<template>
  <NuxtLayout>
    <v-app>
      <div class="content">
        <p>{{ userData }}</p>
        <NuxtPage />
      </div>
      <FooterMenu />
    </v-app>
  </NuxtLayout>
</template>

<style scoped>
.content {
  padding-bottom: 56px; /* Отступ снизу должен соответствовать высоте футера */
}
</style>
