<template>
  <DefaultLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold mb-8">Оформление заказа</h1>

      <div v-if="cartStore.items.length === 0" class="bg-white rounded-lg shadow p-12">
        <EmptyState title="Корзина пуста" description="Добавьте товары в корзину">
          <template #action>
            <router-link to="/">
              <Button>Перейти в каталог</Button>
            </router-link>
          </template>
        </EmptyState>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Состав заказа</h2>
            <div class="space-y-4">
              <div
                v-for="item in cartStore.items"
                :key="item.product.id"
                class="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <p class="font-medium">{{ item.product.name }}</p>
                  <p class="text-sm text-gray-500">
                    {{ item.product.price }} ₽ × {{ item.quantity }}
                  </p>
                </div>
                <p class="font-semibold">{{ item.product.price * item.quantity }} ₽</p>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 class="text-xl font-semibold mb-4">Итого</h2>
            <div class="space-y-2 mb-4">
              <div class="flex justify-between">
                <span>Товары:</span>
                <span>{{ cartStore.totalAmount }} ₽</span>
              </div>
              <div class="flex justify-between text-sm text-gray-500">
                <span>Комиссия маркетплейса ({{ commissionPercent }}%):</span>
                <span>{{ commissionAmount }} ₽</span>
              </div>
              <div class="border-t pt-2 flex justify-between font-bold text-lg">
                <span>К оплате:</span>
                <span>{{ totalWithCommission }} ₽</span>
              </div>
            </div>

            <div v-if="error" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-red-800 text-sm">{{ error }}</p>
            </div>

            <Button :loading="loading" class="w-full" @click="handleCreateOrder">
              Оформить заказ
            </Button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { ordersApi } from '@/services/api/ordersApi';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Button from '@/components/ui/Button.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

const router = useRouter();
const cartStore = useCartStore();

const loading = ref(false);
const error = ref('');

// Комиссия маркетплейса (можно вынести в конфиг или получать с бэкенда)
const commissionPercent = 10;

const commissionAmount = computed(() => {
  return Math.round((cartStore.totalAmount * commissionPercent) / 100);
});

const totalWithCommission = computed(() => {
  return cartStore.totalAmount + commissionAmount.value;
});

async function handleCreateOrder() {
  if (cartStore.items.length === 0) return;

  loading.value = true;
  error.value = '';

  try {
    const payload = {
      items: cartStore.items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    const order = await ordersApi.createOrder(payload);
    cartStore.clearCart();
    router.push({ name: 'buyer-order-detail', params: { id: order.id } });
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка создания заказа. Попробуйте снова.';
  } finally {
    loading.value = false;
  }
}
</script>

