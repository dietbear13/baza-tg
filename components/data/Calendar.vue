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

// Получаем данные через inject
const userData = inject<TelegramUserData | null>('userData');

onMounted(() => {
  if (userData?.value) {
    const userId = userData.value.user?.id;
    console.log("++ Полученные данные userData:", userId);
  } else {
    console.error("Не удалось получить данные userData.");
  }
});

const selectedDate = ref(new Date());
const displayedMonth = ref(new Date().toISOString().slice(0, 7));
const slots = ref<Slot[]>([]);
const filteredSlots = ref<Slot[]>([]);
const selectedTime = ref<string | null>(null);
const selectedSlot = ref<Slot | null>(null);
const dialog = ref(false);
const dialogTitle = ref('');
const dialogMessage = ref('');
let currentSlot: Slot | null = null;

const availableTimes = computed(() => {
  return filteredSlots.value.map(slot => ({
    label: slot.time,
    value: slot,
  }));
});

const massageTypes = computed(() => {
  return filteredSlots.value.map(slot => ({
    label: slot.massageDetails?.type || "Тип не указан",
    value: slot,
  }));
});

const loadSlots = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/schedule');
    if (response.ok) {
      const data = await response.json();
      slots.value = data.map((slot: any) => ({
        ...slot,
        _id: typeof slot._id === 'object' && slot._id.$oid ? slot._id.$oid : slot._id,
      }));
      filterSlots();
    } else {
      console.error('Ошибка при загрузке слотов:', response.statusText);
    }
  } catch (error) {
    console.error('Ошибка при загрузке слотов:', error);
  }
};

const logSelectedTime = (time: Slot) => {
  console.log("Selected time:", time.time);
  selectedSlot.value = null; // Сбросить выбранный слот при изменении времени
};

// Логирование изменений в `selectedSlot`
const logSelectedSlot = (slot: Slot) => {
  console.log("Selected slot:", slot.massageDetails?.type);
};

const filterSlots = () => {
  const userId = userData?.value?.user?.id;
  const selectedDateValue = selectedDate.value.toLocaleDateString('en-CA');

  filteredSlots.value = slots.value.filter(slot => {
    const slotDateValue = new Date(slot.date).toLocaleDateString('en-CA');
    const isAvailableOrOwned = slot.status === 'available' || slot.bookedBy === userId;
    return slotDateValue === selectedDateValue && isAvailableOrOwned;
  });
};

const confirmBooking = (slot: Slot, action: string) => {
  currentSlot = slot;
  if (action === 'register') {
    dialogTitle.value = 'Подтверждение записи';
    dialogMessage.value = 'Вы уверены, что хотите записаться на этот массаж?';
  } else {
    dialogTitle.value = 'Подтверждение отмены';
    dialogMessage.value = 'Вы уверены, что хотите отменить запись на этот массаж?';
  }
  dialog.value = true;
};

const confirmAction = async () => {
  if (currentSlot && currentSlot._id) {
    try {
      const userId = userData?.value?.user?.id || 'unknown_user';
      let url = `http://localhost:3001/api/schedule/${currentSlot._id}/`;
      const action = currentSlot.status === 'available' ? 'book' : 'cancel';
      url += action;

      const bookedBy = action === 'book' ? userId : null;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          bookedBy: bookedBy,
        }),
      });

      if (response.ok) {
        // Обновляем статус текущего слота на клиенте без перезагрузки всех данных
        currentSlot.status = action === 'book' ? 'booked' : 'available';
        currentSlot.bookedBy = bookedBy;
        dialog.value = false;
      } else {
        const result = await response.json();
        console.error('Ошибка выполнения действия:', result.message);
      }
    } catch (error) {
      console.error('Ошибка при выполнении действия:', error);
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
  <v-container>
    <v-row justify="center">
      <v-date-picker
          v-model="selectedDate"
          v-model:displayed-month="displayedMonth"
          :first-day-of-week="1"
          :locale="'en-CA'"
          color="primary"
      ></v-date-picker>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-select
            v-model="selectedTime"
            :items="availableTimes"
            label="Выберите время"
            color="primary"
            item-title="label"
            item-value="value"
            @change="logSelectedTime"
        ></v-select>
      </v-col>
      <v-col cols="12" v-if="selectedTime">
        <v-select
            v-model="selectedSlot"
            :items="massageTypes"
            label="Выберите тип массажа"
            color="primary"
            item-title="label"
            item-value="value"
            @change="logSelectedSlot"
        ></v-select>
      </v-col>
    </v-row>
    <v-row justify="center" v-if="selectedSlot">
      <v-btn color="primary" @click="confirmBooking(selectedSlot, 'register')">
        Записаться на массаж
      </v-btn>
      <v-btn color="secondary" @click="confirmBooking(selectedSlot, 'cancel')">
        Отменить запись
      </v-btn>
    </v-row>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="headline">{{ dialogTitle }}</v-card-title>
        <v-card-text>{{ dialogMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" class="text" @click="dialog = false">
            Отмена
          </v-btn>
          <v-btn color="green-darken-1" class="text" @click="confirmAction">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
