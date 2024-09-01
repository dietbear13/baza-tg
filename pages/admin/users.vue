<template>
  <AdminMenu />

  <div class="admin-layout">

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
import AdminMenu from "@/components/admin/AdminMenu.vue";

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
