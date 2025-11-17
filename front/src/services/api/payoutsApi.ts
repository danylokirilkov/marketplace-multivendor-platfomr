import apiClient from './apiClient';
import type { Payout, PayoutCreatePayload, PaginatedResponse } from '@/types/models';

export const payoutsApi = {
  /**
   * Получить список выплат
   */
  async fetchPayouts(shopId?: number): Promise<PaginatedResponse<Payout>> {
    const params = shopId ? { shop_id: shopId } : {};
    const response = await apiClient.get<PaginatedResponse<Payout>>('/payouts', { params });
    return response.data;
  },

  /**
   * Получить выплату по ID
   */
  async fetchPayout(id: number): Promise<Payout> {
    const response = await apiClient.get<Payout>(`/payouts/${id}`);
    return response.data;
  },

  /**
   * Создать запрос на выплату
   */
  async createPayout(payload: PayoutCreatePayload): Promise<Payout> {
    const response = await apiClient.post<Payout>('/payouts', payload);
    return response.data;
  },
};

