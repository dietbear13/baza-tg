<template>
  <v-bottom-navigation
      grow
      app
      fixed
      bottom
  >
    <v-btn
        value="home"
        :to="{ name: 'index' }"
        icon
    >
      <v-icon>mdi-home</v-icon>
    </v-btn>
    <v-btn
        value="account"
        :to="{ name: 'account' }"
        icon
    >
      <v-icon>mdi-account</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
</script>

<style scoped>
.v-bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px; /* Задайте высоту вашего футера */
  z-index: 10;
}
</style>
