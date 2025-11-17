// Основные модели домена

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Shop {
  id: number;
  owner_id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  shop_id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at?: string;
  shop?: Shop;
}

export type OrderStatus = 'new' | 'paid' | 'sent' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: number;
  buyer_id: number;
  shop_id: number;
  status: OrderStatus;
  total_amount: number;
  marketplace_commission?: number;
  seller_amount?: number;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
  buyer?: User;
  shop?: Shop;
}

export type PayoutStatus = 'pending' | 'processed' | 'failed';

export interface Payout {
  id: number;
  shop_id: number;
  amount: number;
  status: PayoutStatus;
  created_at: string;
  updated_at?: string;
  shop?: Shop;
}

export type TransactionType = 'order_payment' | 'marketplace_commission' | 'payout' | 'refund' | 'deposit';

export interface Transaction {
  id: number;
  user_id?: number | null;
  shop_id?: number | null;
  type: TransactionType;
  amount: number;
  description?: string;
  created_at: string;
  user?: User;
  shop?: Shop;
}

// DTO для создания/обновления

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'buyer' | 'seller';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ShopCreatePayload {
  name: string;
  description?: string;
}

export interface ShopUpdatePayload {
  name?: string;
  description?: string;
}

export interface ProductCreatePayload {
  name: string;
  description?: string;
  price: number;
  stock: number;
  is_active?: boolean;
  image_url?: string;
}

export interface ProductUpdatePayload {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  is_active?: boolean;
  image_url?: string;
}

export interface OrderCreatePayload {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface OrderUpdatePayload {
  status?: OrderStatus;
}

export interface PayoutCreatePayload {
  amount: number;
}

// Параметры запросов

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface ProductListParams extends PaginationParams {
  shop_id?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
  is_active?: boolean;
}

export interface OrderListParams extends PaginationParams {
  status?: OrderStatus;
  shop_id?: number;
  buyer_id?: number;
}

export interface UserListParams extends PaginationParams {
  role?: UserRole;
  search?: string;
}

export interface ShopListParams extends PaginationParams {
  is_active?: boolean;
  search?: string;
}

// Ответы API

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface OrderFinancialInfo {
  total_amount: number;
  marketplace_commission: number;
  seller_amount: number;
}

// Статистика и аналитика

export interface SalesStats {
  date: string;
  amount: number;
  orders_count: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_amount: number;
}

export interface DashboardStats {
  total_users: number;
  total_shops: number;
  total_orders: number;
  total_revenue: number;
  users_by_role: Record<UserRole, number>;
  orders_by_status: Record<OrderStatus, number>;
}

