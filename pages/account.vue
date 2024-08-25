<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Ваши записи на массаж</h1>
        <v-list>
          <v-list-item
              v-for="slot in bookedSlots"
              :key="slot._id"
              class="booking-card"
          >
            <v-list-item-content>
              <v-list-item-title class="date-time">
                {{ formatDate(slot.date) }} в {{ formatTime(slot.time) }}
              </v-list-item-title>
              <v-list-item-subtitle class="massage-type">
                {{ slot.massageDetails?.type || "Тип не указан" }}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="massage-description">
                {{ slot.massageDetails?.description || "Описание отсутствует" }}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="room-number">
                Кабинет: {{ slot.room }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <!-- Кнопка отмены записи -->
              <v-btn
                  color="secondary"
                  @click="confirmCancellation(slot)"
                  class="cancel-btn"
              >
                Отменить запись
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-alert
            v-if="bookedSlots.length === 0"
            type="info"
        >
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
          <v-btn color="blue-darken-1" class="text" @click="dialog = false">
            Отмена
          </v-btn>
          <v-btn color="green-darken-1" class="text" @click="cancelBooking">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';

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
  id: string;
}

// Получаем данные через inject
const userData = inject<TelegramUserData | null>('userData');
const bookedSlots = ref<Slot[]>([]);
const dialog = ref(false);
const dialogTitle = ref('');
const dialogMessage = ref('');
let currentSlot: Slot | null = null;

const loadBookedSlots = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/schedule');
    if (response.ok) {
      const data = await response.json();
      const userId = String(userData?.value?.user?.id);
      bookedSlots.value = data.filter((slot: Slot) => slot.bookedBy === userId);
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
      const url = `http://localhost:3001/api/schedule/${currentSlot._id}/cancel`;
      const userId = userData?.value?.user?.id || 'unknown_user';

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

onMounted(() => {
  loadBookedSlots();
});
</script>

<style scoped>
.booking-card {
  background-color: #1E1E1E;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-time {
  font-size: 1.25rem;
  font-weight: bold;
}

.massage-type,
.massage-description,
.room-number {
  color: #B0BEC5;
  margin-top: 4px;
}

.cancel-btn {
  margin-left: 16px;
}
</style>
