<template>
  <DefaultLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold mb-8">Каталог товаров</h1>

      <!-- Фильтры -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            v-model="filters.search"
            placeholder="Поиск по названию"
            @update:modelValue="loadProducts"
          />
          <Input
            v-model.number="filters.min_price"
            type="number"
            placeholder="Мин. цена"
            @update:modelValue="loadProducts"
          />
          <Input
            v-model.number="filters.max_price"
            type="number"
            placeholder="Макс. цена"
            @update:modelValue="loadProducts"
          />
          <Select
            v-model="filters.shop_id"
            :options="shopOptions"
            placeholder="Все магазины"
            @update:modelValue="loadProducts"
          />
        </div>
      </div>

      <!-- Список товаров -->
      <div v-if="loading" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="products.length === 0" class="bg-white rounded-lg shadow p-12">
        <EmptyState title="Товары не найдены" description="Попробуйте изменить параметры поиска" />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        <div
          v-for="product in products"
          :key="product.id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
          @click="$router.push(`/products/${product.id}`)"
        >
          <div class="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg overflow-hidden">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="w-full h-48 object-cover"
            />
            <div v-else class="w-full h-48 flex items-center justify-center text-gray-400">
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-lg mb-2">{{ product.name }}</h3>
            <p class="text-gray-600 text-sm mb-2 line-clamp-2">{{ product.description }}</p>
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold text-blue-600">{{ product.price }} ₽</span>
              <Badge v-if="product.shop" variant="info">{{ product.shop.name }}</Badge>
            </div>
            <p class="text-sm text-gray-500 mt-2">Остаток: {{ product.stock }}</p>
          </div>
        </div>
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
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { productsApi } from '@/services/api/productsApi';
import { shopsApi } from '@/services/api/shopsApi';
import type { Product, Shop, ProductListParams, PaginatedResponse } from '@/types/models';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Spinner from '@/components/ui/Spinner.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import Badge from '@/components/ui/Badge.vue';
import Pagination from '@/components/ui/Pagination.vue';

const products = ref<Product[]>([]);
const shops = ref<Shop[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const pagination = ref<PaginatedResponse<Product> | null>(null);

const filters = ref<ProductListParams>({
  page: 1,
  per_page: 12,
  search: '',
  min_price: undefined,
  max_price: undefined,
  shop_id: undefined,
  is_active: true,
});

const shopOptions = ref<Array<{ value: string | number; label: string }>>([
  { value: '', label: 'Все магазины' },
]);

async function loadShops() {
  try {
    const response = await shopsApi.fetchShops({ per_page: 100 });
    shops.value = response.data;
    shopOptions.value = [
      { value: '', label: 'Все магазины' },
      ...response.data.map((shop) => ({ value: shop.id, label: shop.name })),
    ];
  } catch (err) {
    console.error('Ошибка загрузки магазинов:', err);
  }
}

async function loadProducts() {
  loading.value = true;
  error.value = null;
  try {
    const params: ProductListParams = {
      ...filters.value,
      shop_id: filters.value.shop_id ? Number(filters.value.shop_id) : undefined,
    };
    const response = await productsApi.fetchProducts(params);
    products.value = response.data;
    pagination.value = response;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки товаров';
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page: number) {
  filters.value.page = page;
  loadProducts();
}

onMounted(() => {
  loadShops();
  loadProducts();
});
</script>

