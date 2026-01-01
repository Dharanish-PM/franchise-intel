import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useUserStore } from '@/store/userStore';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Users,
  Package,
  FileText,
  Activity,
  Bell,
  LogOut,
  User,
  Building2,
  ClipboardList,
  Truck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'admin' | 'store' | 'brand' | 'sales';
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { member, actions } = useMember();
  const { user } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize sidebar state from localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save sidebar state to localStorage whenever it changes
  const toggleSidebar = () => {
    setIsSidebarOpen((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem('sidebar-open', JSON.stringify(newState));
      return newState;
    });
  };

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/brands', label: 'Brands', icon: Building2 },
  ];

  const brandManagerNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/stores', label: 'Stores', icon: Store },
    { path: '/admin/orders', label: 'Order Analytics', icon: ShoppingCart },
    { path: '/admin/customers', label: 'Customer Analytics', icon: Users },
    { path: '/admin/inventory', label: 'Inventory', icon: Package },
    { path: '/admin/request-management', label: 'Request Management', icon: ClipboardList },
    { path: '/admin/shipments', label: 'Shipments', icon: Truck },
    { path: '/admin/reports', label: 'Reports', icon: FileText },
    { path: '/admin/activity', label: 'Activity Logs', icon: Activity },
  ];

  const storeNavItems = [
    { path: '/store/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/store/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/store/customers', label: 'Customers', icon: Users },
    { path: '/store/inventory', label: 'Inventory', icon: Package },
    { path: '/store/inventory-requests', label: 'Inventory Requests', icon: ClipboardList },
    { path: '/store/shipments', label: 'Shipments', icon: Truck },
    { path: '/store/reports', label: 'Reports', icon: FileText },
    // { path: '/store/profile', label: 'Store Profile', icon: Store },
  ];

  const salesNavItems = [
    { path: '/sales/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/sales/create-order', label: 'Create Order', icon: ShoppingCart },
    { path: '/sales/orders', label: 'Order History', icon: FileText },
    { path: '/sales/returns', label: 'Returns Management', icon: Package },
  ];

  const navItems = role === 'admin' ? adminNavItems : role === 'brand' ? brandManagerNavItems : role === 'sales' ? salesNavItems : storeNavItems;

  const getPortalTitle = () => {
    if (role === 'admin') return 'Admin Portal';
    if (role === 'brand') return 'Brand Manager Portal';
    if (role === 'sales') return 'Sales Portal';
    return 'Store Manager';
  };

  const getRoleBadge = () => {
    if (user?.role === 'ADMIN') return '👤 Admin';
    if (user?.role === 'BRAND_MANAGER') return '👔 Brand Manager';
    if (user?.role === 'SALES') return '💼 Sales';
    if (user?.role === 'STORE_MANAGER') return '🏪 Store Manager';
    return '👥 Staff';
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-white border-r border-gray-200 flex flex-col fixed h-full z-30"
      >
        {/* Sidebar Header */}
        <div className="p-8 border-b border-gray-200 relative h-[100px] flex items-center">
          <motion.div
            initial={false}
            animate={{ 
              opacity: isSidebarOpen ? 1 : 0,
              x: isSidebarOpen ? 0 : -20
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={isSidebarOpen ? 'block' : 'hidden'}
          >
            <h1 className="font-heading text-3xl text-foreground whitespace-nowrap">
              {getPortalTitle()}
            </h1>
            <p className="font-paragraph text-sm text-secondary mt-1 whitespace-nowrap">
              {member?.profile?.nickname || member?.loginEmail || 'User'}
            </p>
          </motion.div>
          
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 hover:bg-background transition-colors shadow-sm z-10"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-secondary" />
            ) : (
              <ChevronRight className="w-4 h-4 text-secondary" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} px-4 py-3 rounded-lg mb-2 transition-all duration-300 font-paragraph ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-secondary hover:bg-background'
                }`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <Icon className="w-6 h-6 flex-shrink-0" />
                <motion.span
                  initial={false}
                  animate={{ 
                    opacity: isSidebarOpen ? 1 : 0,
                    width: isSidebarOpen ? 'auto' : 0,
                    marginLeft: isSidebarOpen ? 12 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => navigate('/profile')}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} px-4 py-3 rounded-lg mb-2 text-secondary hover:bg-background transition-all duration-300 font-paragraph`}
            title={!isSidebarOpen ? 'Profile' : ''}
          >
            <User className="w-6 h-6 flex-shrink-0" />
            <motion.span
              initial={false}
              animate={{ 
                opacity: isSidebarOpen ? 1 : 0,
                width: isSidebarOpen ? 'auto' : 0,
                marginLeft: isSidebarOpen ? 12 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden whitespace-nowrap"
            >
              Profile
            </motion.span>
          </button>
          <button
            onClick={actions.logout}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} px-4 py-3 rounded-lg text-secondary hover:bg-background transition-all duration-300 font-paragraph`}
            title={!isSidebarOpen ? 'Sign Out' : ''}
          >
            <LogOut className="w-6 h-6 flex-shrink-0" />
            <motion.span
              initial={false}
              animate={{ 
                opacity: isSidebarOpen ? 1 : 0,
                width: isSidebarOpen ? 'auto' : 0,
                marginLeft: isSidebarOpen ? 12 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden whitespace-nowrap"
            >
              Sign Out
            </motion.span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.div 
        initial={false}
        animate={{ marginLeft: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 flex flex-col"
      >
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </motion.div>
    </div>
  );
}
