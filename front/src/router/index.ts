import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Публичные маршруты
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/products/:id',
      name: 'product',
      component: () => import('@/pages/ProductPage.vue'),
      props: true,
    },
    {
      path: '/shops/:id',
      name: 'shop',
      component: () => import('@/pages/ShopPage.vue'),
      props: true,
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('@/pages/auth/LoginPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('@/pages/auth/RegisterPage.vue'),
      meta: { guest: true },
    },
    // Маршруты покупателя
    {
      path: '/buyer',
      component: () => import('@/layouts/BuyerLayout.vue'),
      meta: { requiresAuth: true, role: 'buyer' },
      children: [
        {
          path: '',
          redirect: '/buyer/orders',
        },
        {
          path: 'orders',
          name: 'buyer-orders',
          component: () => import('@/pages/buyer/OrdersPage.vue'),
        },
        {
          path: 'orders/:id',
          name: 'buyer-order-detail',
          component: () => import('@/pages/buyer/OrderDetailPage.vue'),
          props: true,
        },
      ],
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/pages/CartPage.vue'),
      meta: { requiresAuth: true, role: 'buyer' },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/pages/CheckoutPage.vue'),
      meta: { requiresAuth: true, role: 'buyer' },
    },
    // Маршруты продавца
    {
      path: '/seller',
      component: () => import('@/layouts/SellerLayout.vue'),
      meta: { requiresAuth: true, role: 'seller' },
      children: [
        {
          path: '',
          redirect: '/seller/shop',
        },
        {
          path: 'shop',
          name: 'seller-shop',
          component: () => import('@/pages/seller/ShopPage.vue'),
        },
        {
          path: 'products',
          name: 'seller-products',
          component: () => import('@/pages/seller/ProductsPage.vue'),
        },
        {
          path: 'orders',
          name: 'seller-orders',
          component: () => import('@/pages/seller/OrdersPage.vue'),
        },
        {
          path: 'orders/:id',
          name: 'seller-order-detail',
          component: () => import('@/pages/seller/OrderDetailPage.vue'),
          props: true,
        },
        {
          path: 'finance',
          name: 'seller-finance',
          component: () => import('@/pages/seller/FinancePage.vue'),
        },
        {
          path: 'reports',
          name: 'seller-reports',
          component: () => import('@/pages/seller/ReportsPage.vue'),
        },
      ],
    },
    // Маршруты админа
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard',
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/pages/admin/DashboardPage.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/pages/admin/UsersPage.vue'),
        },
        {
          path: 'shops',
          name: 'admin-shops',
          component: () => import('@/pages/admin/ShopsPage.vue'),
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('@/pages/admin/ProductsPage.vue'),
        },
      ],
    },
    // 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
});

// Глобальный guard
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore();

    // Если маршрут требует авторизации
    if (to.meta.requiresAuth) {
      if (!authStore.isAuthenticated) {
        // Пытаемся загрузить пользователя по токену
        if (authStore.token) {
          try {
            await authStore.fetchMe();
          } catch {
            // Токен невалидный, редирект на логин
            next({ name: 'login', query: { redirect: to.fullPath } });
            return;
          }
        } else {
          next({ name: 'login', query: { redirect: to.fullPath } });
          return;
        }
      }

      // Проверяем роль
      const requiredRole = to.meta.role as string | undefined;
      if (requiredRole && authStore.user?.role !== requiredRole) {
        // Недостаточно прав
        next({ name: 'home' });
        return;
      }
    }

    // Если маршрут только для гостей (логин/регистрация)
    if (to.meta.guest && authStore.isAuthenticated) {
      // Если уже авторизован, редиректим на соответствующую страницу
      if (authStore.isBuyer) {
        next({ name: 'buyer-orders' });
      } else if (authStore.isSeller) {
        next({ name: 'seller-shop' });
      } else if (authStore.isAdmin) {
        next({ name: 'admin-dashboard' });
      } else {
        next({ name: 'home' });
      }
      return;
    }

    next();
  }
);

export default router;

