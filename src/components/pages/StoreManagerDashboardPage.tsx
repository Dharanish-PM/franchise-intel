import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { Orders, Customers, InventoryItems, Stores } from '@/entities';
import { Card } from '@/components/ui/card';
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
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStoreContext } from '@/store/storeContext';

export default function StoreManagerDashboardPage() {
  const [orders, setOrders] = useState<Orders[]>([]);
  const [customers, setCustomers] = useState<Customers[]>([]);
  const [inventory, setInventory] = useState<InventoryItems[]>([]);
  const [stores, setStores] = useState<Stores[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedStoreId, setSelectedStoreId } = useStoreContext();

  useEffect(() => {
    const fetchData = async () => {
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
      
      // Set first store as default if not already selected
      if (storesData.items.length > 0 && !selectedStoreId) {
        setSelectedStoreId(storesData.items[0]._id);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [selectedStoreId, setSelectedStoreId]);

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
  const lowStockItems = inventory.filter(item => 
    (item.currentStock || 0) <= (item.reorderLevel || 0)
  ).slice(0, storeData.lowStockCount);

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

  // Top selling items
  const topItems = inventory.slice(0, 5).map(item => ({
    name: item.itemName || 'Unknown',
    sold: Math.floor(Math.random() * 50) + 10,
  }));

  const kpiCards = [
    {
      title: "Today's Orders",
      value: todayOrders.toString(),
      change: '+23.1%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `$${(totalRevenue / 1000).toFixed(1)}K`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Active Customers',
      value: customers.length.toString(),
      change: '+8.3%',
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toString(),
      change: 'Needs attention',
      trend: 'neutral',
      icon: Clock,
      color: 'text-secondary',
    },
    {
      title: 'Inventory Items',
      value: inventory.length.toString(),
      change: `${lowStockItems.length} low stock`,
      trend: lowStockItems.length > 0 ? 'down' : 'neutral',
      icon: Package,
      color: lowStockItems.length > 0 ? 'text-destructive' : 'text-primary',
    },
    {
      title: 'Avg Order Value',
      value: `$${(totalRevenue / orders.length || 0).toFixed(2)}`,
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
          {kpiCards.map((kpi, index) => {
            // Use dummy data for display
            let displayValue = kpi.value;
            if (kpi.title === "Today's Orders") displayValue = todayOrders.toString();
            if (kpi.title === 'Total Revenue') displayValue = `${(totalRevenue / 1000).toFixed(1)}K`;
            if (kpi.title === 'Pending Orders') displayValue = pendingOrders.toString();
            if (kpi.title === 'Low Stock Items') displayValue = lowStockItems.length.toString();
            if (kpi.title === 'Avg Order Value') displayValue = `${(totalRevenue / Math.max(todayOrders, 1)).toFixed(2)}`;

            return (
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
                  <p className="font-heading text-4xl text-foreground">{displayValue}</p>
                </Card>
              </motion.div>
            );
          })}
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

        {/* Recent Orders & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-heading text-2xl text-foreground mb-6">Recent Orders</h3>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => {
                  const hash = (selectedStoreId || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const seed = (hash + i) % 1000;
                  const statuses = ['Completed', 'Pending', 'Processing'];
                  const status = statuses[seed % statuses.length];
                  
                  return (
                    <div key={i} className="flex items-center justify-between p-4 bg-background rounded-lg">
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
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item) => (
                    <div key={item._id} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-destructive mt-1" />
                      <div className="flex-1">
                        <p className="font-paragraph text-sm text-foreground font-medium">
                          {item.itemName}
                        </p>
                        <p className="font-paragraph text-xs text-secondary">
                          Current stock: {item.currentStock} | Reorder level: {item.reorderLevel}
                        </p>
                      </div>
                    </div>
                  ))
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
