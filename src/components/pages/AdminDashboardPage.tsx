import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { Stores, Orders, Customers, InventoryItems } from '@/entities';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import {
  TrendingUp,
  Store,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Building2,
  Factory,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BrandData {
  id: number;
  name: string;
  industry: string;
  imageUrl: string;
  websiteUrl: string;
  address: string;
  contact: string;
  franchiseCount: number;
}

interface BrandsApiResponse {
  status: string;
  message: string;
  data: {
    content: BrandData[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

interface StoreData {
  id: number;
  name: string;
  location: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  revenue: number;
  status: string;
}

interface StoresApiResponse {
  status: number;
  message: string;
  data: {
    content: StoreData[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isFirst: boolean;
    isLast: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  errors: null;
}

export default function AdminDashboardPage() {
  const { user } = useUserStore();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [orders, setOrders] = useState<Orders[]>([]);
  const [customers, setCustomers] = useState<Customers[]>([]);
  const [inventory, setInventory] = useState<InventoryItems[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Determine role for layout
  const layoutRole = user?.role === 'ADMIN' ? 'admin' : user?.role === 'BRAND_MANAGER' ? 'brand' : 'store';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stores and brands from the actual API
        const [storesResponse, brandsResponse] = await Promise.all([
          fetch('http://localhost:8080/api/admin/stores?pageNumber=0&pageSize=10'),
          fetch('http://localhost:8080/api/admin/brands?pageNumber=0&pageSize=10')
        ]);
        
        const storesData: StoresApiResponse = await storesResponse.json();
        const brandsData: BrandsApiResponse = await brandsResponse.json();
        
        const [ordersData, customersData, inventoryData] = await Promise.all([
          BaseCrudService.getAll<Orders>('orders'),
          BaseCrudService.getAll<Customers>('customers'),
          BaseCrudService.getAll<InventoryItems>('inventoryitems'),
        ]);

        setStores(storesData.data.content);
        if (brandsData.status === 'success') {
          setBrands(brandsData.data.content);
        }
        setOrders(ordersData.items);
        setCustomers(customersData.items);
        setInventory(inventoryData.items);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data
        setStores([
          { id: 1, name: 'Manhattan Flagship', location: '5th Avenue', address: '350 5th Avenue', city: 'New York', state: 'NY', country: 'USA', zipCode: '10118', phoneNumber: '212-555-0101', email: 'manhattan@franchise.com', revenue: 1500000, status: 'ACTIVE' },
          { id: 2, name: 'Downtown Hub', location: 'Market Street', address: '123 Market Street', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94102', phoneNumber: '415-555-0102', email: 'downtown@franchise.com', revenue: 1200000, status: 'ACTIVE' }
        ]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Calculate KPIs
  const totalStoreRevenue = stores.reduce((sum, store) => sum + (store.revenue || 0), 0);
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) + totalStoreRevenue;
  const activeStores = stores.filter(s => s.status === 'ACTIVE').length;
  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const lowStockItems = inventory.filter(item => 
    (item.currentStock || 0) <= (item.reorderLevel || 0)
  ).length;
  
  // Brand-related KPIs
  const totalBrands = brands.length;
  const uniqueIndustries = new Set(brands.map(brand => brand.industry)).size;
  const totalFranchises = brands.reduce((sum, brand) => sum + (brand.franchiseCount || 0), 0);

  // Revenue trend data (last 7 days)
  const revenueTrend = [
    { day: 'Mon', revenue: 45000 },
    { day: 'Tue', revenue: 52000 },
    { day: 'Wed', revenue: 48000 },
    { day: 'Thu', revenue: 61000 },
    { day: 'Fri', revenue: 55000 },
    { day: 'Sat', revenue: 67000 },
    { day: 'Sun', revenue: 58000 },
  ];

  // Top performing stores from API data
  const storePerformance = stores
    .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
    .slice(0, 5)
    .map(store => ({
      name: store.name,
      revenue: store.revenue,
    }));

  // Order status distribution
  const orderStatusData = [
    { name: 'Completed', value: orders.filter(o => o.orderStatus === 'Completed').length },
    { name: 'Pending', value: orders.filter(o => o.orderStatus === 'Pending').length },
    { name: 'Processing', value: orders.filter(o => o.orderStatus === 'Processing').length },
    { name: 'Cancelled', value: orders.filter(o => o.orderStatus === 'Cancelled').length },
  ];

  const COLORS = ['#374151', '#6B7280', '#A89984', '#EF4444'];

  const kpiCards = [
    {
      title: 'Total Brands',
      value: totalBrands.toString(),
      change: '+2 new',
      trend: 'up',
      icon: Building2,
      color: 'text-green-600',
    },
    {
      title: 'Industries',
      value: uniqueIndustries.toString(),
      change: 'sectors',
      trend: 'neutral',
      icon: Factory,
      color: 'text-primary',
    },
    {
      title: 'Total Franchises',
      value: totalFranchises.toString(),
      change: '+5.2%',
      trend: 'up',
      icon: Store,
      color: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `$${(totalStoreRevenue / 1000000).toFixed(1)}M`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Active Stores',
      value: activeStores.toString(),
      change: `${stores.length - activeStores} inactive`,
      trend: 'neutral',
      icon: Store,
      color: 'text-primary',
    },
    {
      title: 'Total Customers',
      value: totalCustomers.toLocaleString(),
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-green-600',
    },
    {
      title: 'Inventory Items',
      value: inventory.length.toString(),
      change: `${lowStockItems} low stock`,
      trend: lowStockItems > 0 ? 'down' : 'neutral',
      icon: Package,
      color: lowStockItems > 0 ? 'text-destructive' : 'text-primary',
    },
    {
      title: 'Avg Order Value',
      value: `$${(totalRevenue / totalOrders || 0).toFixed(2)}`,
      change: '+5.7%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role={layoutRole}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={layoutRole}>
      <div className="p-8 max-w-[100rem] mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-5xl text-foreground mb-2">
            {user?.role === 'BRAND_MANAGER' ? 'Brand Manager Dashboard' : 'Admin Dashboard'}
          </h1>
          <p className="font-paragraph text-lg text-secondary">
            Global overview of all franchises and stores
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpiCards.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-background rounded-xl">
                    <kpi.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {kpi.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-600" />}
                    {kpi.trend === 'down' && <ArrowDown className="w-4 h-4 text-destructive" />}
                    <span className={`text-sm font-paragraph ${kpi.color}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <h3 className="font-paragraph text-sm text-secondary mb-2">{kpi.title}</h3>
                <p className="font-heading text-4xl text-foreground">{kpi.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-heading text-2xl text-foreground mb-6">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F9FAFA" />
                  <XAxis dataKey="day" stroke="#6B7280" style={{ fontFamily: 'lato-light' }} />
                  <YAxis stroke="#6B7280" style={{ fontFamily: 'lato-light' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #F9FAFA',
                      borderRadius: '8px',
                      fontFamily: 'lato-light',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#374151"
                    strokeWidth={2}
                    dot={{ fill: '#374151', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Order Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-heading text-2xl text-foreground mb-6">Order Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #F9FAFA',
                      borderRadius: '8px',
                      fontFamily: 'lato-light',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Performing Stores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-heading text-2xl text-foreground mb-6">Top Performing Stores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={storePerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F9FAFA" />
                  <XAxis dataKey="name" stroke="#6B7280" style={{ fontFamily: 'lato-light' }} />
                  <YAxis stroke="#6B7280" style={{ fontFamily: 'lato-light' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #F9FAFA',
                      borderRadius: '8px',
                      fontFamily: 'lato-light',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#374151" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Insights Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm h-full">
              <h3 className="font-heading text-2xl text-foreground mb-6">Key Insights</h3>
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-paragraph text-sm text-foreground mb-1">
                        Revenue increased by 12.5% this week
                      </p>
                      <p className="font-paragraph text-xs text-secondary">
                        Weekend sales showed significant growth
                      </p>
                    </div>
                  </div>
                </div>

                {lowStockItems > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-destructive mt-1" />
                      <div>
                        <p className="font-paragraph text-sm text-foreground mb-1">
                          {lowStockItems} items need restocking
                        </p>
                        <p className="font-paragraph text-xs text-secondary">
                          Review inventory levels to prevent stockouts
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-paragraph text-sm text-foreground mb-1">
                        Customer base growing steadily
                      </p>
                      <p className="font-paragraph text-xs text-secondary">
                        15.3% increase in new customer registrations
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Store className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-paragraph text-sm text-foreground mb-1">
                        {activeStores} stores operating efficiently
                      </p>
                      <p className="font-paragraph text-xs text-secondary">
                        All active locations meeting performance targets
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
