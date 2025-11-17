import apiClient from './apiClient';
import type {
  Order,
  OrderCreatePayload,
  OrderUpdatePayload,
  OrderListParams,
  PaginatedResponse,
  OrderFinancialInfo,
} from '@/types/models';

export const ordersApi = {
  /**
   * Получить список заказов
   */
  async fetchOrders(params?: OrderListParams): Promise<PaginatedResponse<Order>> {
    const response = await apiClient.get<PaginatedResponse<Order>>('/orders', { params });
    return response.data;
  },

  /**
   * Получить заказ по ID
   */
  async fetchOrder(id: number): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  /**
   * Создать заказ
   */
  async createOrder(payload: OrderCreatePayload): Promise<Order> {
    const response = await apiClient.post<Order>('/orders', payload);
    return response.data;
  },

  /**
   * Обновить заказ (например, изменить статус)
   */
  async updateOrder(id: number, payload: OrderUpdatePayload): Promise<Order> {
    const response = await apiClient.put<Order>(`/orders/${id}`, payload);
    return response.data;
  },

  /**
   * Рассчитать финансовую информацию заказа
   */
  async calculateOrderFinancialInfo(payload: OrderCreatePayload): Promise<OrderFinancialInfo> {
    const response = await apiClient.post<OrderFinancialInfo>('/orders/calculate', payload);
    return response.data;
  },
};

