import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { Stores, Orders, Customers, InventoryItems } from '@/entities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import {
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface StoreMetrics {
  storeId: string;
  storeName: string;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  inventoryValue: number;
  lowStockItems: number;
  operationalStatus: boolean;
  avgOrderValue: number;
  customerCount: number;
}

export default function StoreComparisonPage() {
  const { user } = useUserStore();
  const [stores, setStores] = useState<Stores[]>([]);
  const [orders, setOrders] = useState<Orders[]>([]);
  
  const layoutRole = user?.role === 'ADMIN' ? 'admin' : user?.role === 'BRAND_MANAGER' ? 'brand' : 'store';
  const [customers, setCustomers] = useState<Customers[]>([]);
  const [inventory, setInventory] = useState<InventoryItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [storeMetrics, setStoreMetrics] = useState<StoreMetrics[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [storesData, ordersData, customersData, inventoryData] = await Promise.all([
        BaseCrudService.getAll<Stores>('stores'),
        BaseCrudService.getAll<Orders>('orders'),
        BaseCrudService.getAll<Customers>('customers'),
        BaseCrudService.getAll<InventoryItems>('inventoryitems'),
      ]);

      setStores(storesData.items);
      setOrders(ordersData.items);
      setCustomers(customersData.items);
      setInventory(inventoryData.items);

      // Calculate metrics for each store
      const metrics = storesData.items.map((store) => {
        const storeOrders = ordersData.items.filter(order => {
          if (Array.isArray(order.stores)) {
            return order.stores.some(s => s._id === store._id);
          }
          return false;
        });

        const storeCustomers = customersData.items.filter(customer => {
          if (Array.isArray(customer.orders)) {
            return customer.orders.some(order => storeOrders.some(so => so._id === order._id));
          }
          return false;
        });

        const storeInventory = inventoryData.items.filter(item => {
          if (Array.isArray(item.stores)) {
            return item.stores.some(s => s._id === store._id);
          }
          return false;
        });

        const totalRevenue = storeOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const inventoryValue = storeInventory.reduce(
          (sum, item) => sum + ((item.currentStock || 0) * (item.unitCost || 0)),
          0
        );
        const lowStockItems = storeInventory.filter(
          (item) => (item.currentStock || 0) <= (item.reorderLevel || 0)
        ).length;

        return {
          storeId: store._id,
          storeName: store.storeName || 'Unknown',
          totalRevenue,
          totalOrders: storeOrders.length,
          totalCustomers: storeCustomers.length,
          inventoryValue,
          lowStockItems,
          operationalStatus: store.operationalStatus ?? true,
          avgOrderValue: storeOrders.length > 0 ? totalRevenue / storeOrders.length : 0,
          customerCount: storeCustomers.length,
        };
      });

      setStoreMetrics(metrics);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleStoreSelect = (storeId: string) => {
    setSelectedStores((prev) =>
      prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStores.length === stores.length) {
      setSelectedStores([]);
    } else {
      setSelectedStores(stores.map((s) => s._id));
    }
  };

  const filteredMetrics = storeMetrics.filter((m) => selectedStores.includes(m.storeId));

  // Prepare data for charts
  const revenueData = filteredMetrics.map((m) => ({
    name: m.storeName,
    revenue: m.totalRevenue,
  }));

  const ordersData = filteredMetrics.map((m) => ({
    name: m.storeName,
    orders: m.totalOrders,
  }));

  const customersData = filteredMetrics.map((m) => ({
    name: m.storeName,
    customers: m.totalCustomers,
  }));

  const inventoryData = filteredMetrics.map((m) => ({
    name: m.storeName,
    value: m.inventoryValue,
    lowStock: m.lowStockItems,
  }));

  // Radar chart data for performance comparison
  const radarData = filteredMetrics.map((m) => {
    const maxRevenue = Math.max(...filteredMetrics.map((x) => x.totalRevenue), 1);
    const maxOrders = Math.max(...filteredMetrics.map((x) => x.totalOrders), 1);
    const maxCustomers = Math.max(...filteredMetrics.map((x) => x.totalCustomers), 1);

    return {
      store: m.storeName,
      revenue: Math.round((m.totalRevenue / maxRevenue) * 100),
      orders: Math.round((m.totalOrders / maxOrders) * 100),
      customers: Math.round((m.totalCustomers / maxCustomers) * 100),
      inventory: Math.round((m.inventoryValue / Math.max(...filteredMetrics.map((x) => x.inventoryValue), 1)) * 100),
    };
  });

  const handleExport = () => {
    const csv = [
      ['Store Name', 'Total Revenue', 'Total Orders', 'Avg Order Value', 'Total Customers', 'Inventory Value', 'Low Stock Items', 'Status'].join(','),
      ...filteredMetrics.map((m) => [
        m.storeName,
        m.totalRevenue.toFixed(2),
        m.totalOrders,
        m.avgOrderValue.toFixed(2),
        m.totalCustomers,
        m.inventoryValue.toFixed(2),
        m.lowStockItems,
        m.operationalStatus ? 'Active' : 'Inactive',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `store-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <DashboardLayout role={layoutRole}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading store data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={layoutRole}>
      <div className="p-8 max-w-[100rem] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-5xl text-foreground mb-2">Store Comparison</h1>
            <p className="font-paragraph text-lg text-secondary">
              Compare performance metrics across multiple stores
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={selectedStores.length === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-auto py-3 px-6"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Comparison
          </Button>
        </div>

        {/* Store Selection */}
        <Card className="p-6 bg-white rounded-xl shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-xl text-foreground">Select Stores to Compare</h3>
            <Button
              onClick={handleSelectAll}
              variant="outline"
              size="sm"
              className="rounded-lg"
            >
              {selectedStores.length === stores.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storeMetrics.map((metric) => (
              <div
                key={metric.storeId}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-background transition-colors cursor-pointer"
                onClick={() => handleStoreSelect(metric.storeId)}
              >
                <Checkbox
                  checked={selectedStores.includes(metric.storeId)}
                  onCheckedChange={() => handleStoreSelect(metric.storeId)}
                  className="rounded"
                />
                <div className="flex-1">
                  <p className="font-paragraph text-sm text-foreground font-medium">
                    {metric.storeName}
                  </p>
                  <p className="font-paragraph text-xs text-secondary">
                    ${metric.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} revenue
                  </p>
                </div>
                <Badge
                  className={`${
                    metric.operationalStatus
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {metric.operationalStatus ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {selectedStores.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h3 className="font-heading text-2xl text-foreground mb-2">No stores selected</h3>
            <p className="font-paragraph text-secondary">
              Select at least one store to view comparison metrics
            </p>
          </div>
        ) : (
          <>
            {/* Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="p-6 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-background rounded-xl">
                      <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-paragraph text-sm text-secondary mb-2">Combined Revenue</h3>
                  <p className="font-heading text-4xl text-foreground">
                    ${(filteredMetrics.reduce((sum, m) => sum + m.totalRevenue, 0) / 1000).toFixed(1)}K
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                <Card className="p-6 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-background rounded-xl">
                      <ShoppingCart className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-paragraph text-sm text-secondary mb-2">Combined Orders</h3>
                  <p className="font-heading text-4xl text-foreground">
                    {filteredMetrics.reduce((sum, m) => sum + m.totalOrders, 0)}
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className="p-6 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-background rounded-xl">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-paragraph text-sm text-secondary mb-2">Combined Customers</h3>
                  <p className="font-heading text-4xl text-foreground">
                    {filteredMetrics.reduce((sum, m) => sum + m.totalCustomers, 0)}
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <Card className="p-6 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-background rounded-xl">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-paragraph text-sm text-secondary mb-2">Combined Inventory</h3>
                  <p className="font-heading text-4xl text-foreground">
                    ${(filteredMetrics.reduce((sum, m) => sum + m.inventoryValue, 0) / 1000).toFixed(1)}K
                  </p>
                </Card>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="p-6 bg-white rounded-xl shadow-sm">
                  <h3 className="font-heading text-2xl text-foreground mb-6">Revenue Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
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

              {/* Orders Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <Card className="p-6 bg-white rounded-xl shadow-sm">
                  <h3 className="font-heading text-2xl text-foreground mb-6">Orders Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ordersData}>
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
                      <Bar dataKey="orders" fill="#6B7280" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              {/* Customers Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card className="p-6 bg-white rounded-xl shadow-sm">
                  <h3 className="font-heading text-2xl text-foreground mb-6">Customers Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={customersData}>
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
                      <Line
                        type="monotone"
                        dataKey="customers"
                        stroke="#A89984"
                        strokeWidth={2}
                        dot={{ fill: '#A89984', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              {/* Performance Radar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <Card className="p-6 bg-white rounded-xl shadow-sm">
                  <h3 className="font-heading text-2xl text-foreground mb-6">Performance Radar</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#F9FAFA" />
                      <PolarAngleAxis dataKey="store" stroke="#6B7280" style={{ fontFamily: 'lato-light' }} />
                      <PolarRadiusAxis stroke="#6B7280" style={{ fontFamily: 'lato-light' }} />
                      <Radar name="Revenue" dataKey="revenue" stroke="#374151" fill="#374151" fillOpacity={0.25} />
                      <Radar name="Orders" dataKey="orders" stroke="#6B7280" fill="#6B7280" fillOpacity={0.25} />
                      <Radar name="Customers" dataKey="customers" stroke="#A89984" fill="#A89984" fillOpacity={0.25} />
                      <Legend />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #F9FAFA',
                          borderRadius: '8px',
                          fontFamily: 'lato-light',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </div>

            {/* Detailed Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="p-6 bg-white rounded-xl shadow-sm">
                <h3 className="font-heading text-2xl text-foreground mb-6">Detailed Metrics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Store Name</th>
                        <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Revenue</th>
                        <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Orders</th>
                        <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Avg Order Value</th>
                        <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Customers</th>
                        <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Inventory Value</th>
                        <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Low Stock</th>
                        <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMetrics.map((metric) => (
                        <tr key={metric.storeId} className="border-b border-gray-100 hover:bg-background transition-colors">
                          <td className="py-3 px-4 font-paragraph text-sm text-foreground font-medium">
                            {metric.storeName}
                          </td>
                          <td className="py-3 px-4 font-paragraph text-sm text-foreground">
                            ${metric.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </td>
                          <td className="py-3 px-4 font-paragraph text-sm text-foreground">
                            {metric.totalOrders}
                          </td>
                          <td className="py-3 px-4 font-paragraph text-sm text-foreground">
                            ${metric.avgOrderValue.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 font-paragraph text-sm text-foreground">
                            {metric.totalCustomers}
                          </td>
                          <td className="py-3 px-4 font-paragraph text-sm text-foreground">
                            ${metric.inventoryValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </td>
                          <td className="py-3 px-4 font-paragraph text-sm">
                            <Badge
                              className={`${
                                metric.lowStockItems > 0
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {metric.lowStockItems}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-paragraph text-sm">
                            <Badge
                              className={`${
                                metric.operationalStatus
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {metric.operationalStatus ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>

            {/* Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="mt-8"
            >
              <Card className="p-6 bg-white rounded-xl shadow-sm">
                <h3 className="font-heading text-2xl text-foreground mb-6">Key Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const topStore = filteredMetrics.reduce((prev, current) =>
                      prev.totalRevenue > current.totalRevenue ? prev : current
                    );
                    const lowestStore = filteredMetrics.reduce((prev, current) =>
                      prev.totalRevenue < current.totalRevenue ? prev : current
                    );
                    const avgRevenue =
                      filteredMetrics.reduce((sum, m) => sum + m.totalRevenue, 0) / filteredMetrics.length;

                    return (
                      <>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
                            <div>
                              <p className="font-paragraph text-sm text-foreground mb-1">
                                Top Performer
                              </p>
                              <p className="font-paragraph text-xs text-secondary">
                                {topStore.storeName} leads with ${topStore.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} in revenue
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <TrendingDown className="w-5 h-5 text-blue-600 mt-1" />
                            <div>
                              <p className="font-paragraph text-sm text-foreground mb-1">
                                Growth Opportunity
                              </p>
                              <p className="font-paragraph text-xs text-secondary">
                                {lowestStore.storeName} has potential for ${(avgRevenue - lowestStore.totalRevenue).toLocaleString('en-US', { maximumFractionDigits: 0 })} growth
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <ShoppingCart className="w-5 h-5 text-purple-600 mt-1" />
                            <div>
                              <p className="font-paragraph text-sm text-foreground mb-1">
                                Average Order Value
                              </p>
                              <p className="font-paragraph text-xs text-secondary">
                                ${(filteredMetrics.reduce((sum, m) => sum + m.avgOrderValue, 0) / filteredMetrics.length).toFixed(2)} across selected stores
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Package className="w-5 h-5 text-orange-600 mt-1" />
                            <div>
                              <p className="font-paragraph text-sm text-foreground mb-1">
                                Inventory Health
                              </p>
                              <p className="font-paragraph text-xs text-secondary">
                                {filteredMetrics.reduce((sum, m) => sum + m.lowStockItems, 0)} items need restocking across stores
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
