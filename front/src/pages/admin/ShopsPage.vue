<template>
  <AdminLayout>
    <div>
      <h1 class="text-3xl font-bold mb-8">Магазины</h1>

      <div v-if="loading" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="shops.length === 0" class="bg-white rounded-lg shadow p-12">
        <EmptyState title="Магазинов пока нет" />
      </div>

      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Название
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Владелец
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Статус
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Дата создания
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="shop in shops" :key="shop.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ shop.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ shop.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ shop.owner_id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :variant="shop.is_active ? 'success' : 'danger'">
                  {{ shop.is_active ? 'Активен' : 'Заблокирован' }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(shop.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  variant="outline"
                  size="sm"
                  @click="toggleShopStatus(shop)"
                >
                  {{ shop.is_active ? 'Заблокировать' : 'Разблокировать' }}
                </Button>
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
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { shopsApi } from '@/services/api/shopsApi';
import type { Shop, PaginatedResponse } from '@/types/models';
import AdminLayout from '@/layouts/AdminLayout.vue';
import Spinner from '@/components/ui/Spinner.vue';
import Badge from '@/components/ui/Badge.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import Pagination from '@/components/ui/Pagination.vue';
import Button from '@/components/ui/Button.vue';

const shops = ref<Shop[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const pagination = ref<PaginatedResponse<Shop> | null>(null);

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU');
}

async function loadShops() {
  loading.value = true;
  error.value = null;
  try {
    const response = await shopsApi.fetchShops({
      page: pagination.value?.current_page || 1,
      per_page: 20,
    });
    shops.value = response.data;
    pagination.value = response;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки магазинов';
  } finally {
    loading.value = false;
  }
}

async function toggleShopStatus(shop: Shop) {
  try {
    await shopsApi.toggleShopStatus(shop.id, !shop.is_active);
    await loadShops();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка изменения статуса');
  }
}

function handlePageChange(page: number) {
  if (pagination.value) {
    pagination.value.current_page = page;
  }
  loadShops();
}

onMounted(() => {
  loadShops();
});
</script>

