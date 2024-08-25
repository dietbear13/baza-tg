<template>
  <v-app>
    <v-navigation-drawer
        v-model="drawer"
        app
        permanent
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

    <v-main>
      <nuxt-page />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {useRouter} from 'vue-router';

const drawer = ref(true);
const router = useRouter();

const menuItems = [
  { title: 'Клиенты', route: '/admin/users', icon: 'mdi-account' },
  { title: 'Расписание', route: '/admin/schedule', icon: 'mdi-calendar' },
  { title: 'Доступы', route: '/admin/access-control', icon: 'mdi-lock' },
];

const logout = () => {
  router.push('/login');
};

// Применение middleware для проверки авторизации
// definePageMeta({
//   layout: 'admin',
//   middleware: 'auth'
// });
</script>

<style scoped>
.bg-deep-purple {
  background-color: #673ab7 !important;
}
.v-navigation-drawer {
  width: 260px;
}
.v-main {
  margin-left: 260px;
}
</style>
