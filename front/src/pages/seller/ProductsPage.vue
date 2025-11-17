<template>
  <SellerLayout>
    <div>
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold">Товары</h1>
        <Button
          :disabled="!canCreateProduct"
          @click="showCreateModal = true"
        >
          Добавить товар
        </Button>
      </div>

      <div v-if="!canCreateProduct" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-yellow-800">
          Ваш магазин заблокирован. Вы не можете создавать товары.
        </p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="products.length === 0" class="bg-white rounded-lg shadow p-12">
        <EmptyState title="Товаров пока нет" description="Добавьте первый товар в ваш магазин">
          <template #action>
            <Button :disabled="!canCreateProduct" @click="showCreateModal = true">
              Добавить товар
            </Button>
          </template>
        </EmptyState>
      </div>

      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Название
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Цена
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Остаток
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
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                <div class="text-sm text-gray-500 line-clamp-1">{{ product.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ product.price }} ₽
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ product.stock }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :variant="product.is_active ? 'success' : 'danger'">
                  {{ product.is_active ? 'Активен' : 'Неактивен' }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" @click="editProduct(product)">
                    Редактировать
                  </Button>
                  <Button variant="danger" size="sm" @click="deleteProduct(product.id)">
                    Удалить
                  </Button>
                </div>
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

      <!-- Модалка создания/редактирования -->
      <Modal v-model="showCreateModal" :title="editingProduct ? 'Редактировать товар' : 'Добавить товар'">
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <Input
              v-model="form.name"
              label="Название"
              placeholder="Название товара"
              required
              :error="errors.name"
            />
            <Textarea
              v-model="form.description"
              label="Описание"
              placeholder="Описание товара"
              :error="errors.description"
            />
            <Input
              v-model.number="form.price"
              type="number"
              label="Цена"
              placeholder="0"
              required
              :error="errors.price"
            />
            <Input
              v-model.number="form.stock"
              type="number"
              label="Остаток"
              placeholder="0"
              required
              :error="errors.stock"
            />
            <div class="flex items-center">
              <input
                v-model="form.is_active"
                type="checkbox"
                id="is_active"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="is_active" class="ml-2 block text-sm text-gray-900"> Активен </label>
            </div>
          </div>
          <div v-if="submitError" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 text-sm">{{ submitError }}</p>
          </div>
          <template #footer>
            <Button type="button" variant="outline" @click="closeModal"> Отмена </Button>
            <Button type="submit" :loading="submitting"> Сохранить </Button>
          </template>
        </form>
      </Modal>
    </div>
  </SellerLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { productsApi } from '@/services/api/productsApi';
import { useShopStore } from '@/stores/shop';
import type { Product, PaginatedResponse } from '@/types/models';
import SellerLayout from '@/layouts/SellerLayout.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Spinner from '@/components/ui/Spinner.vue';
import Badge from '@/components/ui/Badge.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import Pagination from '@/components/ui/Pagination.vue';
import Modal from '@/components/ui/Modal.vue';

const shopStore = useShopStore();

const products = ref<Product[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const pagination = ref<PaginatedResponse<Product> | null>(null);
const showCreateModal = ref(false);
const editingProduct = ref<Product | null>(null);
const submitting = ref(false);
const submitError = ref('');

const canCreateProduct = computed(() => {
  return shopStore.myShop?.is_active === true;
});

const form = reactive({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  is_active: true,
});

const errors = reactive({
  name: '',
  description: '',
  price: '',
  stock: '',
});

function validate() {
  let valid = true;
  errors.name = '';
  errors.price = '';
  errors.stock = '';

  if (!form.name) {
    errors.name = 'Название обязательно';
    valid = false;
  }

  if (!form.price || form.price <= 0) {
    errors.price = 'Цена должна быть больше 0';
    valid = false;
  }

  if (form.stock < 0) {
    errors.stock = 'Остаток не может быть отрицательным';
    valid = false;
  }

  return valid;
}

async function loadProducts() {
  if (!shopStore.myShop) return;

  loading.value = true;
  error.value = null;
  try {
    const response = await productsApi.fetchProducts({
      shop_id: shopStore.myShop.id,
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

async function handleSubmit() {
  if (!validate()) return;

  submitting.value = true;
  submitError.value = '';

  try {
    if (editingProduct.value) {
      await productsApi.updateProduct(editingProduct.value.id, form);
    } else {
      await productsApi.createProduct(form);
    }
    closeModal();
    loadProducts();
  } catch (err: any) {
    submitError.value = err.response?.data?.message || 'Ошибка сохранения товара';
  } finally {
    submitting.value = false;
  }
}

function editProduct(product: Product) {
  editingProduct.value = product;
  form.name = product.name;
  form.description = product.description || '';
  form.price = product.price;
  form.stock = product.stock;
  form.is_active = product.is_active;
  showCreateModal.value = true;
}

async function deleteProduct(id: number) {
  if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

  try {
    await productsApi.deleteProduct(id);
    loadProducts();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка удаления товара');
  }
}

function closeModal() {
  showCreateModal.value = false;
  editingProduct.value = null;
  form.name = '';
  form.description = '';
  form.price = 0;
  form.stock = 0;
  form.is_active = true;
  submitError.value = '';
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = '';
  });
}

function handlePageChange(page: number) {
  if (pagination.value) {
    pagination.value.current_page = page;
  }
  loadProducts();
}

onMounted(async () => {
  if (!shopStore.myShop) {
    await shopStore.fetchMyShop();
  }
  loadProducts();
});
</script>

