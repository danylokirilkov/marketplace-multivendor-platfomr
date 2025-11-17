<template>
  <SellerLayout>
    <div>
      <h1 class="text-3xl font-bold mb-8">Отчёты</h1>

      <div v-if="loading" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <div v-else class="space-y-6">
        <!-- График продаж -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Продажи по дням</h2>
          <div class="h-64">
            <LineChart :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Топ товары -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-6 border-b">
            <h2 class="text-xl font-semibold">Топ товары</h2>
          </div>
          <div v-if="topProductsLoading" class="flex justify-center py-12">
            <Spinner />
          </div>
          <div v-else-if="topProducts.length === 0" class="p-12">
            <EmptyState title="Данных пока нет" description="Топ товары будут отображаться здесь" />
          </div>
          <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Товар
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Продано единиц
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Сумма продаж
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(product, index) in topProducts" :key="product.product_id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ index + 1 }}. {{ product.product_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ product.total_quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ product.total_amount }} ₽
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </SellerLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { statsApi } from '@/services/api/statsApi';
import type { SalesStats, TopProduct } from '@/types/models';
import SellerLayout from '@/layouts/SellerLayout.vue';
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
const topProductsLoading = ref(false);
const salesStats = ref<SalesStats[]>([]);
const topProducts = ref<TopProduct[]>([]);

const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Продажи (₽)',
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

async function loadSalesStats() {
  loading.value = true;
  try {
    const stats = await statsApi.fetchSellerSalesStats('day');
    salesStats.value = stats;

    // Подготовка данных для графика
    chartData.value = {
      labels: stats.map((s) => new Date(s.date).toLocaleDateString('ru-RU')),
      datasets: [
        {
          label: 'Продажи (₽)',
          data: stats.map((s) => s.amount),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        },
      ],
    };
  } catch (err) {
    console.error('Ошибка загрузки статистики продаж:', err);
    // Используем mock данные при ошибке
    const mockData = generateMockStats();
    chartData.value = {
      labels: mockData.map((s) => s.date),
      datasets: [
        {
          label: 'Продажи (₽)',
          data: mockData.map((s) => s.amount),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        },
      ],
    };
  } finally {
    loading.value = false;
  }
}

async function loadTopProducts() {
  topProductsLoading.value = true;
  try {
    const products = await statsApi.fetchSellerTopProducts();
    topProducts.value = products;
  } catch (err) {
    console.error('Ошибка загрузки топ товаров:', err);
    // Используем mock данные при ошибке
    topProducts.value = generateMockTopProducts();
  } finally {
    topProductsLoading.value = false;
  }
}

function generateMockStats(): Array<{ date: string; amount: number }> {
  const stats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    stats.push({
      date: date.toLocaleDateString('ru-RU'),
      amount: Math.floor(Math.random() * 50000) + 10000,
    });
  }
  return stats;
}

function generateMockTopProducts(): TopProduct[] {
  return [
    { product_id: 1, product_name: 'Товар 1', total_quantity: 150, total_amount: 45000 },
    { product_id: 2, product_name: 'Товар 2', total_quantity: 120, total_amount: 36000 },
    { product_id: 3, product_name: 'Товар 3', total_quantity: 100, total_amount: 30000 },
  ];
}

onMounted(() => {
  loadSalesStats();
  loadTopProducts();
});
</script>

