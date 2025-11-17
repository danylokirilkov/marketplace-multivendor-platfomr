import apiClient from './apiClient';
import type { SalesStats, TopProduct, DashboardStats } from '@/types/models';

export const statsApi = {
  /**
   * Получить статистику продаж для продавца
   */
  async fetchSellerSalesStats(period: 'day' | 'month' = 'day'): Promise<SalesStats[]> {
    const response = await apiClient.get<SalesStats[]>(`/stats/seller/sales`, {
      params: { period },
    });
    return response.data;
  },

  /**
   * Получить топ товаров продавца
   */
  async fetchSellerTopProducts(): Promise<TopProduct[]> {
    const response = await apiClient.get<TopProduct[]>('/stats/seller/top-products');
    return response.data;
  },

  /**
   * Получить статистику для админ-панели
   */
  async fetchDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/stats/dashboard');
    return response.data;
  },
};

