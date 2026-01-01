import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { Orders, Customers, InventoryItems, Stores } from '@/entities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUp,
  Clock,
  Calendar,
  Search,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStoreContext } from '@/store/storeContext';
import { useUserStore } from '@/store/userStore';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { useInventoryItems } from '@/hooks/use-inventory-items';

export default function StoreManagerDashboardPage() {
  const [orders, setOrders] = useState<Orders[]>([]);
  const [customers, setCustomers] = useState<Customers[]>([]);
  const [inventory, setInventory] = useState<InventoryItems[]>([]);
  const [stores, setStores] = useState<Stores[]>([]);
  const [backendData, setBackendData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { selectedStoreId, setSelectedStoreId } = useStoreContext();
  const { user } = useUserStore();
  
  const currentStoreId = selectedStoreId ? parseInt(selectedStoreId) : user?.storeId || user?.franchiseId;
  const { items: lowStockItems } = useInventoryItems(currentStoreId, 0, 10, '', 'LOW');
  const { items: outOfStockItems } = useInventoryItems(currentStoreId, 0, 10, '', 'OUT');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        if (user.role === 'STORE_MANAGER' && user.storeId) {
          const response = await fetch(`http://localhost:8080/api/store/${user.storeId}`);
          const storeData = await response.json();
          setBackendData(storeData.data);
          
          const [ordersData, customersData, inventoryData] = await Promise.all([
            BaseCrudService.getAll<Orders>('orders'),
            BaseCrudService.getAll<Customers>('customers'),
            BaseCrudService.getAll<InventoryItems>('inventoryitems'),
          ]);

          setOrders(ordersData.items);
          setCustomers(customersData.items);
          setInventory(inventoryData.items);
          setStores([storeData.data]);
          setSelectedStoreId(user.storeId.toString());
        } else if (user.role === 'BRAND_MANAGER' && user.brandId) {
          const response = await fetch(`http://localhost:8080/api/brand/${user.brandId}`);
          const brandData = await response.json();
          setBackendData(brandData.data);
          
          const [ordersData, customersData, inventoryData, storesData] = await Promise.all([
            BaseCrudService.getAll<Orders>('orders'),
            BaseCrudService.getAll<Customers>('customers'),
            BaseCrudService.getAll<InventoryItems>('inventoryitems'),
            BaseCrudService.getAll<Stores>('stores'),
          ]);

          setOrders(ordersData.items);
          setCustomers(customersData.items);
          setInventory(inventoryData.items);
          setStores(storesData.items);
          
          if (storesData.items.length > 0 && !selectedStoreId) {
            setSelectedStoreId(storesData.items[0]._id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [user, selectedStoreId, setSelectedStoreId]);

  // Get current store
  const currentStore = stores.find(s => s._id === selectedStoreId);

  // Generate dummy data for the selected store
  const generateStoreData = (storeId: string) => {
    const hash = storeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = hash % 1000;
    
    return {
      todayOrders: Math.floor((seed * 7) % 15) + 3,
      totalRevenue: Math.floor((seed * 1500) % 50000) + 25000,
      pendingOrders: Math.floor((seed * 3) % 8) + 1,
      lowStockCount: Math.floor((seed * 2) % 5),
    };
  };

  const storeData = generateStoreData(selectedStoreId || '');

  const todayOrders = storeData.todayOrders;
  const totalRevenue = storeData.totalRevenue;
  const pendingOrders = storeData.pendingOrders;
  const alertItems = [...lowStockItems, ...outOfStockItems];

  // Sales trend (last 7 days)
  const salesTrend = [
    { day: 'Mon', sales: 12 },
    { day: 'Tue', sales: 19 },
    { day: 'Wed', sales: 15 },
    { day: 'Thu', sales: 22 },
    { day: 'Fri', sales: 18 },
    { day: 'Sat', sales: 28 },
    { day: 'Sun', sales: 24 },
  ];

  // Sample itemwise sales data
  const itemwiseSales = [
    { name: 'Classic Burger', sku: 'CB001', salesAmount: 1250, quantitySold: 45 },
    { name: 'Chicken Wings', sku: 'CW002', salesAmount: 980, quantitySold: 32 },
    { name: 'Caesar Salad', sku: 'CS003', salesAmount: 720, quantitySold: 28 },
    { name: 'Pepperoni Pizza', sku: 'PP004', salesAmount: 1450, quantitySold: 38 },
    { name: 'Fish Tacos', sku: 'FT005', salesAmount: 650, quantitySold: 22 },
    { name: 'Chocolate Cake', sku: 'CC006', salesAmount: 420, quantitySold: 18 },
    { name: 'Iced Coffee', sku: 'IC007', salesAmount: 380, quantitySold: 55 },
    { name: 'Grilled Sandwich', sku: 'GS008', salesAmount: 590, quantitySold: 26 }
  ];

  // Top selling items (using sample data)
  const topItems = itemwiseSales.slice(0, 5).map(item => ({
    name: item.name,
    sold: item.quantitySold,
  }));

  const kpiCards = [
    {
      title: "Today's Orders",
      value: backendData?.todaysOrders?.toString() || '0',
      change: '+23.1%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `$${backendData?.totalRevenue || 0}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Active Customers',
      value: '0',
      change: '+8.3%',
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Pending Orders',
      value: '0',
      change: 'Needs attention',
      trend: 'neutral',
      icon: Clock,
      color: 'text-secondary',
    },
    {
      title: 'Inventory Items',
      value: backendData?.inventoryItems?.toString() || '0',
      change: '0 low stock',
      trend: 'neutral',
      icon: Package,
      color: 'text-primary',
    },
    {
      title: 'Avg Order Value',
      value: `$${backendData?.avgOrderValue || 0}`,
      change: '+5.7%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role="store">
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
    <DashboardLayout role="store">
      <div className="p-8 max-w-[100rem] mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-5xl text-foreground mb-2">Store Dashboard</h1>
            <p className="font-paragraph text-lg text-secondary">
              {currentStore?.storeName || 'Your store'} performance overview
            </p>
          </div>
          <div className="w-64">
            <Select value={selectedStoreId || ''} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="font-paragraph">
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store._id} value={store._id}>
                    {store.storeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-heading text-2xl text-foreground mb-6">Sales Trend (7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesTrend}>
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
                    dataKey="sales"
                    stroke="#374151"
                    strokeWidth={2}
                    dot={{ fill: '#374151', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Top Selling Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-heading text-2xl text-foreground mb-6">Top Selling Items</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topItems}>
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
                  <Bar dataKey="sold" fill="#374151" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Itemwise Sales */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-heading text-2xl text-foreground mb-6">Itemwise Sales</h3>
              <div className="space-y-4">
                {itemwiseSales.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-paragraph text-sm text-foreground font-medium">
                          {item.name}
                        </p>
                        <p className="font-paragraph text-xs text-secondary">
                          SKU: {item.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-paragraph text-sm text-foreground font-medium">
                        ${item.salesAmount}
                      </p>
                      <p className="font-paragraph text-xs text-secondary">
                        {item.quantitySold} units sold
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Orders & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-2xl text-foreground">Recent Orders</h3>
              </div>
              
              {/* Date Range Filter */}
              <div className="mb-6">
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Select date range"
                />
              </div>
              
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => {
                  const hash = (selectedStoreId || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const seed = (hash + i) % 1000;
                  const statuses = ['Completed', 'Pending', 'Processing'];
                  const status = statuses[seed % statuses.length];
                  
                  return (
                    <div key={`order-${i}-${selectedStoreId}`} className="flex items-center justify-between p-4 bg-background rounded-lg">
                      <div>
                        <p className="font-paragraph text-sm text-foreground font-medium">
                          ORD-{String(1001 + i).padStart(5, '0')}
                        </p>
                        <p className="font-paragraph text-xs text-secondary">
                          Customer {i + 1}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-paragraph text-sm text-foreground font-medium">
                          ${(seed * 45 + 50).toFixed(2)}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-paragraph ${
                          status === 'Completed' ? 'bg-green-100 text-green-800' :
                          status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Inventory Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-heading text-2xl text-foreground mb-6">Inventory Alerts</h3>
              <div className="space-y-4">
                {alertItems.length > 0 ? (
                  alertItems.map((item) => {
                    const stock = 'stock' in item ? item.stock : 0;
                    const reorderValue = 'reorderValue' in item ? item.reorderValue : null;
                    const itemName = 'itemName' in item ? item.itemName : '';
                    const itemId = 'itemId' in item ? item.itemId : '';
                    
                    return (
                      <div key={itemId} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-destructive mt-1" />
                        <div className="flex-1">
                          <p className="font-paragraph text-sm text-foreground font-medium">
                            {itemName}
                          </p>
                          <p className="font-paragraph text-xs text-secondary">
                            Current stock: {stock} units{reorderValue ? ` | Reorder level: ${reorderValue} units` : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="font-paragraph text-sm text-green-800">
                      All inventory levels are healthy
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
