<template>
  <v-app>
    <v-navigation-drawer
        v-model="drawer"
        app
        permanent
        class="bg-deep-purple"
        theme="dark"
        width="220"
    >
      <v-list color="transparent">
        <v-list-item v-for="item in menuItems" :key="item.title" :to="item.route" router>
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
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

    <v-main>
      <v-container>
        <h1>Управление расписанием</h1>
        <v-tabs v-model="activeTab" grow>
          <v-tab value="0">Таблица слотов</v-tab>
          <v-tab value="1">Календарь</v-tab>
          <v-tab value="2">Статистика</v-tab>
        </v-tabs>

        <v-window v-model="activeTab" class="mt-4">
          <v-window-item value="0">
            <SlotTable />
          </v-window-item>
          <v-window-item value="1">
            <CalendarView />
          </v-window-item>
          <v-window-item value="2">
            <StatisticsView />
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import {ref} from 'vue';
import SlotTable from '../../components/admin/SlotTable.vue';
import CalendarView from '../../components/admin/CalendarView.vue';
import StatisticsView from '../../components/admin/StatisticsView.vue';

const drawer = ref(true);
const activeTab = ref(0);

const menuItems = [
  { title: 'Главная', route: '/admin/', icon: 'mdi-home' },
  { title: 'Клиенты', route: '/admin/users', icon: 'mdi-account' },
  { title: 'Расписание', route: '/admin/schedule', icon: 'mdi-calendar' },
  { title: 'Доступы', route: '/admin/access-control', icon: 'mdi-lock' },
];

const logout = () => {
  // Логика выхода
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

.mt-4 {
  margin-top: 16px;
}
</style>
