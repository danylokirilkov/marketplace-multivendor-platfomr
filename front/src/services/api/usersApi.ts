import apiClient from './apiClient';
import type { User, UserListParams, PaginatedResponse } from '@/types/models';

export const usersApi = {
  /**
   * Получить список пользователей
   */
  async fetchUsers(params?: UserListParams): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  /**
   * Получить пользователя по ID
   */
  async fetchUser(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Обновить роль пользователя
   */
  async updateUserRole(id: number, role: string): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}/role`, { role });
    return response.data;
  },

  /**
   * Заблокировать/разблокировать пользователя
   */
  async toggleUserStatus(id: number, is_active: boolean): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}/status`, { is_active });
    return response.data;
  },
};

