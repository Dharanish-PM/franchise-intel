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
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { subDays, startOfDay, endOfDay } from 'date-fns';

interface OrderAnalyticsPageProps {
  role: 'admin' | 'store' | 'brand';
}

export default function OrderAnalyticsPage({ role }: OrderAnalyticsPageProps) {
  const [orders, setOrders] = useState<Orders[]>([]);
  const [stores, setStores] = useState<Stores[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Orders[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [customerNameFilter, setCustomerNameFilter] = useState('');
  const [chartView, setChartView] = useState<'value' | 'quantity'>('value');
  
  // Initialize with All time (no date range)
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
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

  // Fetch recent orders when store or page changes
  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!selectedStoreId) return;
      
      try {
        let url = `http://localhost:8080/api/store/recentOrders/${selectedStoreId}?pageNumber=${currentPage}&pageSize=${pageSize}`;
        if (dateRange?.from && dateRange?.to) {
          const startDate = dateRange.from.toLocaleDateString('en-GB').replace(/\//g, '-');
          const endDate = dateRange.to.toLocaleDateString('en-GB').replace(/\//g, '-');
          url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'success' || data.success) {
          let orders = [];
          if (data.data?.content) {
            orders = data.data.content;
          } else if (data.data?.orders) {
            orders = data.data.orders;
          } else if (data.data && Array.isArray(data.data)) {
            orders = data.data;
          } else if (data.orders) {
            orders = data.orders;
          } else if (Array.isArray(data)) {
            orders = data;
          }
          
          setRecentOrders(orders);
          
          const totalCount = data.data?.totalElements || data.data?.totalCount || data.totalCount || orders.length;
          setTotalPages(data.data?.totalPages || Math.ceil(totalCount / pageSize));
        }
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      }
    };

    fetchRecentOrders();
  }, [selectedStoreId, currentPage, pageSize, dateRange]);

  // Fetch top products when store changes
  useEffect(() => {
    const fetchTopProducts = async () => {
      if (!selectedStoreId) return;
      
      try {
        let url = `http://localhost:8080/api/store/${selectedStoreId}/top-products`;
        if (dateRange?.from && dateRange?.to) {
          const startDate = dateRange.from.toLocaleDateString('en-GB').replace(/\//g, '-');
          const endDate = dateRange.to.toLocaleDateString('en-GB').replace(/\//g, '-');
          url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'success') {
          setTopProducts(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching top products:', error);
      }
    };

    fetchTopProducts();
  }, [selectedStoreId, dateRange]);

  // Fetch store data when store or date range changes
  useEffect(() => {
    const fetchStoreData = async () => {
      if (!selectedStoreId) return;
      
      try {
        let url = `http://localhost:8080/api/store/${selectedStoreId}`;
        // Only add date parameters if dateRange is defined (not All time)
        if (dateRange?.from && dateRange?.to) {
          const startDate = dateRange.from.toLocaleDateString('en-GB').replace(/\//g, '-');
          const endDate = dateRange.to.toLocaleDateString('en-GB').replace(/\//g, '-');
          url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'success') {
          setStoreData(data.data);
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
      }
    };

    fetchStoreData();
  }, [selectedStoreId, dateRange]);

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

    if (orderIdFilter) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(orderIdFilter.toLowerCase())
      );
    }

    if (customerNameFilter) {
      filtered = filtered.filter(order =>
        order.customerName?.toLowerCase().includes(customerNameFilter.toLowerCase())
      );
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

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentMethod === paymentFilter);
    }

    if (dateRange?.from || dateRange?.to) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate || '');
        const from = dateRange?.from;
        const to = dateRange?.to;
        
        if (from && to) {
          return orderDate >= from && orderDate <= to;
        } else if (from) {
          return orderDate >= from;
        } else if (to) {
          return orderDate <= to;
        }
        return true;
      });
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, paymentFilter, orderIdFilter, customerNameFilter, dateRange, orders, selectedStoreId, role]);

  const totalRevenue = storeData?.summary?.totalRevenue || filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const avgOrderValue = storeData?.summary?.avgOrderValue || (totalRevenue / (filteredOrders.length || 1));
  const pendingOrders = storeData?.summary?.pendingOrders || filteredOrders.filter(o => o.orderStatus === 'Pending').length;
  const totalOrders = storeData?.summary?.totalOrders || filteredOrders.length;

  const ordersByDay = storeData?.ordersRevenueTrend ? 
    storeData.ordersRevenueTrend.labels.map((label: string, index: number) => ({
      day: label,
      orders: storeData.ordersRevenueTrend.orders[index],
      revenue: storeData.ordersRevenueTrend.revenue[index]
    })) : [
    { day: 'Mon', orders: 45, revenue: 12500 },
    { day: 'Tue', orders: 52, revenue: 14200 },
    { day: 'Wed', orders: 48, revenue: 13100 },
    { day: 'Thu', orders: 61, revenue: 16800 },
    { day: 'Fri', orders: 55, revenue: 15200 },
    { day: 'Sat', orders: 67, revenue: 18500 },
    { day: 'Sun', orders: 58, revenue: 16000 },
  ];

  const ordersByStatus = storeData?.orderStatusDistribution ? 
    storeData.orderStatusDistribution.labels.map((label: string, index: number) => ({
      name: label,
      value: storeData.orderStatusDistribution.counts[index]
    })) : [
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
          <div className="flex items-center space-x-4">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Select date range"
            />
            <Button className="bg-primary text-white hover:bg-primary/90 px-6 py-2">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
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
              <p className="font-heading text-4xl text-foreground">{totalOrders}</p>
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
              <p className="font-heading text-4xl text-foreground">${totalRevenue}</p>
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading text-2xl text-foreground">Orders & Revenue Trend</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setChartView('value')}
                    className={`px-3 py-1 rounded text-sm font-paragraph ${
                      chartView === 'value' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-secondary hover:bg-gray-200'
                    }`}
                  >
                    Revenue
                  </button>
                  <button
                    onClick={() => setChartView('quantity')}
                    className={`px-3 py-1 rounded text-sm font-paragraph ${
                      chartView === 'quantity' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-secondary hover:bg-gray-200'
                    }`}
                  >
                    Number of Orders
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ordersByDay} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F9FAFA" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6B7280" 
                    style={{ fontFamily: 'lato-light', fontSize: '12px' }} 
                    axisLine={true}
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#6B7280" style={{ fontFamily: 'lato-light' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #F9FAFA',
                      borderRadius: '8px',
                      fontFamily: 'lato-light',
                    }}
                  />
                  {chartView === 'value' ? (
                    <Bar dataKey="revenue" fill="#374151" radius={[8, 8, 0, 0]} />
                  ) : (
                    <Bar dataKey="orders" fill="#374151" radius={[8, 8, 0, 0]} />
                  )}
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
              <div className="flex items-center">
                <ResponsiveContainer width="70%" height={300}>
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => {
                        const data = props.payload;
                        const statusIndex = ordersByStatus.findIndex(item => item.name === name);
                        const revenue = storeData?.orderStatusDistribution?.revenue?.[statusIndex] || 0;
                        const percentage = storeData?.orderStatusDistribution?.percentages?.[statusIndex] || 0;
                        const revenuePercentage = ((revenue / totalRevenue) * 100).toFixed(1);
                        return [
                          <div key="tooltip-content" className="space-y-1">
                            <div>Order Quantity - {value} ({percentage}%)</div>
                            <div>Order Value - ${revenue} ({revenuePercentage}%)</div>
                          </div>,
                          name
                        ];
                      }}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #F9FAFA',
                        borderRadius: '8px',
                        fontFamily: 'lato-light',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-30% pl-4">
                  <div className="space-y-3">
                    {ordersByStatus.map((entry, index) => (
                      <div key={entry.name} className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-sm" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm font-paragraph text-foreground">
                          {entry.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Itemwise Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="mb-8"
        >
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-heading text-2xl text-foreground mb-6">Itemwise Sales</h3>
            <div className="space-y-4">
              {topProducts.length > 0 ? topProducts.map((product, index) => (
                <div key={product.productId || index} className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-paragraph text-sm text-foreground font-medium">
                        {product.productName}
                      </p>
                      <p className="font-paragraph text-xs text-secondary">
                        Category: {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-paragraph text-sm text-foreground font-medium">
                      ${(product.currentPrice * product.quantitiesSold).toFixed(2)}
                    </p>
                    <p className="font-paragraph text-xs text-secondary">
                      {product.quantitiesSold} units sold
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center font-paragraph text-secondary">
                  No product sales data available
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-2xl text-foreground">Recent Orders</h3>
            </div>
            
            {/* Custom Filters */}
            <div className="mb-6 p-4 bg-background rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Date Range"
                />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
                  <Input
                    type="text"
                    placeholder="Order ID"
                    value={orderIdFilter}
                    onChange={(e) => setOrderIdFilter(e.target.value)}
                    className="pl-10 font-paragraph h-10"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
                  <Input
                    type="text"
                    placeholder="Customer Name"
                    value={customerNameFilter}
                    onChange={(e) => setCustomerNameFilter(e.target.value)}
                    className="pl-10 font-paragraph h-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="font-paragraph h-10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="font-paragraph h-10">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Methods</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                  {recentOrders.length > 0 ? recentOrders.map((order, index) => (
                    <tr key={order.id || order._id || index} className="border-b border-gray-100 hover:bg-background transition-colors">
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">{order.id || order.orderNumber || 'N/A'}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">{order.customerName || order.customer || 'N/A'}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground font-medium">
                        ${(order.totalAmount || order.amount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`${
                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.status || order.orderStatus || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">{order.paymentMode || order.paymentMethod || 'N/A'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center font-paragraph text-secondary">
                        No recent orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="font-paragraph text-sm text-secondary">
                  Page {currentPage + 1} of {totalPages}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                    disabled={currentPage === 0}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                    disabled={currentPage === totalPages - 1}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
