<!-- layouts/AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <AdminMenu />
    <v-main class="content-wrapper">
      <slot /> <!-- Здесь будет отображаться контент страницы -->
    </v-main>
  </div>
</template>

<script setup lang="ts">
import AdminMenu from '@/components/admin/AdminMenu.vue'; // Убедитесь, что путь корректен
import {computed} from 'vue';
import {useStore} from 'vuex';
import {key} from '@/store';

const store = useStore(key);
const isAuthenticated = computed(() => store.state.isAuthenticated);

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

.bg-deep-purple {
  background-color: #1e1e1e !important;
}

.v-navigation-drawer {
  width: 200px;
}
</style>
