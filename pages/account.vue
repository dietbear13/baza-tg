<template>
  <v-container>
    <v-row justify="space-between" align="center">
      <h1>Ваши записи на массаж</h1>
      <v-btn icon @click="openSettings">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-list>
          <v-list-item
              v-for="slot in bookedSlots"
              :key="slot._id"
              class="booking-card"
          >
            <v-list-item-content>
              <v-list-item-title class="date-time">
                <v-icon color="primary">mdi-calendar</v-icon>
                {{ formatDate(slot.date) }} в {{ formatTime(slot.time) }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ slot.massageDetails?.type || "Тип не указан" }} -
                {{ slot.massageDetails?.description || "Описание отсутствует" }}
              </v-list-item-subtitle>
              <v-list-item-subtitle>Кабинет: {{ slot.room }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon
                  class="cancel-icon"
                  color="red"
                  @click="confirmCancellation(slot)"
              >
                mdi-close-circle
              </v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-alert v-if="bookedSlots.length === 0" type="info">
          У вас нет записей на массаж.
        </v-alert>
      </v-col>
    </v-row>

    <!-- Диалог подтверждения отмены -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="headline">{{ dialogTitle }}</v-card-title>
        <v-card-text>{{ dialogMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" text @click="dialog = false">Отмена</v-btn>
          <v-btn color="green-darken-1" text @click="cancelBooking">Подтвердить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог настроек -->
    <UserSettings v-model:settingsDialog="settingsDialog" />
  </v-container>
</template>

<script setup lang="ts">
import {inject, onMounted, ref} from 'vue';
import UserSettings from "@/components/data/UserSettings.vue"; // Импортируем компонент UserSettings

interface Slot {
  _id: string;
  date: string;
  time: string;
  room: number;
  status: string;
  bookedBy: string | null;
  massageDetails: {
    type: string;
    description: string;
    duration: number;
    price: number;
  } | null;
}

interface TelegramUserData {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
  };
  settings: {
    notifications: {
      enabled: boolean;
      hoursBefore: number;
    };
  };
}

// Получаем данные через inject
const injectedUserData = inject<{ value: TelegramUserData | null }>('userData');
const userData = ref(injectedUserData?.value || null);
const bookedSlots = ref<Slot[]>([]);
const dialog = ref(false);
const settingsDialog = ref(false);
const dialogTitle = ref('');
const dialogMessage = ref('');
let currentSlot: Slot | null = null;

console.log("!!! injectedUserData", injectedUserData);
console.log("!!! userData", userData);

const fetchUserInfo = async (userId: number) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot7451733807:AAGJlVAH1P3yZIXrkkJRKtFAWuwWXhybM6U/getChat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: userId }),
    });
    const data = await response.json();
    console.log("data.result", data.result);
    userData.value = { id: data.result.id, user: data.result, settings: userData.value?.settings || {} }; // Обновляем данные пользователя
  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
  }
};

const loadBookedSlots = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/slots');
    if (response.ok) {
      const data = await response.json();
      console.log("++ Записи, полученные с сервера:", data); // Логируем все полученные данные
      const userId = String(userData.value?.user.id);
      console.log("++ Текущий userId:", userId); // Логируем текущий userId
      bookedSlots.value = data.filter((slot: Slot) => {
        const isMatch = String(slot.bookedBy) === userId;
        console.log(`-- Сопоставление слота ${slot._id} с userId: ${isMatch}`); // Логируем результат сопоставления
        return isMatch;
      });
      console.log("++ Отфильтрованные записи пользователя:", bookedSlots.value); // Логируем отфильтрованные записи
    } else {
      console.error('Ошибка при загрузке записей:', response.statusText);
    }
  } catch (error) {
    console.error('Ошибка при загрузке записей:', error);
  }
};

// Форматирование даты в формате ДД.ММ.ГГГГ
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Форматирование времени в формате ЧЧ:ММ
const formatTime = (time: string) => {
  return time.slice(0, 5);
};

// Подтверждение отмены записи
const confirmCancellation = (slot: Slot) => {
  currentSlot = slot;
  dialogTitle.value = 'Подтверждение отмены';
  dialogMessage.value = 'Вы уверены, что хотите отменить запись на этот массаж?';
  dialog.value = true;
};

// Отмена записи
const cancelBooking = async () => {
  if (currentSlot && currentSlot._id) {
    try {
      const url = `http://localhost:3001/api/slots/${currentSlot._id}/cancel`;
      const userId = String(userData.value?.user.id) || 'unknown_user';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (response.ok) {
        // Удаляем слот из списка записей на клиенте
        bookedSlots.value = bookedSlots.value.filter(slot => slot._id !== currentSlot?._id);
        dialog.value = false;
        console.log('Запись успешно отменена');
      } else {
        const result = await response.json();
        console.error('Ошибка отмены записи:', result.message);
      }
    } catch (error) {
      console.error('Ошибка при отмене записи:', error);
    }
  } else {
    console.error('ID текущего слота не определен');
  }
};

const openSettings = () => {
  console.log('Клик по кнопке настройки');
  settingsDialog.value = true;
};

onMounted(async () => {
  if (userData.value?.user.id) {
    await fetchUserInfo(userData.value.user.id);
  }
  loadBookedSlots();
});
</script>
