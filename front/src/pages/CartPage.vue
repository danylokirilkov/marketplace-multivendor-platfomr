<template>
  <DefaultLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold mb-8">Корзина</h1>

      <div v-if="cartStore.items.length === 0" class="bg-white rounded-lg shadow p-12">
        <EmptyState
          title="Корзина пуста"
          description="Добавьте товары из каталога"
        >
          <template #action>
            <router-link to="/">
              <Button>Перейти в каталог</Button>
            </router-link>
          </template>
        </EmptyState>
      </div>

      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Товар
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цена
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Количество
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in cartStore.items" :key="item.product.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-16 w-16 bg-gray-200 rounded overflow-hidden mr-4">
                    <img
                      v-if="item.product.image_url"
                      :src="item.product.image_url"
                      :alt="item.product.name"
                      class="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <router-link
                      :to="`/products/${item.product.id}`"
                      class="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {{ item.product.name }}
                    </router-link>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.product.price }} ₽
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="cartStore.updateQuantity(item.product.id, item.quantity - 1)"
                  >
                    -
                  </Button>
                  <span class="w-12 text-center">{{ item.quantity }}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    @click="cartStore.updateQuantity(item.product.id, item.quantity + 1)"
                  >
                    +
                  </Button>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ item.product.price * item.quantity }} ₽
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button variant="danger" size="sm" @click="cartStore.removeItem(item.product.id)">
                  Удалить
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div class="text-lg font-semibold">Итого: {{ cartStore.totalAmount }} ₽</div>
          <router-link to="/checkout">
            <Button>Оформить заказ</Button>
          </router-link>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Button from '@/components/ui/Button.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

const cartStore = useCartStore();
</script>

