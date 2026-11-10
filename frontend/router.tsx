import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboardPage } from './features/dashboard/AdminDashboardPage';
import { MenuPage } from './features/menu/MenuPage';
import { StorefrontPage } from './features/storefront/StorefrontPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/r/:slug', element: <StorefrontPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <DashboardPage /> },
      {
        path: '/admin/:restaurantId',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          // Placeholders for future steps
          { path: 'orders', element: <div className="p-8">Orders</div> },
          { path: 'menu', element: <MenuPage /> },
          { path: 'kitchen', element: <div className="p-8">Kitchen</div> },
          { path: 'reservations', element: <div className="p-8">Reservations</div> },
          { path: 'inventory', element: <div className="p-8">Inventory</div> },
          { path: 'customers', element: <div className="p-8">Customers</div> },
          { path: 'analytics', element: <div className="p-8">Analytics</div> },
          { path: 'settings', element: <div className="p-8">Settings</div> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);