<template>
  <AdminLayout>
    <div>
      <h1 class="text-3xl font-bold mb-8">Товары</h1>

      <div v-if="loading" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="products.length === 0" class="bg-white rounded-lg shadow p-12">
        <EmptyState title="Товаров пока нет" />
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
                Магазин
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Цена
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Статус
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in products" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ product.id }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ product.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ product.shop?.name || `Магазин #${product.shop_id}` }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ product.price }} ₽
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :variant="product.is_active ? 'success' : 'danger'">
                  {{ product.is_active ? 'Активен' : 'Неактивен' }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  variant="outline"
                  size="sm"
                  @click="toggleProductStatus(product)"
                >
                  {{ product.is_active ? 'Скрыть' : 'Показать' }}
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
import { productsApi } from '@/services/api/productsApi';
import type { Product, PaginatedResponse } from '@/types/models';
import AdminLayout from '@/layouts/AdminLayout.vue';
import Spinner from '@/components/ui/Spinner.vue';
import Badge from '@/components/ui/Badge.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import Pagination from '@/components/ui/Pagination.vue';
import Button from '@/components/ui/Button.vue';

const products = ref<Product[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const pagination = ref<PaginatedResponse<Product> | null>(null);

async function loadProducts() {
  loading.value = true;
  error.value = null;
  try {
    const response = await productsApi.fetchProducts({
      page: pagination.value?.current_page || 1,
      per_page: 20,
    });
    products.value = response.data;
    pagination.value = response;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки товаров';
  } finally {
    loading.value = false;
  }
}

async function toggleProductStatus(product: Product) {
  try {
    await productsApi.updateProduct(product.id, {
      is_active: !product.is_active,
    });
    await loadProducts();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка изменения статуса');
  }
}

function handlePageChange(page: number) {
  if (pagination.value) {
    pagination.value.current_page = page;
  }
  loadProducts();
}

onMounted(() => {
  loadProducts();
});
</script>

