import { defineStore } from 'pinia';
import { ref } from 'vue';
import { shopsApi } from '@/services/api/shopsApi';
import type { Shop } from '@/types/models';

export const useShopStore = defineStore('shop', () => {
  const myShop = ref<Shop | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchMyShop() {
    isLoading.value = true;
    error.value = null;
    try {
      myShop.value = await shopsApi.fetchMyShop();
      return myShop.value;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Ошибка загрузки магазина';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createShop(payload: { name: string; description?: string }) {
    isLoading.value = true;
    error.value = null;
    try {
      myShop.value = await shopsApi.createShop(payload);
      return myShop.value;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Ошибка создания магазина';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateShop(payload: { name?: string; description?: string }) {
    if (!myShop.value) {
      throw new Error('Магазин не найден');
    }
    isLoading.value = true;
    error.value = null;
    try {
      myShop.value = await shopsApi.updateShop(myShop.value.id, payload);
      return myShop.value;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Ошибка обновления магазина';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function clearShop() {
    myShop.value = null;
    error.value = null;
  }

  return {
    myShop,
    isLoading,
    error,
    fetchMyShop,
    createShop,
    updateShop,
    clearShop,
  };
});

