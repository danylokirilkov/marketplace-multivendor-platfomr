<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold text-blue-600">Маркетплейс</router-link>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-700">{{ authStore.user?.name }}</span>
            <Button variant="outline" size="sm" @click="handleLogout">Выйти</Button>
          </div>
        </div>
      </div>
    </header>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <aside class="w-64 flex-shrink-0">
          <nav class="bg-white rounded-lg shadow p-4">
            <ul class="space-y-2">
              <li>
                <router-link
                  to="/seller/shop"
                  class="block px-4 py-2 rounded-lg hover:bg-gray-100"
                  active-class="bg-blue-50 text-blue-600"
                >
                  Мой магазин
                </router-link>
              </li>
              <li>
                <router-link
                  to="/seller/products"
                  class="block px-4 py-2 rounded-lg hover:bg-gray-100"
                  active-class="bg-blue-50 text-blue-600"
                >
                  Товары
                </router-link>
              </li>
              <li>
                <router-link
                  to="/seller/orders"
                  class="block px-4 py-2 rounded-lg hover:bg-gray-100"
                  active-class="bg-blue-50 text-blue-600"
                >
                  Заказы
                </router-link>
              </li>
              <li>
                <router-link
                  to="/seller/finance"
                  class="block px-4 py-2 rounded-lg hover:bg-gray-100"
                  active-class="bg-blue-50 text-blue-600"
                >
                  Финансы
                </router-link>
              </li>
              <li>
                <router-link
                  to="/seller/reports"
                  class="block px-4 py-2 rounded-lg hover:bg-gray-100"
                  active-class="bg-blue-50 text-blue-600"
                >
                  Отчёты
                </router-link>
              </li>
            </ul>
          </nav>
        </aside>
        <main class="flex-1">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Button from '@/components/ui/Button.vue';

const router = useRouter();
const authStore = useAuthStore();

async function handleLogout() {
  await authStore.logout();
  router.push('/');
}
</script>

