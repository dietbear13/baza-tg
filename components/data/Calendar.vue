<script setup lang="ts">
import {computed, inject, onMounted, ref, watch} from 'vue';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import {useRuntimeConfig} from "nuxt/app";

interface Slot {
  _id: string;
  datetime: number;
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

// Получаем данные через inject
const injectedUserData = inject<{ value: TelegramUserData | null }>('userData');
const userData = ref(injectedUserData?.value || null);


const selectedDate = ref(new Date());
const displayedMonth = ref(new Date().toISOString().slice(0, 7));
const slots = ref<Slot[]>([]);
const filteredSlots = ref<Slot[]>([]);
const selectedTime = ref<string | null>(null);
const selectedSlot = ref<Slot | null>(null);
const notificationMessage = ref<string | null>(null);
const notificationType = ref<'success' | 'error' | null>(null);
const config  = useRuntimeConfig();

// Хранилище для статусов дат
const dateStatusMap = ref<Record<string, { available: boolean; booked: boolean }>>({});

const availableTimes = computed<{ label: string; value: Slot }[]>(() => {
  return filteredSlots.value
      .slice()  // Создаем копию массива, чтобы не мутировать исходный массив
      .sort((a, b) => a.datetime - b.datetime)  // Сортируем по возрастанию времени
      .map(slot => ({
        label: format(slot.datetime, 'HH:mm', { locale: ru }),
        value: slot,
      }));
});



// Добавляем новое вычисляемое свойство для разрешенных дат
const allowedDates = computed(() => {
  const dateMap = new Map<string, { available: boolean, booked: boolean }>();

  // Формируем карту дат с состояниями "available" и "booked"
  slots.value.forEach(slot => {
    const date = format(slot.datetime, 'yyyy-MM-dd');

    if (!dateMap.has(date)) {
      dateMap.set(date, { available: false, booked: false });
      console.log(`Добавлена новая дата в карту: ${date}`);
    }

    const slotStatus = dateMap.get(date);

    if (slot.status === 'available') {
      slotStatus!.available = true;
      console.log(`Слот на дату ${date} установлен как available`);
    } else if (slot.status === 'booked') {
      slotStatus!.booked = true;
      console.log(`Слот на дату ${date} установлен как booked`);
    }
  });

  // Обновляем глобальную карту статусов дат
  dateStatusMap.value = Object.fromEntries(dateMap);

  // Разрешаем дату, если есть хотя бы один доступный слот или если все слоты забронированы
  return (date: string) => {
    const formattedDate = format(new Date(date), 'yyyy-MM-dd');
    const slotStatus = dateMap.get(formattedDate);
    return slotStatus ? slotStatus.available || slotStatus.booked : false;
  };
});

// Функция для получения CSS-класса для дней
const getDayClass = (date: string) => {
  const formattedDate = format(new Date(date), 'yyyy-MM-dd');
  const slotStatus = dateStatusMap.value[formattedDate];

  if (slotStatus && slotStatus.available) {
    return 'available-day';
  }
  return '';
};


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
    const response = await fetch(`${process.env.VUE_APP_API_URL}/slots`);
    if (response.ok) {
      const data = await response.json();
      slots.value = data.map((slot: any) => ({
        ...slot,
        _id: typeof slot._id === 'object' && slot._id.$oid ? slot._id.$oid : slot._id,
        datetime: slot.datetime * 1000, // Преобразуем время в миллисекунды
      }));
      filterSlots();
    } else {
      console.error('Ошибка при загрузке слотов:', response.statusText);
    }
  } catch (error) {
    console.error('Ошибка при загрузке слотов:', error);
  }
};

const filterSlots = () => {
  const selectedDateValue = format(selectedDate.value, 'yyyy-MM-dd');

  filteredSlots.value = slots.value.filter(slot => {
    const slotDateValue = format(new Date(slot.datetime), 'yyyy-MM-dd');
    const isAvailable = slot.status === 'available';
    return slotDateValue === selectedDateValue && isAvailable;
  });
};

const confirmBooking = async (slot: Slot) => {
  const currentSlot = slot;
  if (currentSlot && currentSlot._id) {
    try {
      const userId = String(userData.value?.user.id) || 'unknown_user';
      // const userId = userData?.value?.id || 'unknown_user';
      const url = `${process.env.VUE_APP_API_URL}/slots/${currentSlot._id}/book`;

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
        showNotification('Запись успешно выполнена', 'success');
        resetSelection();
      } else {
        const result = await response.json();
        showNotification(`Ошибка выполнения записи: ${result.message}`, 'error');
      }
    } catch (error) {
      showNotification('Ошибка при записи', 'error');
      console.error('Ошибка при записи:', error);
    }
  } else {
    showNotification('ID текущего слота не определен', 'error');
    console.error('ID текущего слота не определен');
  }
};

const showNotification = (message: string, type: 'success' | 'error') => {
  notificationMessage.value = message;
  notificationType.value = type;
  setTimeout(() => {
    notificationMessage.value = null;
    notificationType.value = null;
  }, 2000);
};

const resetSelection = () => {
  selectedTime.value = null;
  selectedSlot.value = null;
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
            show-adjacent-months
            v-model="selectedDate"
            v-model:displayed-month="displayedMonth"
            :first-day-of-week="1"
            :allowed-dates="allowedDates"
            :day-class="getDayClass"
            color="primary"
            class="mb-4 border-s-thin pa-sm-0"
            width="100%"
            :border="true"
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
            class="mb-4 pa-sm-0"
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
            class="mb-4 pa-sm-0"
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
    <v-row justify="center" v-if="notificationMessage">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-alert :type="notificationType" dismissible>
          {{ notificationMessage }}
        </v-alert>
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

.available-day {
  border: 2px solid white;
  border-radius: 50%;
}

</style>
