<template>
  <div class="admin-layout">
    <v-navigation-drawer
        v-model="drawer"
        app
        permanent
        class="bg-deep-purple"
        theme="dark"
        width="220"
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

    <div class="content-wrapper">
      <v-main>
        <v-container>
          <h1>Управление пользователями</h1>
          <!-- Здесь будет логика для управления пользователями -->
        </v-container>
      </v-main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {useRouter} from 'vue-router';

const drawer = ref(true);
const router = useRouter();

const menuItems = [
  { title: 'Главная', route: '/admin/', icon: 'mdi-home' },
  { title: 'Клиенты', route: '/admin/users', icon: 'mdi-account' },
  { title: 'Расписание', route: '/admin/schedule', icon: 'mdi-calendar' },
  { title: 'Доступы', route: '/admin/access-control', icon: 'mdi-lock' },
];

const logout = () => {
  router.push('/login');
};

definePageMeta({
  middleware: 'auth'
});
</script>

<style scoped>
.bg-deep-purple {
  background-color: #1e1e1e !important;
}

.admin-layout {
  display: flex;
  height: 100vh;
}

.content-wrapper {
  flex-grow: 1;
  padding: 20px;
}

.v-navigation-drawer {
  width: 260px;
}
</style>
