import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { Orders, Stores } from '@/entities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Search, Filter, Download, TrendingUp, ShoppingCart, DollarSign, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { useStoreContext } from '@/store/storeContext';

interface OrderAnalyticsPageProps {
  role: 'admin' | 'store';
}

export default function OrderAnalyticsPage({ role }: OrderAnalyticsPageProps) {
  const [orders, setOrders] = useState<Orders[]>([]);
  const [stores, setStores] = useState<Stores[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Orders[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const { selectedStoreId, setSelectedStoreId } = useStoreContext();

  useEffect(() => {
    const fetchData = async () => {
      const [ordersData, storesData] = await Promise.all([
        BaseCrudService.getAll<Orders>('orders'),
        BaseCrudService.getAll<Stores>('stores'),
      ]);
      setOrders(ordersData.items);
      setStores(storesData.items);
      
      // Set first store as default if not already selected
      if (storesData.items.length > 0 && !selectedStoreId && role === 'store') {
        setSelectedStoreId(storesData.items[0]._id);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [selectedStoreId, setSelectedStoreId, role]);

  useEffect(() => {
    let filtered = [...orders];

    // Filter by store if in store manager role
    if (role === 'store' && selectedStoreId) {
      filtered = filtered.filter(order => {
        if (Array.isArray(order.stores)) {
          return order.stores.some(s => s._id === selectedStoreId);
        }
        return false;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateFilter === 'today') {
        filterDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === 'week') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        filterDate.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate || '');
        return orderDate >= filterDate;
      });
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, dateFilter, orders, selectedStoreId, role]);

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const avgOrderValue = totalRevenue / (filteredOrders.length || 1);
  const pendingOrders = filteredOrders.filter(o => o.orderStatus === 'Pending').length;

  const ordersByDay = [
    { day: 'Mon', orders: 45, revenue: 12500 },
    { day: 'Tue', orders: 52, revenue: 14200 },
    { day: 'Wed', orders: 48, revenue: 13100 },
    { day: 'Thu', orders: 61, revenue: 16800 },
    { day: 'Fri', orders: 55, revenue: 15200 },
    { day: 'Sat', orders: 67, revenue: 18500 },
    { day: 'Sun', orders: 58, revenue: 16000 },
  ];

  const ordersByStatus = [
    { name: 'Completed', value: filteredOrders.filter(o => o.orderStatus === 'Completed').length },
    { name: 'Pending', value: filteredOrders.filter(o => o.orderStatus === 'Pending').length },
    { name: 'Processing', value: filteredOrders.filter(o => o.orderStatus === 'Processing').length },
    { name: 'Cancelled', value: filteredOrders.filter(o => o.orderStatus === 'Cancelled').length },
  ];

  const COLORS = ['#374151', '#6B7280', '#A89984', '#EF4444'];

  const handleExport = () => {
    const csv = [
      ['Order Number', 'Customer', 'Date', 'Amount', 'Status', 'Payment Method'].join(','),
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.customerName,
        new Date(order.orderDate || '').toLocaleDateString(),
        order.totalAmount,
        order.orderStatus,
        order.paymentMethod,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading order analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="p-8 max-w-[100rem] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-5xl text-foreground mb-2">Order Analytics</h1>
            <p className="font-paragraph text-lg text-secondary">
              Comprehensive order data and insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {role === 'store' && stores.length > 0 && (
              <Select value={selectedStoreId || ''} onValueChange={setSelectedStoreId}>
                <SelectTrigger className="font-paragraph w-64">
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
            )}
            <Button
              onClick={handleExport}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-auto py-3 px-6"
            >
              <Download className="w-5 h-5 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-white rounded-xl shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-paragraph"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="font-paragraph">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="font-paragraph">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center justify-end">
              <span className="font-paragraph text-sm text-secondary">
                {filteredOrders.length} orders found
              </span>
            </div>
          </div>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Total Orders</h3>
              <p className="font-heading text-4xl text-foreground">{filteredOrders.length}</p>
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
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Total Revenue</h3>
              <p className="font-heading text-4xl text-foreground">${(totalRevenue / 1000).toFixed(1)}K</p>
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
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Avg Order Value</h3>
              <p className="font-heading text-4xl text-foreground">${avgOrderValue.toFixed(2)}</p>
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
                  <Clock className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Pending Orders</h3>
              <p className="font-heading text-4xl text-foreground">{pendingOrders}</p>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-heading text-2xl text-foreground mb-6">Orders & Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ordersByDay}>
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
                  <Legend />
                  <Bar dataKey="orders" fill="#374151" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="revenue" fill="#A89984" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-heading text-2xl text-foreground mb-6">Order Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry, index) => (
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

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-heading text-2xl text-foreground mb-6">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Order #</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Customer</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Date</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Amount</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice(0, 10).map((order) => (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-background transition-colors">
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">{order.orderNumber}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">{order.customerName}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">
                        {new Date(order.orderDate || '').toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground font-medium">
                        ${order.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`${
                            order.orderStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.orderStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">{order.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
