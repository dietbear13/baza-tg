<template>
  <v-navigation-drawer v-model="drawer" app permanent class="bg-deep-purple" theme="dark" width="220">
    <!-- Список меню -->
    <v-list color="transparent">
      <v-list-item v-for="item in menuItems" :key="item.title" :to="item.route" router>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <!-- Кнопка выхода -->
    <template v-slot:append>
      <div class="pa-2">
        <v-btn block @click="logout" class="logout-button">
          Logout
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import {computed, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useStore} from 'vuex';
import {key} from '@/store';

const drawer = ref(true);
const router = useRouter();
const store = useStore(key);

// Получение роли пользователя из Vuex
const userRole = computed(() => store.state.userRole); // Убедитесь, что в store хранится роль пользователя

// Меню в зависимости от роли пользователя
const menuItems = computed(() => {
  const baseItems = [
    {title: 'Главная', route: '/admin/'},
    {title: 'Расписание', route: '/admin/schedule'},
    {title: 'Аналитика', route: '/admin/analytics'}
  ];
  if (userRole.value === 'admin') {
    baseItems.push({title: 'Клиенты', route: '/admin/users'});
    baseItems.push({title: 'Доступы', route: '/admin/access-control'});
  }
  return baseItems;
});

// Логика выхода из системы
const logout = async () => {
  try {
    // Выполняем запрос на сервер для выхода
    const response = await fetch('http://localhost:3001/api/auth/logout', { method: 'POST' });

    if (response.ok) {
      // Обновляем состояние авторизации в Vuex
      store.commit('setAuthentication', false);
      store.commit('setUserRole', null);
      router.push('/login');
    } else {
      console.error('Ошибка при выходе из системы');
    }
  } catch (error) {
    console.error('Произошла ошибка при выходе из системы:', error);
  }
};
</script>

<style scoped>
.bg-deep-purple {
  background-color: #1e1e1e !important;
}

.logout-button {
  background-color: #66cdaa !important;
  color: #ffffff !important;
}
</style>
