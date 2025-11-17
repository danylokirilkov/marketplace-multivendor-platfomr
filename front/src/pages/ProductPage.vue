<template>
  <DefaultLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="product" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div>
            <div class="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden mb-4">
              <img
                v-if="product.image_url"
                :src="product.image_url"
                :alt="product.name"
                class="w-full h-96 object-cover"
              />
              <div v-else class="w-full h-96 flex items-center justify-center text-gray-400">
                <svg class="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <h1 class="text-3xl font-bold mb-4">{{ product.name }}</h1>
            <div class="mb-4">
              <router-link
                v-if="product.shop"
                :to="`/shops/${product.shop.id}`"
                class="text-blue-600 hover:underline"
              >
                {{ product.shop.name }}
              </router-link>
            </div>
            <div class="text-4xl font-bold text-blue-600 mb-4">{{ product.price }} ₽</div>
            <p class="text-gray-600 mb-6">{{ product.description || 'Нет описания' }}</p>
            <div class="mb-6">
              <p class="text-sm text-gray-500 mb-2">
                Остаток на складе: <span class="font-semibold">{{ product.stock }}</span>
              </p>
              <Badge v-if="product.is_active" variant="success">В продаже</Badge>
              <Badge v-else variant="danger">Недоступен</Badge>
            </div>
            <div class="flex gap-4">
              <Input
                v-model.number="quantity"
                type="number"
                :min="1"
                :max="product.stock"
                class="w-24"
              />
              <Button
                :disabled="!product.is_active || product.stock === 0 || !canAddToCart"
                @click="handleAddToCart"
              >
                Добавить в корзину
              </Button>
            </div>
            <div v-if="!authStore.isAuthenticated" class="mt-4 text-sm text-gray-600">
              <router-link to="/auth/login" class="text-blue-600 hover:underline">
                Войдите
              </router-link>
              , чтобы добавить товар в корзину
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { productsApi } from '@/services/api/productsApi';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import type { Product } from '@/types/models';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import Spinner from '@/components/ui/Spinner.vue';
import Badge from '@/components/ui/Badge.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const product = ref<Product | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const quantity = ref(1);

const canAddToCart = computed(() => {
  return authStore.isBuyer || !authStore.isAuthenticated;
});

async function loadProduct() {
  loading.value = true;
  error.value = null;
  try {
    const id = Number(route.params.id);
    product.value = await productsApi.fetchProduct(id);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки товара';
  } finally {
    loading.value = false;
  }
}

function handleAddToCart() {
  if (!product.value) return;

  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }

  if (!authStore.isBuyer) {
    return;
  }

  cartStore.addItem(product.value, quantity.value);
  quantity.value = 1;
}

onMounted(() => {
  loadProduct();
});
</script>

