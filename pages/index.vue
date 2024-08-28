<!-- /pages/index.vue -->
<template>
  <div>
    <Calendar />
  </div>
</template>

<script lang="ts" setup>
import Calendar from '../components/data/Calendar.vue'

useHead({
  title: 'TODO SEO',
  meta: [
    { name: 'description', content: 'My amazing site.' }
  ],
  bodyAttrs: {
    class: 'test'
  },
  script: [ { innerHTML: 'console.log(\'Hello world\')' } ]
})

</script>

<style scoped>
/* Добавьте стили, если необходимо */
</style>
