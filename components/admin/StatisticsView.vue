<template>
  <v-container>
    <h2>Статистика по слотам</h2>
    <v-card class="pa-4">
      <p>Всего слотов на {{ filters.date }}: {{ totalSlots }}</p>
      <p>Занято: {{ bookedSlots }}</p>
      <p>Свободно: {{ availableSlots }}</p>
    </v-card>
  </v-container>
</template>

<script setup>
import {computed, ref} from 'vue';
import {format} from 'date-fns';

// Фильтр по дате
const filters = ref({
  date: format(new Date(), 'yyyy-MM-dd'),
});

// Заглушка для слотов
const slots = ref([
  // Заполните реальными данными
]);

// Расчеты статистики
const totalSlots = computed(() => slots.value.length);
const bookedSlots = computed(() => slots.value.filter(slot => slot.status === 'booked').length);
const availableSlots = computed(() => slots.value.filter(slot => slot.status === 'available').length);
</script>

<style scoped>
.pa-4 {
  padding: 16px;
}
</style>
