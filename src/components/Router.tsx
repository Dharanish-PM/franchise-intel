import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';

// Pages
import HomePage from '@/components/pages/HomePage';
import LoginPage from '@/components/pages/LoginPage';
import ProfilePage from '@/components/pages/ProfilePage';
import AdminDashboardPage from '@/components/pages/AdminDashboardPage';
import StoreManagerDashboardPage from '@/components/pages/StoreManagerDashboardPage';
import FranchisesPage from '@/components/pages/FranchisesPage';
import StoresPage from '@/components/pages/StoresPage';
import StoreProfilePage from '@/components/pages/StoreProfilePage';
import OrderAnalyticsPage from '@/components/pages/OrderAnalyticsPage';
import CustomerAnalyticsPage from '@/components/pages/CustomerAnalyticsPage';
import InventoryPage from '@/components/pages/InventoryPage';
import ReportsPage from '@/components/pages/ReportsPage';
import ActivityLogPage from '@/components/pages/ActivityLogPage';
import StoreComparisonPage from '@/components/pages/StoreComparisonPage';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "profile",
        element: (
          <MemberProtectedRoute>
            <ProfilePage />
          </MemberProtectedRoute>
        ),
      },
      // Admin Routes
      {
        path: "admin/dashboard",
        element: (
          <MemberProtectedRoute messageToSignIn="Sign in to access the admin dashboard">
            <AdminDashboardPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/franchises",
        element: (
          <MemberProtectedRoute>
            <FranchisesPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/stores",
        element: (
          <MemberProtectedRoute>
            <StoresPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/stores/comparison",
        element: (
          <MemberProtectedRoute>
            <StoreComparisonPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/stores/:storeId",
        element: (
          <MemberProtectedRoute>
            <StoreProfilePage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/orders",
        element: (
          <MemberProtectedRoute>
            <OrderAnalyticsPage role="admin" />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/customers",
        element: (
          <MemberProtectedRoute>
            <CustomerAnalyticsPage role="admin" />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/inventory",
        element: (
          <MemberProtectedRoute>
            <InventoryPage role="admin" />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/reports",
        element: (
          <MemberProtectedRoute>
            <ReportsPage role="admin" />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/activity",
        element: (
          <MemberProtectedRoute>
            <ActivityLogPage role="admin" />
          </MemberProtectedRoute>
        ),
      },
      // Store Manager Routes
      {
        path: "store/dashboard",
        element: (
          <MemberProtectedRoute messageToSignIn="Sign in to access your store dashboard">
            <StoreManagerDashboardPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "store/orders",
        element: (
          <MemberProtectedRoute>
            <OrderAnalyticsPage role="store" />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "store/customers",
        element: (
          <MemberProtectedRoute>
            <CustomerAnalyticsPage role="store" />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "store/inventory",
        element: (
          <MemberProtectedRoute>
            <InventoryPage role="store" />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "store/reports",
        element: (
          <MemberProtectedRoute>
            <ReportsPage role="store" />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "store/profile",
        element: (
          <MemberProtectedRoute>
            <StoreProfilePage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
