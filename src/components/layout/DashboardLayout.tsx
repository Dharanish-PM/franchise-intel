import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Users,
  Package,
  FileText,
  Activity,
  Search,
  Bell,
  LogOut,
  User,
  Building2,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'admin' | 'store';
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { member, actions } = useMember();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/franchises', label: 'Franchises', icon: Building2 },
    { path: '/admin/stores', label: 'Stores', icon: Store },
    { path: '/admin/orders', label: 'Order Analytics', icon: ShoppingCart },
    { path: '/admin/customers', label: 'Customer Analytics', icon: Users },
    { path: '/admin/inventory', label: 'Inventory', icon: Package },
    { path: '/admin/reports', label: 'Reports', icon: FileText },
    { path: '/admin/activity', label: 'Activity Logs', icon: Activity },
  ];

  const storeNavItems = [
    { path: '/store/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/store/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/store/customers', label: 'Customers', icon: Users },
    { path: '/store/inventory', label: 'Inventory', icon: Package },
    { path: '/store/reports', label: 'Reports', icon: FileText },
    { path: '/store/profile', label: 'Store Profile', icon: Store },
  ];

  const navItems = role === 'admin' ? adminNavItems : storeNavItems;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${role}/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3 }}
            className="w-[280px] bg-white border-r border-gray-200 flex flex-col fixed h-full z-30"
          >
            <div className="p-8 border-b border-gray-200">
              <h1 className="font-heading text-3xl text-foreground">
                {role === 'admin' ? 'Admin Portal' : 'Store Manager'}
              </h1>
              <p className="font-paragraph text-sm text-secondary mt-1">
                {member?.profile?.nickname || member?.loginEmail || 'User'}
              </p>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors font-paragraph ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-secondary hover:bg-background'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200">
              <Link
                to="/profile"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 text-secondary hover:bg-background transition-colors font-paragraph"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={actions.logout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-secondary hover:bg-background transition-colors font-paragraph"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-background rounded-lg transition-colors"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[400px] font-paragraph"
                />
              </form>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-background rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-secondary" />
                <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground w-5 h-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
