<template>
  <SellerLayout>
    <div>
      <h1 class="text-3xl font-bold mb-8">Заказы</h1>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <Select
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="Все статусы"
          @update:modelValue="loadOrders"
        />
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="orders.length === 0" class="bg-white rounded-lg shadow p-12">
        <EmptyState title="Заказов пока нет" description="Заказы будут отображаться здесь" />
      </div>

      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                № заказа
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Покупатель
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Статус
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Сумма
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Дата
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in orders" :key="order.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{{ order.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ order.buyer?.name || order.buyer?.email || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :variant="getStatusVariant(order.status)">
                  {{ getStatusLabel(order.status) }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ order.total_amount }} ₽
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(order.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <router-link
                  :to="{ name: 'seller-order-detail', params: { id: order.id } }"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Подробнее
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination
        v-if="pagination"
        :current-page="pagination.current_page"
        :total-pages="pagination.last_page"
        :total="pagination.total"
        :per-page="pagination.per_page"
        @update:currentPage="handlePageChange"
      />
    </div>
  </SellerLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ordersApi } from '@/services/api/ordersApi';
import { useShopStore } from '@/stores/shop';
import type { Order, OrderStatus, PaginatedResponse } from '@/types/models';
import SellerLayout from '@/layouts/SellerLayout.vue';
import Select from '@/components/ui/Select.vue';
import Spinner from '@/components/ui/Spinner.vue';
import Badge from '@/components/ui/Badge.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import Pagination from '@/components/ui/Pagination.vue';

const shopStore = useShopStore();

const orders = ref<Order[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const pagination = ref<PaginatedResponse<Order> | null>(null);
const statusFilter = ref<string>('');

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'new', label: 'Новый' },
  { value: 'paid', label: 'Оплачен' },
  { value: 'sent', label: 'Отправлен' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' },
];

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
  return new Date(dateString).toLocaleDateString('ru-RU');
}

async function loadOrders() {
  if (!shopStore.myShop) return;

  loading.value = true;
  error.value = null;
  try {
    const params = {
      shop_id: shopStore.myShop.id,
      page: pagination.value?.current_page || 1,
      per_page: 10,
      status: statusFilter.value || undefined,
    };
    const response = await ordersApi.fetchOrders(params);
    orders.value = response.data;
    pagination.value = response;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки заказов';
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page: number) {
  if (pagination.value) {
    pagination.value.current_page = page;
  }
  loadOrders();
}

onMounted(async () => {
  if (!shopStore.myShop) {
    await shopStore.fetchMyShop();
  }
  loadOrders();
});
</script>

