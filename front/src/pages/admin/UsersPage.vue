<template>
  <AdminLayout>
    <div>
      <h1 class="text-3xl font-bold mb-8">Пользователи</h1>

      <div v-if="loading" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="users.length === 0" class="bg-white rounded-lg shadow p-12">
        <EmptyState title="Пользователей пока нет" />
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
                Имя
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Роль
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Статус
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Дата регистрации
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ user.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :variant="getRoleVariant(user.role)">
                  {{ getRoleLabel(user.role) }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :variant="user.is_active ? 'success' : 'danger'">
                  {{ user.is_active ? 'Активен' : 'Заблокирован' }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <Select
                    :model-value="user.role"
                    :options="roleOptions"
                    size="sm"
                    @update:modelValue="updateUserRole(user.id, $event)"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    @click="toggleUserStatus(user)"
                  >
                    {{ user.is_active ? 'Заблокировать' : 'Разблокировать' }}
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
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usersApi } from '@/services/api/usersApi';
import type { User, UserRole, PaginatedResponse } from '@/types/models';
import AdminLayout from '@/layouts/AdminLayout.vue';
import Spinner from '@/components/ui/Spinner.vue';
import Badge from '@/components/ui/Badge.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import Pagination from '@/components/ui/Pagination.vue';
import Select from '@/components/ui/Select.vue';
import Button from '@/components/ui/Button.vue';

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const pagination = ref<PaginatedResponse<User> | null>(null);

const roleOptions = [
  { value: 'buyer', label: 'Покупатель' },
  { value: 'seller', label: 'Продавец' },
  { value: 'admin', label: 'Админ' },
];

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    buyer: 'Покупатель',
    seller: 'Продавец',
    admin: 'Админ',
  };
  return labels[role];
}

function getRoleVariant(role: UserRole): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<UserRole, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    buyer: 'info',
    seller: 'success',
    admin: 'danger',
  };
  return variants[role];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU');
}

async function loadUsers() {
  loading.value = true;
  error.value = null;
  try {
    const response = await usersApi.fetchUsers({
      page: pagination.value?.current_page || 1,
      per_page: 20,
    });
    users.value = response.data;
    pagination.value = response;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки пользователей';
  } finally {
    loading.value = false;
  }
}

async function updateUserRole(userId: number, newRole: string) {
  try {
    await usersApi.updateUserRole(userId, newRole);
    await loadUsers();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка обновления роли');
  }
}

async function toggleUserStatus(user: User) {
  try {
    await usersApi.toggleUserStatus(user.id, !user.is_active);
    await loadUsers();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка изменения статуса');
  }
}

function handlePageChange(page: number) {
  if (pagination.value) {
    pagination.value.current_page = page;
  }
  loadUsers();
}

onMounted(() => {
  loadUsers();
});
</script>

