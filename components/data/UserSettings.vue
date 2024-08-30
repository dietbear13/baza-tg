<template>
  <v-dialog v-model="localDialog" max-width="500">
    <v-card>
      <v-card-title>Настройки</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-switch
                v-model="notificationsEnabled"
                label="Уведомления включены"
                class="mb-4"
            ></v-switch>
            <v-select
                v-model="notificationTime"
                :items="notificationOptions"
                label="Уведомления за (часов до массажа)"
                outlined
                :disabled="!notificationsEnabled"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="saveSettings">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {inject, ref, watch} from 'vue';

interface TelegramUserData {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
  };
  settings: {
    notifications: {
      enabled: boolean;
      hoursBefore: number;
    };
  };
}

// Получаем данные через inject
const injectedUserData = inject<{ value: TelegramUserData | null }>('userData');
const userData = ref(injectedUserData?.value || null);

const notificationTime = ref<number | null>(null);
const notificationOptions = ref<number[]>([1, 2, 3, 4, 5, 6, 12]);
const notificationsEnabled = ref<boolean>(true);

// Получаем значение settingsDialog из родительского компонента
const props = defineProps<{ settingsDialog: boolean }>();
const emit = defineEmits<{ (e: 'update:settingsDialog', value: boolean): void }>();

// Локальная переменная для управления диалогом
const localDialog = ref(props.settingsDialog);

// Наблюдение за изменением props.settingsDialog и синхронизация с localDialog
watch(
    () => props.settingsDialog,
    (newValue) => {
      localDialog.value = newValue;
      if (newValue) {
        loadUserSettings(); // Загружаем настройки при открытии диалога
      }
    }
);

// Закрытие диалога и синхронизация с родителем
watch(localDialog, (newValue) => {
  emit('update:settingsDialog', newValue);
});

const saveSettings = async () => {
  try {
    const response = await fetch(`http://localhost:3001/api/users/${userData.value?.user.id}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notifications: {
          enabled: notificationsEnabled.value,
          hoursBefore: notificationTime.value,
        },
      }),
    });

    if (response.ok) {
      console.log('Настройки успешно сохранены');
      localDialog.value = false; // Закрываем диалог после сохранения
    } else {
      console.error('Ошибка сохранения настроек');
    }
  } catch (error) {
    console.error('Ошибка при сохранении настроек:', error);
  }
};

const loadUserSettings = async () => {
  try {
    const response = await fetch(`http://localhost:3001/api/users/${userData.value?.user.id}`);
    const data = await response.json();
    notificationsEnabled.value = data.settings.notifications.enabled;
    notificationTime.value = data.settings.notifications.hoursBefore;
  } catch (error) {
    console.error('Ошибка загрузки настроек пользователя:', error);
  }
};
</script>
