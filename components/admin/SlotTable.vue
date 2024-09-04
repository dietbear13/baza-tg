<template>
  <v-container fluid>
    <h2>Календарь на неделю</h2>

    <!-- Объединенная подложка для фильтров и действий -->
    <v-sheet class="py-4 px-6 mb-6" color="grey lighten-4" elevation="2">
      <!-- Фильтры для выбора диапазона времени и дней недели -->
      <v-row>
        <v-col cols="12" md="4">
          <v-select
              v-model="selectedDays"
              :items="daysOptions"
              multiple
              label="Выберите дни недели"
              outlined
              dense
              width="400px"
          ></v-select>
        </v-col>

        <v-col cols="12" md="3">
          <v-time-picker
              v-model="startTime"
              label="Начало"
              format="24hr"
              full-width
              outlined
              dense
          ></v-time-picker>
        </v-col>
        <v-col cols="12" md="3">
          <v-time-picker
              v-model="endTime"
              label="Конец"
              format="24hr"
              full-width
              outlined
              dense
          ></v-time-picker>
        </v-col>

        <!-- Форма выбора действий -->
        <v-col cols="12" md="2">
          <v-btn @click="cancelSlots" class="action-btn" color="primary">Отменить</v-btn>
          <v-btn @click="deleteSlots" class="action-btn" color="red">Удалить</v-btn>
          <v-btn @click="fillSlots" class="action-btn" color="green">Добавить</v-btn>
        </v-col>
      </v-row>
    </v-sheet>

    <!-- Таблица календаря -->
    <v-data-table
        class="calendar-table"
        :headers="headers"
        :items="timeSlots"
        :items-per-page="14"
        hide-default-footer
        fixed-header
    >
      <!-- Table Header -->
      <template v-slot:top>
        <thead>
        <tr>
          <th class="time-column">Время</th>
          <th v-for="day in weekDays" :key="day.dateFormatted" class="day-column">
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on" class="header-menu-trigger">
                    {{ day.label }},<br />{{ day.dateFormatted }}
                  </span>
              </template>

              <v-list>
                <v-list-item @click="cancelColumn(day)">
                  <v-list-item-title>Отменить все слоты</v-list-item-title>
                </v-list-item>
                <v-list-item @click="deleteColumn(day)">
                  <v-list-item-title>Удалить все слоты</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </th>
        </tr>
        </thead>
      </template>

      <!-- Table Body -->
      <template v-slot:default="{ items }">
        <tbody>
        <tr v-for="timeSlot in items" :key="timeSlot">
          <td class="time-column">{{ timeSlot }}</td>
          <td v-for="day in weekDays" :key="day.dateFormatted" class="day-column">
            <div class="day-events">
              <v-skeleton-loader
                  v-if="loading"
                  type="list-item"
                  height="20px"
                  width="100%"
              ></v-skeleton-loader>

              <span v-else-if="day.events.length === 0"></span>

              <span v-else>
                  <v-menu
                      v-for="event in day.events.filter(event => format(event.start, 'yyyy-MM-dd HH:mm') === format(new Date(day.date.getTime() + (parseInt(timeSlot.split(':')[0]) * 3600000) + (parseInt(timeSlot.split(':')[1]) * 60000)), 'yyyy-MM-dd HH:mm'))"
                      :key="event.name + event.start"
                      close-on-content-click
                  >
                    <template v-slot:activator="{ props }">
                      <v-chip
                          v-bind="props"
                          :color="event.color"
                          class="mb-2"
                          small
                      >
                        {{ event.name }}
                      </v-chip>
                    </template>

                    <v-list>
                      <template v-if="event.bookedBy">
                        <v-list-item>
                          <v-list-item-title>Имя: {{ getUserInfo(event.bookedBy)?.first_name || '...' }} {{ getUserInfo(event.bookedBy)?.last_name || '...' }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>
                            Ник: <a :href="`https://t.me/${getUserInfo(event.bookedBy)?.username}`" target="_blank">
                              @{{ getUserInfo(event.bookedBy)?.username || '...' }}
                            </a>
                          </v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item @click="releaseSlot(event)">
                          <v-list-item-title>Освободить</v-list-item-title>
                        </v-list-item>
                      </template>

                      <v-list-item @click="deleteEvent(event)">
                        <v-list-item-title>Удалить</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </span>
            </div>
          </td>
        </tr>
        </tbody>
      </template>
    </v-data-table>

    <v-row class="mt-4">
      <v-col>
        <v-btn @click="prevWeek" class="nav-btn">Предыдущая неделя</v-btn>
      </v-col>
      <v-col>
        <v-btn @click="nextWeek" class="nav-btn">Следующая неделя</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// Логика загрузки данных и состояние загрузки
const loading = ref(true);

definePageMeta({
  middleware: 'auth'
});

import {computed, onMounted, ref} from 'vue';
import {addDays, format, fromUnixTime, setHours, setMinutes, setSeconds, startOfWeek} from 'date-fns';
import {ru} from 'date-fns/locale';

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
  };
}


