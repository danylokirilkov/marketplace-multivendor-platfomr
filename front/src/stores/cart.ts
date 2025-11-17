import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product } from '@/types/models';

interface CartItem {
  product: Product;
  quantity: number;
}

const CART_KEY = 'cart_items';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const totalAmount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  });

  function saveToStorage() {
    localStorage.setItem(CART_KEY, JSON.stringify(items.value));
  }

  function addItem(product: Product, quantity: number = 1) {
    const existingItem = items.value.find((item) => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.value.push({ product, quantity });
    }

    saveToStorage();
  }

  function removeItem(productId: number) {
    const index = items.value.findIndex((item) => item.product.id === productId);
    if (index > -1) {
      items.value.splice(index, 1);
      saveToStorage();
    }
  }

  function updateQuantity(productId: number, quantity: number) {
    const item = items.value.find((item) => item.product.id === productId);
    if (item) {
      if (quantity <= 0) {
        removeItem(productId);
      } else {
        item.quantity = quantity;
        saveToStorage();
      }
    }
  }

  function clearCart() {
    items.value = [];
    saveToStorage();
  }

  function getItem(productId: number): CartItem | undefined {
    return items.value.find((item) => item.product.id === productId);
  }

  return {
    items,
    totalItems,
    totalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItem,
  };
});

