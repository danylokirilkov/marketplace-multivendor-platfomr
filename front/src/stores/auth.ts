import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/services/api/authApi';
import type { User, LoginPayload, RegisterPayload } from '@/types/models';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const user = ref<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isBuyer = computed(() => user.value?.role === 'buyer');
  const isSeller = computed(() => user.value?.role === 'seller');
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setAuth(authToken: string, authUser: User) {
    token.value = authToken;
    user.value = authUser;
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  }

  function clearAuth() {
    token.value = null;
    user.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function login(payload: LoginPayload) {
    try {
      const response = await authApi.login(payload);
      setAuth(response.token, response.user);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function register(payload: RegisterPayload) {
    try {
      const response = await authApi.register(payload);
      setAuth(response.token, response.user);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch (error) {
      // Игнорируем ошибки при выходе
    } finally {
      clearAuth();
    }
  }

  async function fetchMe() {
    try {
      const currentUser = await authApi.me();
      user.value = currentUser;
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      return currentUser;
    } catch (error) {
      clearAuth();
      throw error;
    }
  }

  // Инициализация при загрузке - проверяем токен
  if (token.value && !user.value) {
    fetchMe().catch(() => {
      clearAuth();
    });
  }

  return {
    token,
    user,
    isAuthenticated,
    isBuyer,
    isSeller,
    isAdmin,
    login,
    register,
    logout,
    fetchMe,
  };
});

