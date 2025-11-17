import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth';

// URL API — управляется через .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Создаём экземпляр axios
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Запросы → подставляем токен
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const authStore = useAuthStore();
        const token = authStore.token;

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Ответы → если 401 — выходим из аккаунта
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            window.location.href = '/auth/login';
        }

        return Promise.reject(error);
    }
);

export default apiClient;
