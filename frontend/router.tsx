import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboardPage } from './features/dashboard/AdminDashboardPage';
import { MenuPage } from './features/menu/MenuPage';
import { StorefrontPage } from './features/storefront/StorefrontPage';
import { TrackOrderPage } from './features/storefront/TrackOrderPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { QrCodePage } from './features/qr/QrCodePage';
import { KitchenPage } from './features/kitchen/KitchenPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { ReservationsPage } from './features/reservations/ReservationsPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { SettingsPage } from './features/settings/SettingsPage';




export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/r/:slug', element: <StorefrontPage /> },
  { path: '/track/:orderId', element: <TrackOrderPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/kitchen/:restaurantId', element: <KitchenPage /> },
      {
        path: '/admin/:restaurantId',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'menu', element: <MenuPage /> },
          { path: 'qr-codes', element: <QrCodePage /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'reservations', element: <ReservationsPage /> },
          { path: 'customers', element: <CustomersPage /> },
          { path: 'analytics', element: <div className="p-8">Analytics</div> },
          { path: 'settings', element: <div className="p-8">Settings</div> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'settings', element: <SettingsPage /> },

        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);