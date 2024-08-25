<script setup lang="ts">
import { provide, computed, onMounted } from 'vue';
import FooterMenu from '../test-bot/components/ui/FooterMenu.vue';



let tgObj = window.Telegram;

function sendWebAppQueryResponse() {
  const tg = tgObj.WebApp;
  const query_id = tg.initDataUnsafe.query_id;

  if (query_id) {
    const result = {
      type: 'article',
      id: 'unique-id',
      title: 'Заголовок сообщения',
      input_message_content: {
        message_text: 'Это сообщение отправлено из мини-приложения!',
      },
    };

    fetch(`https://api.telegram.org/bot7451733807:AAGJlVAH1P3yZIXrkkJRKtFAWuwWXhybM6U/answerWebAppQuery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        web_app_query_id: query_id,
        result: result,
      }),
    })
        .then((response) => response.json())
        .then((data) => {
          console.log('Ответ от Telegram:', data);
        })
        .catch((error) => {
          console.error('Ошибка при отправке сообщения:', error);
        });
  } else {
    console.error('Query ID отсутствует. Не удалось отправить сообщение.');
  }
}

let userData = computed(() => tgObj.WebApp.initDataUnsafe);

onMounted(() => {
  console.log("mounted", tgObj);
  console.log("mounted initDataUnsafe", userData.value);
  tgObj.WebApp.sendData("Привет !!! " + userData.value?.user?.username);
});

// Provide userData to the whole application
provide('userData', userData);
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
