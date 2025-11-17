<template>
  <DefaultLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="shop">
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h1 class="text-3xl font-bold mb-2">{{ shop.name }}</h1>
              <Badge v-if="shop.is_active" variant="success">Активен</Badge>
              <Badge v-else variant="danger">Заблокирован</Badge>
            </div>
          </div>
          <p v-if="shop.description" class="text-gray-600 mb-4">{{ shop.description }}</p>
          <p v-if="!shop.is_active" class="text-red-600 font-semibold">
            Магазин заблокирован. Покупка товаров недоступна.
          </p>
        </div>

        <h2 class="text-2xl font-bold mb-6">Товары магазина</h2>

        <div v-if="productsLoading" class="flex justify-center py-12">
          <Spinner size="lg" />
        </div>

        <div v-else-if="products.length === 0" class="bg-white rounded-lg shadow p-12">
          <EmptyState title="Товары не найдены" description="В этом магазине пока нет товаров" />
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
              <p class="text-2xl font-bold text-blue-600">{{ product.price }} ₽</p>
              <p class="text-sm text-gray-500 mt-2">Остаток: {{ product.stock }}</p>
            </div>
          </div>
        </div>

        <Pagination
          v-if="productsPagination"
          :current-page="productsPagination.current_page"
          :total-pages="productsPagination.last_page"
          :total="productsPagination.total"
          :per-page="productsPagination.per_page"
          @update:currentPage="handlePageChange"
        />
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { shopsApi } from '@/services/api/shopsApi';
import { productsApi } from '@/services/api/productsApi';
import type { Shop, Product, PaginatedResponse } from '@/types/models';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Spinner from '@/components/ui/Spinner.vue';
import Badge from '@/components/ui/Badge.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import Pagination from '@/components/ui/Pagination.vue';

const route = useRoute();

const shop = ref<Shop | null>(null);
const products = ref<Product[]>([]);
const loading = ref(false);
const productsLoading = ref(false);
const error = ref<string | null>(null);
const productsPagination = ref<PaginatedResponse<Product> | null>(null);

const currentPage = ref(1);

async function loadShop() {
  loading.value = true;
  error.value = null;
  try {
    const id = Number(route.params.id);
    shop.value = await shopsApi.fetchShop(id);
    loadProducts();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки магазина';
  } finally {
    loading.value = false;
  }
}

async function loadProducts() {
  if (!shop.value) return;

  productsLoading.value = true;
  try {
    const response = await productsApi.fetchProducts({
      shop_id: shop.value.id,
      page: currentPage.value,
      per_page: 12,
      is_active: true,
    });
    products.value = response.data;
    productsPagination.value = response;
  } catch (err: any) {
    console.error('Ошибка загрузки товаров:', err);
  } finally {
    productsLoading.value = false;
  }
}

function handlePageChange(page: number) {
  currentPage.value = page;
  loadProducts();
}

onMounted(() => {
  loadShop();
});
</script>