const selectedDate = ref(startOfWeek(new Date(), { weekStartsOn: 1 }));
const slots = ref([]);
const selectedDays = ref(['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']);
const startTime = ref('08:00');
const endTime = ref('22:00');

const releaseSlot = async (event: any) => {
  if (!confirm("Вы уверены, что хотите освободить этот слот?")) {
    return;
  }

  if (!event._id) {
    console.error('Ошибка: отсутствует идентификатор слота (_id).');
    return;
  }

  event.status = 'available';
  event.bookedBy = null;

  try {
    const response = await fetch(`http://localhost:3001/api/admin/slots/${event._id}`, {
      method: 'PATCH',
      body: JSON.stringify(event),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log("Slot released successfully:", await response.json());
    await loadSlots();  // обновление слотов после операции
  } catch (error) {
    console.error('Ошибка при освобождении слота:', error);
  }
};

const deleteEvent = async (event: any) => {
  console.log('Удаление события:', event);

  if (!event._id) {
    console.error('Ошибка: отсутствует идентификатор слота (_id).');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/api/admin/slots/${event._id}`, {
      method: 'DELETE',
    });
    console.log("Slot deleted successfully:", await response.json());
    await loadSlots();
  } catch (error) {
    console.error('Ошибка при удалении слота:', error);
  }
};


const cancelColumn = async (day: any) => {
  const slotsToCancel = slots.value.filter(slot => format(fromUnixTime(slot.datetime), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd') && slot.status === 'booked');
  for (const slot of slotsToCancel) {
    slot.status = 'available';
    slot.bookedBy = null;
    await fetch(`/api/admin/slots/${slot._id}`, {
      method: 'PATCH',
      body: JSON.stringify(slot),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  loadSlots();
};

const deleteColumn = async (day: any) => {
  const slotsToDelete = slots.value.filter(slot => format(fromUnixTime(slot.datetime), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd'));
  for (const slot of slotsToDelete) {
    await fetch(`/api/admin/slots/${slot._id}`, {
      method: 'DELETE',
    });
  }
  loadSlots();
};

// Функции для обработки действий по фильтрам
const cancelSlots = async () => {
  console.log("cancelSlots triggered");

  if (!confirm("Вы уверены, что хотите отменить все забронированные слоты по выбранным фильтрам?")) {
    return;
  }

  const startHour = parseInt(startTime.value.split(':')[0]);
  const endHour = parseInt(endTime.value.split(':')[0]);

  const filteredWeekDays = weekDays.value.filter(day =>
      selectedDays.value.map(day => day.toLowerCase()).includes(day.label.toLowerCase())
  );

  for (const day of filteredWeekDays) {
    for (let hour = startHour; hour <= endHour; hour++) {
      const datetime = Math.floor(new Date(day.date).setHours(hour, 0, 0, 0) / 1000);

      const slotToUpdate = slots.value.find(slot => slot.datetime === datetime);

      if (slotToUpdate && slotToUpdate.status === 'booked') {
        slotToUpdate.status = 'available';
        slotToUpdate.bookedBy = null;

        try {
          const response = await fetch(`http://localhost:3001/api/admin/slots/${slotToUpdate._id}`, {
            method: 'PUT',
            body: JSON.stringify(slotToUpdate),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log("Slot cancelled successfully:", await response.json());
        } catch (error) {
          console.error('Ошибка при отмене слота:', error);
        }
      }
    }
  }

// Показать уведомление об успешной отмене слотов
alert("Все забронированные слоты по выбранным фильтрам успешно отменены!");

// Обновляем данные после отмены
await loadSlots();
};

