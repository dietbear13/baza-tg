<template>
  <v-app>
    <!-- Подключаем AdminMenu для консистентного отображения меню -->
    <AdminMenu />
    <v-main>
      <v-container>
        <h1>Управление расписанием</h1>
        <SlotTable />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import AdminMenu from '~/components/admin/AdminMenu.vue';
import SlotTable from '~/components/admin/SlotTable.vue';

definePageMeta({
  middleware: 'auth'
});
</script>
