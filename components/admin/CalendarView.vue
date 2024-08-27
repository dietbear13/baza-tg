<template>
  <v-container>
    <h2>Календарь на неделю</h2>
    <v-row>
      <v-col cols="12">
        <v-calendar
            ref="calendar"
            v-model:now="selectedDate"
            :weekdays="weekdays"
            :day-format="dayFormat"
            :hide-header="true"
            :events="calendarEvents"
            @click:event="onEventClick"
            color="blue"
        >
        </v-calendar>
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
import {format} from 'date-fns';

// Состояния и данные
const selectedDate = ref(format(new Date(), 'yyyy-MM-dd'));
const weekdays = ref([1, 2, 3, 4, 5, 6, 0]); // Понедельник - воскресенье

// Заглушка для событий календаря
const slots = ref([
  // Заполните реальными данными
]);

const calendarEvents = computed(() => {
  return slots.value.map(slot => ({
    name: slot.status === 'booked' ? 'Занято' : 'Свободно',
    start: `${slot.date}T${slot.time}`,
    color: slot.status === 'booked' ? 'red' : 'green',
  }));
});

// Формат даты
const dayFormat = (date) => format(new Date(date), 'd MMM');

// Функции для переключения недели
const prevWeek = () => {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() - 7);
  selectedDate.value = format(date, 'yyyy-MM-dd');
};

const nextWeek = () => {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() + 7);
  selectedDate.value = format(date, 'yyyy-MM-dd');
};

// Обработка кликов по событиям
const onEventClick = (event) => {
  console.log('Event clicked:', event);
};
</script>

<style scoped>
.mt-4 {
  margin-top: 16px;
}
</style>