const deleteSlots = async () => {
  if (!confirm("Вы уверены, что хотите удалить все слоты по выбранным фильтрам? Это действие нельзя будет отменить.")) {
    return;
  }

  const startHour = parseInt(startTime.value.split(':')[0]);
  const endHour = parseInt(endTime.value.split(':')[0]);

  const filteredWeekDays = weekDays.value.filter(day =>
      selectedDays.value.map(day => day.toLowerCase()).includes(day.label.toLowerCase())
  );

  for (const day of filteredWeekDays) {
    for (let hour = startHour; hour <= endHour; hour++) {
      const datetime = Math.floor(new Date(day.date).setHours(hour, 0, 0, 0) / 1000);

      const slotToDelete = slots.value.find(slot => slot.datetime === datetime);

      if (slotToDelete) {
        try {
          const response = await fetch(`http://localhost:3001/api/admin/slots/${slotToDelete._id}`, {
            method: 'DELETE',
          });
          console.log("Slot deleted successfully:", await response.json());
        } catch (error) {
          console.error('Ошибка при удалении слота:', error);
        }
      }
    }
  }

// Показать уведомление об успешном удалении слотов
alert("Все слоты по выбранным фильтрам успешно удалены!");

// Обновляем данные после удаления
await loadSlots();
};

// Функция для освобождения всех слотов
const releaseSlots = async () => {
  if (!confirm("Вы уверены, что хотите освободить все слоты по выбранным фильтрам? Это действие изменит статус всех слотов на 'available'.")) {
    return;
  }

  const startHour = parseInt(startTime.value.split(':')[0]);
  const endHour = parseInt(endTime.value.split(':')[0]);

  const filteredWeekDays = weekDays.value.filter(day =>
      selectedDays.value.map(day => day.toLowerCase()).includes(day.label.toLowerCase())
  );

  for (const day of filteredWeekDays) {
    for (let hour = startHour; hour <= endHour; hour++) {
      const datetime = Math.floor(new Date(day.date).setHours(hour, 0, 0, 0) / 1000);

      const slotToUpdate = slots.value.find(slot => slot.datetime === datetime);

      if (slotToUpdate && slotToUpdate.status !== 'available') {
        slotToUpdate.status = 'available';
        slotToUpdate.bookedBy = null;

        try {
          const response = await fetch(`http://localhost:3001/api/slots/${slotToUpdate._id}`, {
            method: 'PUT',
            body: JSON.stringify(slotToUpdate),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log("Slot updated successfully:", await response.json());
        } catch (error) {
          console.error('Ошибка при обновлении слота:', error);
        }
      }
    }
  }

// Показать уведомление об успешном освобождении слотов
alert("Все слоты по выбранным фильтрам успешно освобождены!");

// Обновляем данные после освобождения
await loadSlots();
};

const filterMassageType = ref('Все');
const filterTherapist = ref('Все');


const loadSlots = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/slots');
    if (!response.ok) {
      throw new Error(`Ошибка при загрузке слотов: ${response.statusText}`);
    }
    const data: Slot[] = await response.json();
    slots.value = data.map(slot => ({
      ...slot,
      _id: slot._id || slot.id, // Убедитесь, что идентификатор есть у всех слотов
    }));
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
};

onMounted(async () => {
  await loadSlots();
  loading.value = false; // Отключаем skeleton после загрузки
});

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 22; hour++) {
    const time = format(setSeconds(setMinutes(setHours(new Date(), hour), 0), 0), 'HH:mm');
    slots.push(time);
  }
  return slots;
};

const timeSlots = computed(() => generateTimeSlots());

