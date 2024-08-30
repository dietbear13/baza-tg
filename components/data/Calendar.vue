<script setup lang="ts">
import {computed, inject, onMounted, ref, watch} from 'vue';

interface Slot {
  _id: string;
  date: string;
  time: string;
  room: number;
  status: string;
  bookedBy: string | null;
  massageDetails: {
    type: string;
    duration: number;
    price: number;
  } | null;
}

interface TelegramUserData {
  id: string;
}

const userData = inject<TelegramUserData | null>('userData');

const selectedDate = ref(new Date());
const displayedMonth = ref(new Date().toISOString().slice(0, 7));
const slots = ref<Slot[]>([]);
const filteredSlots = ref<Slot[]>([]);
const selectedTime = ref<string | null>(null);
const selectedSlot = ref<Slot | null>(null);

const availableTimes = computed<{ label: string; value: Slot }[]>(() => {
  return filteredSlots.value.map(slot => ({
    label: slot.time,
    value: slot,
  }));
});

const massageTypes = computed<{ label: string; value: Slot }[]>(() => {
  const uniqueTypes = new Set<string>();
  return filteredSlots.value.reduce((types, slot) => {
    if (slot.massageDetails?.type && !uniqueTypes.has(slot.massageDetails.type)) {
      uniqueTypes.add(slot.massageDetails.type);
      types.push({
        label: slot.massageDetails.type,
        value: slot,
      });
    }
    return types;
  }, [] as { label: string; value: Slot }[]);
});

const loadSlots = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/slots');
    if (response.ok) {
      const data = await response.json();
      slots.value = data.map((slot: any) => {
        const date = new Date(slot.datetime * 1000);

        if (isNaN(date.getTime())) {
          console.error('Неверное значение времени:', slot.datetime);
          return null;
        }

        return {
          ...slot,
          date: date.toISOString().split('T')[0],
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          _id: typeof slot._id === 'object' && slot._id.$oid ? slot._id.$oid : slot._id,
        };
      }).filter(slot => slot !== null);
      filterSlots();
    } else {
      console.error('Ошибка при загрузке слотов:', response.statusText);
    }
  } catch (error) {
    console.error('Ошибка при загрузке слотов:', error);
  }
};

const filterSlots = () => {
  const selectedDateValue = selectedDate.value.toISOString().slice(0, 10);

  filteredSlots.value = slots.value.filter(slot => {
    const slotDateValue = new Date(slot.date).toISOString().slice(0, 10);
    const isAvailable = slot.status === 'available';
    return slotDateValue === selectedDateValue && isAvailable;
  });
};

const confirmBooking = async (slot: Slot) => {
  currentSlot = slot;
  if (currentSlot && currentSlot._id) {
    try {
      const userId = userData?.id || 'unknown_user';
      const url = `http://localhost:3001/api/slots/${currentSlot._id}/book`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          bookedBy: userId,
        }),
      });

      if (response.ok) {
        currentSlot.status = 'booked';
        currentSlot.bookedBy = userId;
        filterSlots();
        console.log('Запись успешно выполнена');
      } else {
        const result = await response.json();
        console.error('Ошибка выполнения записи:', result.message);
      }
    } catch (error) {
      console.error('Ошибка при записи:', error);
    }
  } else {
    console.error('ID текущего слота не определен');
  }
};

onMounted(() => {
  loadSlots();
});

watch(selectedDate, () => {
  filterSlots();
});

watch(slots, () => {
  filterSlots();
});
</script>

<template>
  <v-container style="align: center">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-date-picker
            v-model="selectedDate"
            v-model:displayed-month="displayedMonth"
            :first-day-of-week="1"
            :locale="'en-CA'"
            color="primary"
            class="mb-4"
        ></v-date-picker>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-select
            v-model="selectedTime"
            :items="availableTimes"
            label="Выберите время"
            color="primary"
            item-title="label"
            item-value="value"
            class="mb-4"
        ></v-select>
      </v-col>
    </v-row>
    <v-row justify="center" v-if="selectedTime">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-select
            v-model="selectedSlot"
            :items="massageTypes"
            label="Выберите тип массажа"
            color="primary"
            item-title="label"
            item-value="value"
            class="mb-4"
        ></v-select>
      </v-col>
    </v-row>
    <v-row justify="center" v-if="selectedSlot">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-btn color="primary" block @click="confirmBooking(selectedSlot)">
          Записаться на массаж
        </v-btn>
      </v-col>
    </v-row>
    <v-row justify="center" v-if="filteredSlots.length === 0">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-alert type="info">На выбранную дату нет свободных записей на массаж.</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

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
.room-number {
  color: #B0BEC5;
  margin-top: 4px;
}
</style>
