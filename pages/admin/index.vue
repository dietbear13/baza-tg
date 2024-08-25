<!-- pages/admin/index.vue -->
<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Добро пожаловать в админ панель!</h1>
        <p>Здесь вы можете управлять приложением.</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  title: 'Главная - Админ Панель',
});
</script>

<style scoped>
/* Стили, специфичные для этой страницы */
</style>
