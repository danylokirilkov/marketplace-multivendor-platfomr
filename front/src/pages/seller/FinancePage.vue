<template>
  <SellerLayout>
    <div>
      <h1 class="text-3xl font-bold mb-8">Финансы</h1>

      <div v-if="loading" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <div v-else class="space-y-6">
        <!-- Статистика -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Сумма продаж</h3>
            <p class="text-3xl font-bold text-gray-900">{{ totalSales }} ₽</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Комиссия маркетплейса</h3>
            <p class="text-3xl font-bold text-red-600">-{{ totalCommission }} ₽</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Доступно к выводу</h3>
            <p class="text-3xl font-bold text-green-600">{{ availableBalance }} ₽</p>
          </div>
        </div>

        <!-- Запрос выплаты -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Запросить выплату</h2>
          <div class="flex gap-4 items-end">
            <div class="flex-1">
              <Input
                v-model.number="payoutAmount"
                type="number"
                label="Сумма"
                placeholder="0"
                :min="1"
                :max="availableBalance"
              />
            </div>
            <Button
              :disabled="!canRequestPayout"
              :loading="requestingPayout"
              @click="handleRequestPayout"
            >
              Запросить выплату
            </Button>
          </div>
          <p v-if="availableBalance === 0" class="mt-2 text-sm text-gray-500">
            Нет доступных средств для вывода
          </p>
        </div>

        <!-- История выплат -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-6 border-b">
            <h2 class="text-xl font-semibold">История выплат</h2>
          </div>
          <div v-if="payoutsLoading" class="flex justify-center py-12">
            <Spinner />
          </div>
          <div v-else-if="payouts.length === 0" class="p-12">
            <EmptyState title="Выплат пока нет" description="Запрошенные выплаты будут отображаться здесь" />
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
                  Сумма
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Статус
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="payout in payouts" :key="payout.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(payout.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ payout.amount }} ₽
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <Badge :variant="getPayoutStatusVariant(payout.status)">
                    {{ getPayoutStatusLabel(payout.status) }}
                  </Badge>
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
import { ref, computed, onMounted } from 'vue';
import { payoutsApi } from '@/services/api/payoutsApi';
import { transactionsApi } from '@/services/api/transactionsApi';
import { useShopStore } from '@/stores/shop';
import type { Payout, Transaction } from '@/types/models';
import SellerLayout from '@/layouts/SellerLayout.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import Spinner from '@/components/ui/Spinner.vue';
import Badge from '@/components/ui/Badge.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

const shopStore = useShopStore();

const loading = ref(false);
const payoutsLoading = ref(false);
const requestingPayout = ref(false);
const payouts = ref<Payout[]>([]);
const transactions = ref<Transaction[]>([]);
const payoutAmount = ref<number>(0);

// Рассчитываем баланс на основе транзакций
const totalSales = computed(() => {
  return transactions.value
    .filter((t) => t.type === 'order_payment')
    .reduce((sum, t) => sum + t.amount, 0);
});

const totalCommission = computed(() => {
  return transactions.value
    .filter((t) => t.type === 'marketplace_commission')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
});

const totalPayouts = computed(() => {
  return payouts.value
    .filter((p) => p.status === 'processed')
    .reduce((sum, p) => sum + p.amount, 0);
});

const availableBalance = computed(() => {
  return totalSales.value - totalCommission.value - totalPayouts.value;
});

const canRequestPayout = computed(() => {
  return payoutAmount.value > 0 && payoutAmount.value <= availableBalance.value;
});

function getPayoutStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Ожидает',
    processed: 'Обработано',
    failed: 'Ошибка',
  };
  return labels[status] || status;
}

function getPayoutStatusVariant(
  status: string
): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'warning',
    processed: 'success',
    failed: 'danger',
  };
  return variants[status] || 'default';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU');
}

async function loadTransactions() {
  if (!shopStore.myShop) return;

  loading.value = true;
  try {
    const response = await transactionsApi.fetchTransactions({
      shop_id: shopStore.myShop.id,
      per_page: 1000,
    });
    transactions.value = response.data;
  } catch (err) {
    console.error('Ошибка загрузки транзакций:', err);
  } finally {
    loading.value = false;
  }
}

async function loadPayouts() {
  if (!shopStore.myShop) return;

  payoutsLoading.value = true;
  try {
    const response = await payoutsApi.fetchPayouts(shopStore.myShop.id);
    payouts.value = response.data;
  } catch (err) {
    console.error('Ошибка загрузки выплат:', err);
  } finally {
    payoutsLoading.value = false;
  }
}

async function handleRequestPayout() {
  if (!canRequestPayout.value) return;

  requestingPayout.value = true;
  try {
    await payoutsApi.createPayout({ amount: payoutAmount.value });
    payoutAmount.value = 0;
    loadPayouts();
    loadTransactions();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка запроса выплаты');
  } finally {
    requestingPayout.value = false;
  }
}

onMounted(async () => {
  if (!shopStore.myShop) {
    await shopStore.fetchMyShop();
  }
  loadTransactions();
  loadPayouts();
});
</script>

