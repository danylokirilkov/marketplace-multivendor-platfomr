import apiClient from './apiClient';
import type {
  Product,
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductListParams,
  PaginatedResponse,
} from '@/types/models';

export const productsApi = {
  /**
   * Получить список товаров
   */
  async fetchProducts(params?: ProductListParams): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products', { params });
    return response.data;
  },

  /**
   * Получить товар по ID
   */
  async fetchProduct(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  /**
   * Создать товар
   */
  async createProduct(payload: ProductCreatePayload): Promise<Product> {
    const response = await apiClient.post<Product>('/products', payload);
    return response.data;
  },

  /**
   * Обновить товар
   */
  async updateProduct(id: number, payload: ProductUpdatePayload): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, payload);
    return response.data;
  },

  /**
   * Удалить товар
   */
  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};

