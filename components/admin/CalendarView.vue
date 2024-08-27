<template>
  <v-container>
    <h2>Календарь на неделю</h2>
    <v-row class="calendar-header">
      <v-col cols="12" v-for="day in weekDays" :key="day.date" class="day-column">
        <div class="day-header">
          <span>{{ day.label }}</span>
          <small>{{ day.dateFormatted }}</small>
        </div>
        <div class="day-events">
          <v-chip
              v-for="event in day.events"
              :key="event.name + event.start"
              :color="event.color"
              class="mb-2"
              small
          >
            {{ formatTime(event.start) }} - {{ event.name }}
          </v-chip>
        </div>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col>
        <v-btn @click="prevWeek">Предыдущая неделя</v-btn>
      </v-col>
      <v-col>
        <v-btn @click="nextWeek">Следующая неделя</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import {computed, ref} from 'vue';
import {addDays, format, startOfWeek} from 'date-fns';

const selectedDate = ref(startOfWeek(new Date(), { weekStartsOn: 1 })); // Начало недели
const slots = ref([
  // Пример слотов (замените реальными данными)
  { date: '2024-08-27', time: '14:00:00', status: 'booked', bookedBy: '327844310' },
  { date: '2024-08-27', time: '15:00:00', status: 'booked', bookedBy: '327844310' },
  { date: '2024-08-28', time: '15:00:00', status: 'booked', bookedBy: '327844310' },
  { date: '2024-08-29', time: '12:00:00', status: 'available', bookedBy: null },
]);

const fetchUserInfo = async (userId) => {
  try {
    const response = await fetch(`https://api.telegram.org/botTOKEN/getChat`, {
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

const weekDays = computed(() => {
  const start = selectedDate.value;
  return Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(start, i);
    return {
      label: format(date, 'eeee'), // День недели
      dateFormatted: format(date, 'dd MMM'), // Дата
      date: format(date, 'yyyy-MM-dd'), // Дата в формате для сравнения
      events: slots.value
          .filter(slot => slot.date === format(date, 'yyyy-MM-dd'))
          .map(slot => ({
            name: slot.status === 'booked' ? 'Занято' : 'Свободно',
            start: `${slot.date}T${slot.time}`,
            color: slot.status === 'booked' ? 'red' : 'green',
            bookedBy: slot.bookedBy,
          })),
    };
  });
});

const prevWeek = () => {
  selectedDate.value = addDays(selectedDate.value, -7);
};

const nextWeek = () => {
  selectedDate.value = addDays(selectedDate.value, 7);
};

const formatTime = (dateTime) => {
  return format(new Date(dateTime), 'HH:mm');
};
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
}

.day-column {
  text-align: center;
  border-right: 1px solid #ccc;
  padding: 8px;
}

.day-column:last-child {
  border-right: none;
}

.day-header {
  font-weight: bold;
  margin-bottom: 10px;
}

.day-events {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
