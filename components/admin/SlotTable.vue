<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-text-field v-model="filters.date" label="Фильтр по дате" type="date" prepend-icon="mdi-calendar"></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-select v-model="filters.room" :items="roomOptions" label="Фильтр по комнате" prepend-icon="mdi-office-building"></v-select>
      </v-col>
    </v-row>

    <v-data-table :headers="headers" :items="filteredSlots" item-value="_id" class="elevation-1">
      <template v-slot:[`item.bookedBy`]="{ item }">
        <div v-if="item.bookedBy">
          <p><strong>Имя:</strong> {{ getUserInfo(item.bookedBy)?.first_name || 'Загрузка...' }}</p>
          <p><strong>Фамилия:</strong> {{ getUserInfo(item.bookedBy)?.last_name || 'Загрузка...' }}</p>
          <p>
            <strong>Ник:</strong>
            <a :href="`https://t.me/${getUserInfo(item.bookedBy)?.username}`" target="_blank">
              @{{ getUserInfo(item.bookedBy)?.username || 'Загрузка...' }}
            </a>
          </p>
        </div>
        <v-chip v-else color="green" text-color="white">Available</v-chip>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import {format} from 'date-fns';

// Слоты и фильтры
const slots = ref([]);
const filters = ref({
  date: format(new Date(), 'yyyy-MM-dd'),
  room: null,
});

const roomOptions = [1, 2];

const headers = [
  { text: 'Дата', value: 'date' },
  { text: 'Время', value: 'time' },
  { text: 'Комната', value: 'room' },
  { text: 'Статус', value: 'status' },
  { text: 'Забронировано', value: 'bookedBy' },
  { text: 'Тип массажа', value: 'massageDetails.type' },
  { text: 'Длительность', value: 'massageDetails.duration' },
  { text: 'Цена', value: 'massageDetails.price' },
];

// Фильтрация данных
const filteredSlots = computed(() => {
  return slots.value.filter(slot => {
    const matchDate = filters.value.date ? slot.date.startsWith(filters.value.date) : true;
    const matchRoom = filters.value.room ? slot.room === filters.value.room : true;
    return matchDate && matchRoom;
  });
});

// Загрузка данных с API
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3001/api/slots');
    const data = await response.json();
    slots.value = data;
  } catch (error) {
    console.error('Ошибка при загрузке слотов:', error);
  }
});

// Запрос данных пользователя из Telegram API
const fetchUserInfo = async (userId) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot7451733807:AAGJlVAH1P3yZIXrkkJRKtFAWuwWXhybM6U/getChat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: userId }),
    });
    if (!response.ok) throw new Error('Ошибка при получении данных пользователя');
    return await response.json();
  } catch (error) {
    console.error(error);
    return { first_name: 'Неизвестно', last_name: '', username: 'unknown' };
  }
};

// Кэширование данных пользователя
const userCache = ref(new Map());
const getUserInfo = (userId) => {
  if (!userId) return null;

  if (!userCache.value.has(userId)) {
    const userInfo = ref(null);
    userCache.value.set(userId, userInfo);
    fetchUserInfo(userId).then(data => {
      userInfo.value = data.result;
    });
  }
  return userCache.value.get(userId)?.value;
};
</script>
