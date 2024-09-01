<template>
  <v-app>
    <!-- Подключаем AdminMenu -->
    <AdminMenu />

    <v-main>
      <v-container>
        <h1>Статистика</h1>
        <v-row>
          <v-col cols="12" md="4">
            <v-card class="pa-4 text-center">
              <v-icon size="34" class="mb-2">mdi-calendar-today</v-icon>
              <h3>{{ totalSlots }}</h3>
              <p>Всего слотов</p>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="pa-4 text-center">
              <v-icon size="34" class="mb-2" color="red">mdi-calendar-check</v-icon>
              <h3>{{ bookedSlots }}</h3>
              <p>Занято</p>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="pa-4 text-center">
              <v-icon size="34" class="mb-2" color="green">mdi-calendar-remove</v-icon>
              <h3>{{ availableSlots }}</h3>
              <p>Свободно</p>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="pa-4 mt-4">
          <v-row>
            <v-col cols="12" md="3">
              <div class="pa-2">
                <v-chip class="mb-2" color="blue" text-color="white">
                  <v-icon left>mdi-calendar-week</v-icon> Текущая неделя
                </v-chip>
                <v-row dense>
                  <v-col cols="12">
                    <p>Всего записей</p>
                    <v-icon left>mdi-counter</v-icon>
                    <strong>{{ weeklyStats.total }}</strong>
                  </v-col>
                  <v-col cols="12">
                    <p>Заработано: {{ weeklyStats.pastSum }} ₽</p>
                    <v-icon left>mdi-clock-start</v-icon>
                    <strong>{{ weeklyStats.pastCount }}</strong>
                  </v-col>
                  <v-col cols="12">
                    <p>До конца недели: {{ weeklyStats.futureSum }} ₽</p>
                    <v-icon left>mdi-clock-end</v-icon>
                    <strong>{{ weeklyStats.futureCount }}</strong>
                  </v-col>
                </v-row>
              </div>
            </v-col>

            <v-col cols="12" md="9">
              <div class="pa-2">
                <v-chip class="mb-2" color="teal" text-color="white">
                  <v-icon left>mdi-calendar-range</v-icon> Статистика по дням
                </v-chip>
                <v-row dense>
                  <v-col v-for="(dayStat, index) in dailyStats" :key="index" cols="12" md="6" lg="4">
                    <v-card class="pa-3 mb-4" outlined>
                      <v-card-title class="d-flex justify-space-between align-center">
                        <span><v-icon small color="primary">mdi-calendar-clock</v-icon>
                        {{ dayStat.label }}</span>
                      </v-card-title>
                      <v-card-subtitle class="mb-3">{{ dayStat.count }} записей, {{ dayStat.sum }} ₽</v-card-subtitle>
                      <v-progress-linear :value="calculateProgress(dayStat.count)" color="primary" height="6" class="mb-2"></v-progress-linear>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AdminMenu from '~/components/admin/AdminMenu.vue';
import {computed, onMounted, ref} from 'vue';
import {addDays, endOfWeek, format, startOfWeek} from 'date-fns';
import {ru} from 'date-fns/locale';

interface Slot {
  _id: string;
  datetime?: number;
  date?: string;
  room: number;
  status: 'available' | 'booked';
  bookedBy?: string | null;
  massageDetails?: {
    type: string;
    duration: number;
    price: number;
  };
}

interface DayStats {
  label: string;
  count: number;
  sum: number;
}

const filters = ref({
  date: format(new Date(), 'yyyy-MM-dd'),
});

const slots = ref<Slot[]>([]);

const loadSlots = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/slots');
    slots.value = await response.json();
    console.log("slots", slots.value);
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
};

onMounted(() => {
  loadSlots();
});

const maxCount = ref<number>(100);
const maxSum = ref<number>(10000);

const calculateProgress = (count: number): number => {
  return (count / maxCount.value) * 100;
};

const totalSlots = computed(() => slots.value.length);
const bookedSlots = computed(() => slots.value.filter(slot => slot.status === 'booked').length);
const availableSlots = computed(() => slots.value.filter(slot => slot.status === 'available').length);

const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

const weeklyStats = computed(() => {
  let total = 0, pastCount = 0, pastSum = 0, futureCount = 0, futureSum = 0;
  const now = new Date();

  slots.value.forEach(slot => {
    const slotDate = slot.datetime ? new Date(slot.datetime * 1000) : new Date(slot.date as string);
    const price = slot.status === 'booked' ? slot.massageDetails?.price || 0 : 0;

    if (slot.status === 'booked') {
      if (slotDate < now) {
        pastCount++;
        pastSum += price;
      } else if (slotDate >= now && slotDate <= weekEnd) {
        futureCount++;
        futureSum += price;
      }
    }
    if (slotDate >= weekStart && slotDate <= weekEnd) {
      total++;
    }
  });

  return { total, pastCount, pastSum, futureCount, futureSum };
});

const dailyStats = computed<DayStats[]>(() => {
  return Array.from({ length: 7 }).map((_, i) => {
    const dayDate = addDays(weekStart, i);
    const daySlots = slots.value.filter(slot => {
      const slotDate = slot.datetime ? new Date(slot.datetime * 1000) : new Date(slot.date as string);
      return slot.status === 'booked' && format(slotDate, 'yyyy-MM-dd') === format(dayDate, 'yyyy-MM-dd');
    });
    const dayCount = daySlots.length;
    const daySum = daySlots.reduce((sum, slot) => sum + (slot.massageDetails?.price || 0), 0);
    return {
      label: format(dayDate, 'eeee, dd MMMM', { locale: ru }),
      count: dayCount,
      sum: daySum,
    };
  });
});
</script>

<style scoped>
.mt-4 {
  margin-top: 16px;
}

.pa-4 {
  padding: 16px;
}
.pa-3 {
  padding: 12px;
}

.pa-3 .v-card-title {
  font-size: 16px;
  font-weight: 600;
}

.pa-3 .v-card-subtitle {
  font-size: 14px;
  color: #cfcfcf;
}
.pa-2 {
  background-color: #333333;
  border-radius: 6px;
}
</style>
