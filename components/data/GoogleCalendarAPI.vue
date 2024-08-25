<script lang="ts">
import { ref } from 'vue';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const createEvent = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../server/small-talk-ntfx-9398733134f9.json'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: 'Новое событие',
      location: 'Москва, Россия',
      description: 'Это событие создано через Google Calendar API.',
      start: {
        dateTime: '2024-08-20T09:00:00+03:00',
        timeZone: 'Europe/Moscow',
      },
      end: {
        dateTime: '2024-08-20T10:00:00+03:00',
        timeZone: 'Europe/Moscow',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    successMessage.value = `Событие создано: ${response.data.htmlLink}`;
    errorMessage.value = null;
  } catch (error) {
    console.error('Ошибка при создании события:', error);
    errorMessage.value = 'Не удалось создать событие';
    successMessage.value = null;
  }
};
</script>

<template>
  <v-container fluid class="d-flex flex-column fill-height pa-0">
    <v-sheet class="d-flex align-center" height="54" tile>
      <v-btn @click="createEvent">Создать событие в Google Calendar</v-btn>
    </v-sheet>
    <v-alert v-if="errorMessage" type="error" class="ma-2">
      {{ errorMessage }}
    </v-alert>
    <v-alert v-if="successMessage" type="success" class="ma-2">
      {{ successMessage }}
    </v-alert>
  </v-container>

</template>

<style scoped>
/* Стили для мобильного формата */
.fill-height {
  height: 100vh;
}

.pa-0 {
  padding: 0;
}

.ma-2 {
  margin: 8px;
}

.flex-grow-1 {
  flex-grow: 1;
}

</style>