const weekDays = computed(() => {
  const start = selectedDate.value;
  return Array.from({length: 7}).map((_, i) => {
    const date = addDays(start, i);
    return {
      label: format(date, 'eeee', {locale: ru}),
      dateFormatted: format(date, 'dd MMM', {locale: ru}),
      date,
      events: slots.value
          .filter(slot => format(fromUnixTime(slot.datetime), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
          .map(slot => ({
            name: slot.status === 'booked' ? 'Занято' : 'Свободно',
            start: fromUnixTime(slot.datetime),
            color: slot.status === 'booked' ? 'red' : 'green',
            bookedBy: slot.bookedBy,
            _id: slot._id // Убедимся, что _id передается
          })),
    };
  });
});

const headers = computed(() => [
  {text: 'Время', value: 'timeSlot', align: 'start', sortable: false},
  ...weekDays.value.map(day => ({
    text: `${day.label}, ${day.dateFormatted}`,
    value: day.dateFormatted,
    align: 'start',
    sortable: false
  })),
]);

const daysOptions = [
  'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье',
];

const prevWeek = () => {
  selectedDate.value = addDays(selectedDate.value, -7);
};

const nextWeek = () => {
  selectedDate.value = addDays(selectedDate.value, 7);
};

const fillSlots = async () => {
  console.log("fillSlots triggered");

  const startHour = parseInt(startTime.value.split(':')[0]);
  const endHour = parseInt(endTime.value.split(':')[0]);

  console.log("Selected time range:", `From ${startHour}:00 to ${endHour}:00`);

  if (!selectedDays.value.length) {
    console.log("No days selected in the filter. Please select at least one day.");
    return;
  }

  console.log("Selected days from filter:", selectedDays.value);

  const filteredWeekDays = weekDays.value.filter(day =>
      selectedDays.value.map(day => day.toLowerCase()).includes(day.label.toLowerCase())
  );

  if (!filteredWeekDays.length) {
    console.log("No matching days found in the current week based on the selected filter.");
    return;
  }

  console.log("Filtered days:", filteredWeekDays.map(day => day.label).join(", "));

  for (const day of filteredWeekDays) {
    for (let hour = startHour; hour <= endHour; hour++) {
      const datetime = Math.floor(new Date(day.date).setHours(hour, 0, 0, 0) / 1000);
      console.log("Attempting to add slot with datetime:", datetime);

      if (!slots.value.some(slot => slot.datetime === datetime)) {
        const newSlot: Slot = {
          _id: '', // Временно, сервер вернет реальный ID
          datetime,
          room: 1,
          status: 'available',
          bookedBy: null,
          massageDetails: {
            type: 'General Massage',
            duration: 60,
            price: 1000,
          },
        };

        console.log("New slot data to be sent:", JSON.stringify(newSlot, null, 2));

        try {
          const response = await fetch('http://localhost:3001/api/admin/slots', { // Исправлен URL
            method: 'POST',
            body: JSON.stringify(newSlot),
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.error(`Ошибка при создании слота: ${response.statusText}`);
            continue;
          }

          console.log("Slot created successfully:", await response.json());
        } catch (error) {
          console.error('Ошибка при создании слота:', error);
        }
      } else {
        console.log(`Slot with datetime ${datetime} already exists`);
      }
    }
  }

  await loadSlots();
};

onMounted(() => {
  loadSlots();
});

const editEvent = (event: any) => {
  console.log('Редактирование события:', event);
  // Здесь может быть вызов формы редактирования
};
const apiKey = process.env.VUE_APP_TELEGRAM_BOT_API_KEY;


// Запрос данных пользователя из Telegram API
const fetchUserInfo = async (userId: string) => {
  try {
    const data = await fetch(`https://api.telegram.org/bot${apiKey}/getChat`, {
    method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: userId }),
  }).then(res => res.json());
  console.log("data.result", data.result)
  return data.result; // Используем data.result, так как fetch уже обработал JSON
} catch (error) {
  console.error(error);
  return { first_name: 'Неизвестно', last_name: '', username: 'unknown' };
}
};

// Кэширование данных пользователя
const userCache = ref(new Map());

const getUserInfo = (userId: string) => {
  if (!userId) return null;

  if (!userCache.value.has(userId)) {
    const userInfo = ref(null);
    userCache.value.set(userId, userInfo);

    fetchUserInfo(userId).then(data => {
      userInfo.value = data;
    });
  }

  return userCache.value.get(userId)?.value;
};
</script>


<style scoped>

.time-column  {
  width: 10%
}

.day-column {
  width: 10%
}

.calendar-table {
  width: 100%;
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #444;
}

thead tr th,
tbody tr td {
  padding: 8px;
  text-align: center;
}

thead tr th {
  color: #ddd;
  background-color: #333;
  border-bottom: 1px solid #444;
}

tbody tr td {
  background-color: #2a2a2a;
  color: #ccc;
  border-bottom: 1px solid #444;
}

.v-chip {
  color: #fff;
}

.nav-btn {
  background-color: #444;
  color: #fff;
  border-radius: 24px;
  padding: 8px 16px;
  transition: background-color 0.3s;
}

.nav-btn:hover {
  background-color: #555;
}

.fill-slots-btn {
  background-color: #007bff;
  color: #fff;
  border-radius: 24px;
  padding: 8px 16px;
  transition: background-color 0.3s;
}

.fill-slots-btn:hover {
  background-color: #0056b3;
}

.day-events {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
}
</style>