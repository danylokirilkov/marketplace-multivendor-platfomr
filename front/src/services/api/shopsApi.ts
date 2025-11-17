import apiClient from './apiClient';
import type {
  Shop,
  ShopCreatePayload,
  ShopUpdatePayload,
  ShopListParams,
  PaginatedResponse,
} from '@/types/models';

export const shopsApi = {
  /**
   * Получить список магазинов
   */
  async fetchShops(params?: ShopListParams): Promise<PaginatedResponse<Shop>> {
    const response = await apiClient.get<PaginatedResponse<Shop>>('/shops', { params });
    return response.data;
  },

  /**
   * Получить магазин по ID
   */
  async fetchShop(id: number): Promise<Shop> {
    const response = await apiClient.get<Shop>(`/shops/${id}`);
    return response.data;
  },

  /**
   * Получить магазин текущего продавца
   */
  async fetchMyShop(): Promise<Shop | null> {
    try {
      const response = await apiClient.get<Shop>('/shops/my');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Создать магазин
   */
  async createShop(payload: ShopCreatePayload): Promise<Shop> {
    const response = await apiClient.post<Shop>('/shops', payload);
    return response.data;
  },

  /**
   * Обновить магазин
   */
  async updateShop(id: number, payload: ShopUpdatePayload): Promise<Shop> {
    const response = await apiClient.put<Shop>(`/shops/${id}`, payload);
    return response.data;
  },

  /**
   * Заблокировать/разблокировать магазин
   */
  async toggleShopStatus(id: number, is_active: boolean): Promise<Shop> {
    const response = await apiClient.patch<Shop>(`/shops/${id}/status`, { is_active });
    return response.data;
  },
};

