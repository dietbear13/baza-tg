<template>
  <v-navigation-drawer v-model="drawer" app permanent class="bg-deep-purple" theme="dark" width="220">
    <v-list color="transparent">
      <v-list-item v-for="item in menuItems" :key="item.title" :to="item.route" router>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
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
import {ref} from 'vue';
import {useRouter} from 'vue-router';

const drawer = ref(true);
const router = useRouter();

const menuItems = [
  { title: 'Главная', route: '/admin/' },
  { title: 'Расписание', route: '/admin/schedule' },
  { title: 'Аналитика', route: '/admin/analytics' },  // Add Analytics Page
  { title: 'Клиенты', route: '/admin/users' },
  { title: 'Доступы', route: '/admin/access-control' },
];

const logout = () => {
  router.push('/login');
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
