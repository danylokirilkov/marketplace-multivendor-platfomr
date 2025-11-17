<template>
  <DefaultLayout>
    <div class="max-w-md mx-auto px-4 py-12">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-2xl font-bold mb-6 text-center">Регистрация</h1>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <Input
              v-model="form.name"
              label="Имя"
              placeholder="Ваше имя"
              required
              :error="errors.name"
            />
            <Input
              v-model="form.email"
              type="email"
              label="Email"
              placeholder="your@email.com"
              required
              :error="errors.email"
            />
            <Input
              v-model="form.password"
              type="password"
              label="Пароль"
              placeholder="••••••••"
              required
              :error="errors.password"
            />
            <Input
              v-model="form.password_confirmation"
              type="password"
              label="Подтверждение пароля"
              placeholder="••••••••"
              required
              :error="errors.password_confirmation"
            />
            <Select
              v-model="form.role"
              :options="roleOptions"
              label="Роль"
              required
              :error="errors.role"
            />
          </div>

          <div v-if="submitError" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 text-sm">{{ submitError }}</p>
          </div>

          <Button type="submit" :loading="loading" class="w-full mt-6"> Зарегистрироваться </Button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Уже есть аккаунт?
            <router-link to="/auth/login" class="text-blue-600 hover:underline"> Войти </router-link>
          </p>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Button from '@/components/ui/Button.vue';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'buyer' as 'buyer' | 'seller',
});

const errors = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: '',
});

const loading = ref(false);
const submitError = ref('');

const roleOptions = [
  { value: 'buyer', label: 'Покупатель' },
  { value: 'seller', label: 'Продавец' },
];

function validate() {
  let valid = true;
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = '';
  });

  if (!form.name) {
    errors.name = 'Имя обязательно';
    valid = false;
  }

  if (!form.email) {
    errors.email = 'Email обязателен';
    valid = false;
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Некорректный email';
    valid = false;
  }

  if (!form.password) {
    errors.password = 'Пароль обязателен';
    valid = false;
  } else if (form.password.length < 6) {
    errors.password = 'Пароль должен быть не менее 6 символов';
    valid = false;
  }

  if (!form.password_confirmation) {
    errors.password_confirmation = 'Подтверждение пароля обязательно';
    valid = false;
  } else if (form.password !== form.password_confirmation) {
    errors.password_confirmation = 'Пароли не совпадают';
    valid = false;
  }

  if (!form.role) {
    errors.role = 'Роль обязательна';
    valid = false;
  }

  return valid;
}

async function handleSubmit() {
  if (!validate()) return;

  loading.value = true;
  submitError.value = '';

  try {
    await authStore.register(form);

    // Редирект на страницу в зависимости от роли
    if (authStore.isBuyer) {
      router.push({ name: 'buyer-orders' });
    } else if (authStore.isSeller) {
      router.push({ name: 'seller-shop' });
    } else {
      router.push({ name: 'home' });
    }
  } catch (err: any) {
    submitError.value = err.response?.data?.message || 'Ошибка регистрации. Попробуйте снова.';
  } finally {
    loading.value = false;
  }
}
</script>

