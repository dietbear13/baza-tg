<template>
  <div class="admin-layout">
    <AdminMenu />
    <div class="content-wrapper">
      <v-main>
        <v-container>
          <router-view />
        </v-container>
      </v-main>
    </div>
  </div>
</template>

<script setup>
import AdminMenu from '../../components/admin/AdminMenu.vue';
import {useStore} from 'vuex';
import {key} from '@/store'; // Подключение ключа

const store = useStore(key); // Используем ключ для инъекции store
const isAuthenticated = computed(() => store.state.isAuthenticated);
const userRole = computed(() => store.state.userRole);

definePageMeta({
  middleware: 'auth'
});



</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
}

.content-wrapper {
  flex-grow: 1;
  padding: 20px;
}
</style>
