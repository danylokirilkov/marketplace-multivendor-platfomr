<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold text-blue-600">Маркетплейс</router-link>
          </div>
          <div class="flex items-center gap-4">
            <router-link to="/cart" class="relative text-gray-700 hover:text-blue-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span
                v-if="cartStore.totalItems > 0"
                class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              >
                {{ cartStore.totalItems }}
              </span>
            </router-link>
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
                  to="/buyer/orders"
                  class="block px-4 py-2 rounded-lg hover:bg-gray-100"
                  active-class="bg-blue-50 text-blue-600"
                >
                  Мои заказы
                </router-link>
              </li>
              <li>
                <router-link
                  to="/"
                  class="block px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  Каталог
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
import { useCartStore } from '@/stores/cart';
import Button from '@/components/ui/Button.vue';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

async function handleLogout() {
  await authStore.logout();
  router.push('/');
}
</script>

