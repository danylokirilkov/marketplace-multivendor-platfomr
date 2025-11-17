<template>
  <SellerLayout>
    <div>
      <h1 class="text-3xl font-bold mb-8">Мой магазин</h1>

      <div v-if="shopStore.isLoading" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <div v-else-if="shopStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ shopStore.error }}</p>
      </div>

      <div v-else-if="!shopStore.myShop" class="bg-white rounded-lg shadow p-8">
        <h2 class="text-xl font-semibold mb-4">Создать магазин</h2>
        <form @submit.prevent="handleCreate">
          <div class="space-y-4">
            <Input
              v-model="createForm.name"
              label="Название магазина"
              placeholder="Введите название"
              required
              :error="errors.name"
            />
            <Textarea
              v-model="createForm.description"
              label="Описание"
              placeholder="Описание магазина"
              :error="errors.description"
            />
          </div>
          <div v-if="submitError" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 text-sm">{{ submitError }}</p>
          </div>
          <Button type="submit" :loading="creating" class="mt-6"> Создать магазин </Button>
        </form>
      </div>

      <div v-else class="bg-white rounded-lg shadow p-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold">{{ shopStore.myShop.name }}</h2>
            <Badge v-if="shopStore.myShop.is_active" variant="success" class="mt-2">
              Активен
            </Badge>
            <Badge v-else variant="danger" class="mt-2"> Заблокирован </Badge>
          </div>
        </div>

        <div v-if="!shopStore.myShop.is_active" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-yellow-800">
            Ваш магазин заблокирован. Вы не можете создавать или редактировать товары.
          </p>
        </div>

        <form v-if="!isEditing" @submit.prevent="handleUpdate">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Название</label>
              <p class="text-gray-900">{{ shopStore.myShop.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <p class="text-gray-600">{{ shopStore.myShop.description || 'Нет описания' }}</p>
            </div>
          </div>
          <Button type="button" variant="outline" class="mt-6" @click="isEditing = true">
            Редактировать
          </Button>
        </form>

        <form v-else @submit.prevent="handleUpdate">
          <div class="space-y-4">
            <Input
              v-model="updateForm.name"
              label="Название магазина"
              placeholder="Введите название"
              required
              :error="errors.name"
            />
            <Textarea
              v-model="updateForm.description"
              label="Описание"
              placeholder="Описание магазина"
              :error="errors.description"
            />
          </div>
          <div v-if="submitError" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 text-sm">{{ submitError }}</p>
          </div>
          <div class="flex gap-4 mt-6">
            <Button type="submit" :loading="updating"> Сохранить </Button>
            <Button type="button" variant="outline" @click="cancelEdit"> Отмена </Button>
          </div>
        </form>
      </div>
    </div>
  </SellerLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useShopStore } from '@/stores/shop';
import SellerLayout from '@/layouts/SellerLayout.vue';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import Spinner from '@/components/ui/Spinner.vue';
import Badge from '@/components/ui/Badge.vue';

const shopStore = useShopStore();

const isEditing = ref(false);
const creating = ref(false);
const updating = ref(false);
const submitError = ref('');

const createForm = reactive({
  name: '',
  description: '',
});

const updateForm = reactive({
  name: '',
  description: '',
});

const errors = reactive({
  name: '',
  description: '',
});

function validate() {
  let valid = true;
  errors.name = '';
  errors.description = '';

  if (!createForm.name && !updateForm.name) {
    errors.name = 'Название обязательно';
    valid = false;
  }

  return valid;
}

async function handleCreate() {
  if (!validate()) return;

  creating.value = true;
  submitError.value = '';

  try {
    await shopStore.createShop(createForm);
    createForm.name = '';
    createForm.description = '';
  } catch (err: any) {
    submitError.value = err.response?.data?.message || 'Ошибка создания магазина';
  } finally {
    creating.value = false;
  }
}

async function handleUpdate() {
  if (!validate()) return;

  updating.value = true;
  submitError.value = '';

  try {
    await shopStore.updateShop(updateForm);
    isEditing.value = false;
  } catch (err: any) {
    submitError.value = err.response?.data?.message || 'Ошибка обновления магазина';
  } finally {
    updating.value = false;
  }
}

function cancelEdit() {
  isEditing.value = false;
  if (shopStore.myShop) {
    updateForm.name = shopStore.myShop.name;
    updateForm.description = shopStore.myShop.description || '';
  }
}

onMounted(async () => {
  await shopStore.fetchMyShop();
  if (shopStore.myShop) {
    updateForm.name = shopStore.myShop.name;
    updateForm.description = shopStore.myShop.description || '';
  }
});
</script>

