<template>
  <SellerLayout>
    <div>
      <div class="mb-6">
        <router-link to="/seller/orders" class="text-blue-600 hover:underline">
          ← Назад к заказам
        </router-link>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="order" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold">Заказ #{{ order.id }}</h1>
            <Badge :variant="getStatusVariant(order.status)">
              {{ getStatusLabel(order.status) }}
            </Badge>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span class="text-gray-500">Дата создания:</span>
              <span class="ml-2 font-medium">{{ formatDate(order.created_at) }}</span>
            </div>
            <div v-if="order.buyer">
              <span class="text-gray-500">Покупатель:</span>
              <span class="ml-2 font-medium">{{ order.buyer.name || order.buyer.email }}</span>
            </div>
          </div>

          <div v-if="canChangeStatus" class="mt-4 pt-4 border-t">
            <label class="block text-sm font-medium text-gray-700 mb-2">Изменить статус:</label>
            <div class="flex gap-2">
              <Select v-model="newStatus" :options="availableStatusOptions" />
              <Button :loading="updating" @click="handleStatusUpdate"> Обновить </Button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Состав заказа</h2>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Товар
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Цена
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Количество
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Сумма
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in order.items" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ item.product?.name || `Товар #${item.product_id}` }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.price }} ₽
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ item.price * item.quantity }} ₽
                </td>
              </tr>
            </tbody>
          </table>
          <div class="mt-4 pt-4 border-t flex justify-end">
            <div class="text-right">
              <div class="text-sm text-gray-500 mb-1">Итого:</div>
              <div class="text-2xl font-bold">{{ order.total_amount }} ₽</div>
              <div v-if="order.marketplace_commission" class="text-sm text-gray-500 mt-1">
                Комиссия маркетплейса: {{ order.marketplace_commission }} ₽
              </div>
              <div v-if="order.seller_amount" class="text-sm text-green-600 mt-1">
                К получению: {{ order.seller_amount }} ₽
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SellerLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ordersApi } from '@/services/api/ordersApi';
import type { Order, OrderStatus } from '@/types/models';
import SellerLayout from '@/layouts/SellerLayout.vue';
import Spinner from '@/components/ui/Spinner.vue';
import Badge from '@/components/ui/Badge.vue';
import Select from '@/components/ui/Select.vue';
import Button from '@/components/ui/Button.vue';

const route = useRoute();

const order = ref<Order | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const updating = ref(false);
const newStatus = ref<string>('');

function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    new: 'Новый',
    paid: 'Оплачен',
    sent: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  };
  return labels[status];
}

function getStatusVariant(status: OrderStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<OrderStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    new: 'info',
    paid: 'success',
    sent: 'warning',
    delivered: 'success',
    cancelled: 'danger',
  };
  return variants[status];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const canChangeStatus = computed(() => {
  if (!order.value) return false;
  return order.value.status !== 'delivered' && order.value.status !== 'cancelled';
});

const availableStatusOptions = computed(() => {
  if (!order.value) return [];
  const status = order.value.status;
  const options: Array<{ value: string; label: string }> = [];

  if (status === 'new') {
    options.push({ value: 'paid', label: 'Оплачен' });
  }
  if (status === 'paid') {
    options.push({ value: 'sent', label: 'Отправлен' });
  }
  if (status === 'sent') {
    options.push({ value: 'delivered', label: 'Доставлен' });
  }

  return options;
});

async function loadOrder() {
  loading.value = true;
  error.value = null;
  try {
    const id = Number(route.params.id);
    order.value = await ordersApi.fetchOrder(id);
    newStatus.value = '';
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки заказа';
  } finally {
    loading.value = false;
  }
}

async function handleStatusUpdate() {
  if (!order.value || !newStatus.value) return;

  updating.value = true;
  try {
    order.value = await ordersApi.updateOrder(order.value.id, {
      status: newStatus.value as OrderStatus,
    });
    newStatus.value = '';
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка обновления статуса');
  } finally {
    updating.value = false;
  }
}

onMounted(() => {
  loadOrder();
});
</script>

