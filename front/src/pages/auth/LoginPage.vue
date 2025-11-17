<template>
  <DefaultLayout>
    <div class="max-w-md mx-auto px-4 py-12">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-2xl font-bold mb-6 text-center">Вход в систему</h1>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
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
          </div>

          <div v-if="submitError" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 text-sm">{{ submitError }}</p>
          </div>

          <Button type="submit" :loading="loading" class="w-full mt-6"> Войти </Button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Нет аккаунта?
            <router-link to="/auth/register" class="text-blue-600 hover:underline">
              Зарегистрироваться
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
});

const errors = reactive({
  email: '',
  password: '',
});

const loading = ref(false);
const submitError = ref('');

function validate() {
  let valid = true;
  errors.email = '';
  errors.password = '';

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

  return valid;
}

async function handleSubmit() {
  if (!validate()) return;

  loading.value = true;
  submitError.value = '';

  try {
    await authStore.login(form);

    // Редирект на страницу в зависимости от роли или redirect параметра
    const redirect = (route.query.redirect as string) || null;

    if (redirect) {
      router.push(redirect);
    } else if (authStore.isBuyer) {
      router.push({ name: 'buyer-orders' });
    } else if (authStore.isSeller) {
      router.push({ name: 'seller-shop' });
    } else if (authStore.isAdmin) {
      router.push({ name: 'admin-dashboard' });
    } else {
      router.push({ name: 'home' });
    }
  } catch (err: any) {
    submitError.value = err.response?.data?.message || 'Ошибка входа. Проверьте данные.';
  } finally {
    loading.value = false;
  }
}
</script>

