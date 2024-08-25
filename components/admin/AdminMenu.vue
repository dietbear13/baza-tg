<template>
  <v-navigation-drawer
      v-model="drawer"
      app
      temporary
      class="bg-deep-purple"
      theme="dark"
  >
    <v-list color="transparent">
      <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.route"
          router
      >
        <template v-slot:prepend>
          <v-icon>{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn block @click="logout">
          Logout
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const drawer = ref(false); // Управление состоянием меню
const router = useRouter();

// Элементы меню
const menuItems = [
  { title: 'Пользователи', route: '/admin/users', icon: 'mdi-account' },
  { title: 'Расписание', route: '/admin/schedule', icon: 'mdi-calendar' },
  { title: 'Управление доступом', route: '/admin/access-control', icon: 'mdi-lock' },
];

// Функция для выхода из системы
const logout = () => {
  // Здесь логика для выхода из системы, например, очистка токенов, перенаправление на страницу логина
  router.push('/login');
};
</script>

<style scoped>
.bg-deep-purple {
  background-color: #673ab7 !important;
}
.v-navigation-drawer {
  width: 260px;
}
</style>
