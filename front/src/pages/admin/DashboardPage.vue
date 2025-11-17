<template>
  <AdminLayout>
    <div>
      <h1 class="text-3xl font-bold mb-8">Дашборд</h1>

      <div v-if="loading" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <div v-else class="space-y-6">
        <!-- Статистика -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Всего пользователей</h3>
            <p class="text-3xl font-bold text-gray-900">{{ stats?.total_users || 0 }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Магазинов</h3>
            <p class="text-3xl font-bold text-gray-900">{{ stats?.total_shops || 0 }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Заказов</h3>
            <p class="text-3xl font-bold text-gray-900">{{ stats?.total_orders || 0 }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Общий оборот</h3>
            <p class="text-3xl font-bold text-gray-900">{{ stats?.total_revenue || 0 }} ₽</p>
          </div>
        </div>

        <!-- График оборота -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Оборот по дням</h2>
          <div class="h-64">
            <LineChart :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Последние транзакции -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-6 border-b">
            <h2 class="text-xl font-semibold">Последние транзакции</h2>
          </div>
          <div v-if="transactionsLoading" class="flex justify-center py-12">
            <Spinner />
          </div>
          <div v-else-if="transactions.length === 0" class="p-12">
            <EmptyState title="Транзакций пока нет" />
          </div>
          <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Дата
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Тип
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Сумма
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Описание
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in transactions" :key="transaction.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(transaction.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getTransactionTypeLabel(transaction.type) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ transaction.amount }} ₽
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ transaction.description || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { statsApi } from '@/services/api/statsApi';
import { transactionsApi } from '@/services/api/transactionsApi';
import type { DashboardStats, Transaction } from '@/types/models';
import AdminLayout from '@/layouts/AdminLayout.vue';
import Spinner from '@/components/ui/Spinner.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = Line as any;

const loading = ref(false);
const transactionsLoading = ref(false);
const stats = ref<DashboardStats | null>(null);
const transactions = ref<Transaction[]>([]);

const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Оборот (₽)',
      data: [] as number[],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.1,
    },
  ],
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    order_payment: 'Оплата заказа',
    marketplace_commission: 'Комиссия маркетплейса',
    payout: 'Выплата',
    refund: 'Возврат',
    deposit: 'Пополнение',
  };
  return labels[type] || type;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function loadStats() {
  loading.value = true;
  try {
    stats.value = await statsApi.fetchDashboardStats();
    // Генерируем mock данные для графика
    const mockData = generateMockRevenueData();
    chartData.value = {
      labels: mockData.map((d) => d.date),
      datasets: [
        {
          label: 'Оборот (₽)',
          data: mockData.map((d) => d.amount),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        },
      ],
    };
  } catch (err) {
    console.error('Ошибка загрузки статистики:', err);
  } finally {
    loading.value = false;
  }
}

async function loadTransactions() {
  transactionsLoading.value = true;
  try {
    const response = await transactionsApi.fetchTransactions({ per_page: 20 });
    transactions.value = response.data;
  } catch (err) {
    console.error('Ошибка загрузки транзакций:', err);
  } finally {
    transactionsLoading.value = false;
  }
}

function generateMockRevenueData(): Array<{ date: string; amount: number }> {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('ru-RU'),
      amount: Math.floor(Math.random() * 200000) + 50000,
    });
  }
  return data;
}

onMounted(() => {
  loadStats();
  loadTransactions();
});
</script>

