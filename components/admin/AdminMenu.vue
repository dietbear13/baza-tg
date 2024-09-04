<template>
  <v-navigation-drawer v-model="drawer" app permanent class="bg-deep-purple" theme="dark" :width="drawerWidth">
    <!-- Список меню -->
    <v-list color="transparent">
      <v-list-item v-for="item in menuItems" :key="item.title" :to="item.route" router>
        <v-icon>{{ item.icon }}</v-icon>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <!-- Кнопка выхода -->
    <template v-slot:append>
      <div class="pa-2">
        <v-btn block @click="logout" class="logout-button">
          <v-icon left>mdi-logout</v-icon>
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

const store = useStore(key);
const isAuthenticated = computed(() => store.state.isAuthenticated);
const userRole = computed(() => store.state.userRole);

const drawer = ref(true);
const router = useRouter();

// Динамическая ширина меню (на 30px больше контента)
const contentWidth = 190; // Ширина контента (например, 190px)
const drawerWidth = ref(contentWidth + 30); // Ширина меню на 30px шире контента

// Меню в зависимости от роли пользователя
const menuItems = computed(() => {
  const baseItems = [
    { title: 'Главная', route: '/admin/', icon: 'mdi-home' },
    { title: 'Расписание', route: '/admin/schedule', icon: 'mdi-calendar' },
    { title: 'Аналитика', route: '/admin/analytics', icon: 'mdi-chart-bar' }
  ];
  if (userRole.value === 'admin') {
    baseItems.push({ title: 'Клиенты', route: '/admin/users', icon: 'mdi-account-group' });
    baseItems.push({ title: 'Доступы', route: '/admin/access-control', icon: 'mdi-key' });
  }
  return baseItems;
});

// Логика выхода из системы
const logout = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/logout', { method: 'POST' });
    if (response.ok) {
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

.v-list-item {
  display: flex;
  align-items: center;
}

.v-list-item-icon {
  margin-right: 10px;
}

.logout-button .v-icon {
  margin-right: 10px;
}
</style>
