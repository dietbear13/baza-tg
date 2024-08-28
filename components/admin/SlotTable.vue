<template>
  <v-container fluid>
    <h2>Календарь на неделю</h2>

    <!-- Фильтры для выбора диапазона времени и дней недели -->
    <v-row>
      <v-col cols="12" md="6">
        <v-select
            v-model="selectedDays"
            :items="daysOptions"
            multiple
            label="Выберите дни недели"
            outlined
            dense
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
    </v-row>

    <!-- Кнопка для заполнения слотов -->
    <v-row class="mt-4">
      <v-col>
        <v-btn @click="fillSlots" class="fill-slots-btn">Заполнить базу данных слотами</v-btn>
      </v-col>
    </v-row>

    <!-- Таблица календаря -->
    <v-data-table
        class="calendar-table"
        :headers="headers"
        :items="timeSlots"
        :items-per-page="14"
        hide-default-footer
        fixed-header
    >
      <template v-slot:top>
        <thead>
        <tr>
          <th class="time-column">Время</th>
          <th v-for="day in weekDays" :key="day.dateFormatted" class="day-column">
            {{ day.label }},<br>{{ day.dateFormatted }}
          </th>
        </tr>
        </thead>
      </template>

      <template v-slot:default="{ items }">
        <tbody>
        <tr v-for="timeSlot in items" :key="timeSlot">
          <td class="time-column">{{ timeSlot }}</td>
          <td v-for="day in weekDays" :key="day.dateFormatted" class="day-column">
            <div class="day-events">
              <span v-if="day.events.length === 0"></span>
              <span v-else>
                <!-- Внутри <v-menu> -->
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
                    <!-- Условие: Если слот забронирован (status === 'booked'), показываем информацию о пользователе -->
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
                    </template>

                    <!-- Кнопки, которые всегда отображаются -->
                    <v-list-item @click="editEvent(event)">
                      <v-list-item-title>Редактировать</v-list-item-title>
                    </v-list-item>
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

<script setup>
import {computed, onMounted, ref} from 'vue';
import {addDays, format, fromUnixTime, setHours, setMinutes, setSeconds, startOfWeek} from 'date-fns';
import {ru} from 'date-fns/locale';

const selectedDate = ref(startOfWeek(new Date(), {weekStartsOn: 1}));
const slots = ref([]);
const selectedDays = ref(['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']);
const startTime = ref('08:00');
const endTime = ref('22:00');

const loadSlots = async () => {
  try {
    const data = await $fetch('http://localhost:3001/api/slots');
    slots.value = data;
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
};

onMounted(() => {
  loadSlots();
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
  const startHour = parseInt(startTime.value.split(':')[0]);
  const endHour = parseInt(endTime.value.split(':')[0]);

  const filteredWeekDays = weekDays.value.filter(day => selectedDays.value.includes(day.label));

  for (const day of filteredWeekDays) {
    for (let hour = startHour; hour <= endHour; hour++) {
      const datetime = Math.floor(new Date(day.date).setHours(hour, 0, 0, 0) / 1000);

      if (!slots.value.some(slot => slot.datetime === datetime)) {
        const newSlot = {
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

        try {
          await $fetch('http://localhost:3001/api/slots', {
            method: 'POST',
            body: JSON.stringify(newSlot),
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error('Ошибка при создании слота:', error);
        }
      }
    }
  }

  await loadSlots();
};

const editEvent = (event) => {
  console.log('Редактирование события:', event);
  // Здесь может быть вызов формы редактирования
};

const deleteEvent = async (event) => {
  console.log('Удаление события:', event);
  // Здесь должен быть код для удаления события из базы данных
  try {
    await $fetch(`http://localhost:3001/api/slots/${event._id}`, {
      method: 'DELETE',
    });
    loadSlots();
  } catch (error) {
    console.error('Ошибка при удалении слота:', error);
  }
};

// Запрос данных пользователя из Telegram API
const fetchUserInfo = async (userId) => {
  try {
    const data = await $fetch(`https://api.telegram.org/bot***/getChat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: userId }),
    });
    console.log("data.result", data.result)
    return data.result; // Используем data.result, так как $fetch уже обработал JSON
  } catch (error) {
    console.error(error);
    return { first_name: 'Неизвестно', last_name: '', username: 'unknown' };
  }
};

// Кэширование данных пользователя
// Кэширование данных пользователя
const userCache = ref(new Map());

const getUserInfo = (userId) => {
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

.time-column {
  width: 12.5%
}

.day-column {
  width: 12.5%
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
