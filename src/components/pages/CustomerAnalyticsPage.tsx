import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { Customers, Stores } from '@/entities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Search, Download, Users, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useStoreContext } from '@/store/storeContext';

interface CustomerAnalyticsPageProps {
  role: 'admin' | 'store';
}

export default function CustomerAnalyticsPage({ role }: CustomerAnalyticsPageProps) {
  const [customers, setCustomers] = useState<Customers[]>([]);
  const [stores, setStores] = useState<Stores[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customers[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const { selectedStoreId, setSelectedStoreId } = useStoreContext();

  useEffect(() => {
    const fetchData = async () => {
      const [customersData, storesData] = await Promise.all([
        BaseCrudService.getAll<Customers>('customers', ['orders']),
        BaseCrudService.getAll<Stores>('stores'),
      ]);
      setCustomers(customersData.items);
      setStores(storesData.items);
      setFilteredCustomers(customersData.items);
      
      // Set first store as default if not already selected
      if (storesData.items.length > 0 && !selectedStoreId && role === 'store') {
        setSelectedStoreId(storesData.items[0]._id);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [selectedStoreId, setSelectedStoreId, role]);

  useEffect(() => {
    let filtered = [...customers];

    if (searchQuery) {
      filtered = filtered.filter(customer =>
        customer.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (genderFilter !== 'all') {
      filtered = filtered.filter(customer => customer.gender === genderFilter);
    }

    setFilteredCustomers(filtered);
  }, [searchQuery, genderFilter, customers]);

  const totalSpend = filteredCustomers.reduce((sum, customer) => sum + (customer.totalSpend || 0), 0);
  const avgSpend = totalSpend / (filteredCustomers.length || 1);
  const totalOrders = filteredCustomers.reduce((sum, customer) => sum + (customer.totalOrders || 0), 0);

  const customerGrowth = [
    { month: 'Jan', customers: 120 },
    { month: 'Feb', customers: 145 },
    { month: 'Mar', customers: 168 },
    { month: 'Apr', customers: 195 },
    { month: 'May', customers: 220 },
    { month: 'Jun', customers: 252 },
  ];

  const genderDistribution = [
    { name: 'Male', value: filteredCustomers.filter(c => c.gender === 'Male').length },
    { name: 'Female', value: filteredCustomers.filter(c => c.gender === 'Female').length },
    { name: 'Other', value: filteredCustomers.filter(c => c.gender === 'Other').length },
  ];

  const spendingSegments = [
    { segment: 'High Value', customers: 45, avgSpend: 5000 },
    { segment: 'Medium Value', customers: 120, avgSpend: 2500 },
    { segment: 'Low Value', customers: 87, avgSpend: 800 },
  ];

  const COLORS = ['#374151', '#6B7280', '#A89984'];

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Gender', 'Total Orders', 'Total Spend', 'Registration Date'].join(','),
      ...filteredCustomers.map(customer => [
        customer.customerName,
        customer.email,
        customer.phoneNumber,
        customer.gender,
        customer.totalOrders,
        customer.totalSpend,
        new Date(customer.registrationDate || '').toLocaleDateString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading customer analytics...</p>
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
            <h1 className="font-heading text-5xl text-foreground mb-2">Customer Analytics</h1>
            <p className="font-paragraph text-lg text-secondary">
              Customer behavior and demographics insights
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
              <Input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-paragraph"
              />
            </div>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="font-paragraph">
                <SelectValue placeholder="Filter by gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
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
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Total Customers</h3>
              <p className="font-heading text-4xl text-foreground">{filteredCustomers.length}</p>
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
              <h3 className="font-paragraph text-sm text-secondary mb-2">Total Spend</h3>
              <p className="font-heading text-4xl text-foreground">${(totalSpend / 1000).toFixed(1)}K</p>
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
              <h3 className="font-paragraph text-sm text-secondary mb-2">Avg Customer Value</h3>
              <p className="font-heading text-4xl text-foreground">${avgSpend.toFixed(2)}</p>
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
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Total Orders</h3>
              <p className="font-heading text-4xl text-foreground">{totalOrders}</p>
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
              <h3 className="font-heading text-2xl text-foreground mb-6">Customer Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F9FAFA" />
                  <XAxis dataKey="month" stroke="#6B7280" style={{ fontFamily: 'lato-light' }} />
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
                    stroke="#374151"
                    strokeWidth={2}
                    dot={{ fill: '#374151', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-heading text-2xl text-foreground mb-6">Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderDistribution.map((entry, index) => (
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

        {/* Spending Segments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-heading text-2xl text-foreground mb-6">Customer Segments by Spending</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendingSegments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F9FAFA" />
                <XAxis dataKey="segment" stroke="#6B7280" style={{ fontFamily: 'lato-light' }} />
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
                <Bar dataKey="customers" fill="#374151" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avgSpend" fill="#A89984" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Customers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-heading text-2xl text-foreground mb-6">Customer List</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Name</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Email</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Phone</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Gender</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Orders</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Total Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.slice(0, 10).map((customer) => (
                    <tr key={customer._id} className="border-b border-gray-100 hover:bg-background transition-colors">
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">{customer.customerName}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">{customer.email}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">{customer.phoneNumber}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">{customer.gender}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">{customer.totalOrders}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground font-medium">
                        ${customer.totalSpend?.toFixed(2)}
                      </td>
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
