import apiClient from './apiClient';
import type { Transaction, PaginatedResponse } from '@/types/models';

export const transactionsApi = {
  /**
   * Получить список транзакций
   */
  async fetchTransactions(params?: {
    user_id?: number;
    shop_id?: number;
    type?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/transactions', { params });
    return response.data;
  },
};

