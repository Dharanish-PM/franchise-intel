import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  RotateCcw,
  Plus,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    pendingReturns: 0,
    monthlyTarget: 0,
    monthlyAchieved: 0,
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setStats({
        todaySales: 12450,
        todayOrders: 28,
        pendingReturns: 5,
        monthlyTarget: 150000,
        monthlyAchieved: 98500,
      });
      setLoading(false);
    }, 500);
  }, []);

  const salesTrend = [
    { day: 'Mon', sales: 4500 },
    { day: 'Tue', sales: 5200 },
    { day: 'Wed', sales: 4800 },
    { day: 'Thu', sales: 6100 },
    { day: 'Fri', sales: 5500 },
    { day: 'Sat', sales: 6700 },
    { day: 'Sun', sales: 5800 },
  ];

  const targetProgress = (stats.monthlyAchieved / stats.monthlyTarget) * 100;

  if (loading) {
    return (
      <DashboardLayout role="sales">
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
    <DashboardLayout role="sales">
      <div className="p-8 max-w-[100rem] mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-5xl text-foreground mb-2">Sales Dashboard</h1>
          <p className="font-paragraph text-lg text-secondary">
            Manage orders, customers, and returns
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => navigate('/sales/create-order')}
            className="h-20 bg-primary text-white hover:bg-primary/90 text-lg"
          >
            <Plus className="w-6 h-6 mr-2" />
            Create New Order
          </Button>
          <Button
            onClick={() => navigate('/sales/returns')}
            className="h-20 bg-orange-600 text-white hover:bg-orange-700 text-lg"
          >
            <RotateCcw className="w-6 h-6 mr-2" />
            Process Return
          </Button>
          <Button
            onClick={() => navigate('/sales/orders')}
            className="h-20 bg-blue-600 text-white hover:bg-blue-700 text-lg"
          >
            <Eye className="w-6 h-6 mr-2" />
            View Orders
          </Button>
        </div>

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
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Today's Sales</h3>
              <p className="font-heading text-4xl text-foreground">${stats.todaySales.toLocaleString()}</p>
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
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Today's Orders</h3>
              <p className="font-heading text-4xl text-foreground">{stats.todayOrders}</p>
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
                  <RotateCcw className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Pending Returns</h3>
              <p className="font-heading text-4xl text-foreground">{stats.pendingReturns}</p>
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
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Monthly Target</h3>
              <p className="font-heading text-2xl text-foreground">{targetProgress.toFixed(0)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${targetProgress}%` }}
                ></div>
              </div>
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
              <h3 className="font-heading text-2xl text-foreground mb-6">Weekly Sales Trend</h3>
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-heading text-2xl text-foreground mb-6">Daily Orders</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesTrend}>
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
                  <Bar dataKey="sales" fill="#374151" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-heading text-2xl text-foreground mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-paragraph text-sm text-foreground font-medium">
                      Order #ORD-1234 created
                    </p>
                    <p className="font-paragraph text-xs text-secondary">
                      Customer: John Doe - $450.00
                    </p>
                  </div>
                </div>
                <span className="font-paragraph text-xs text-secondary">2 mins ago</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-paragraph text-sm text-foreground font-medium">
                      Return processed for Order #ORD-1220
                    </p>
                    <p className="font-paragraph text-xs text-secondary">
                      Customer: Jane Smith - $120.00 refunded
                    </p>
                  </div>
                </div>
                <span className="font-paragraph text-xs text-secondary">15 mins ago</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-paragraph text-sm text-foreground font-medium">
                      Order #ORD-1233 delivered
                    </p>
                    <p className="font-paragraph text-xs text-secondary">
                      Customer: Mike Johnson - $890.00
                    </p>
                  </div>
                </div>
                <span className="font-paragraph text-xs text-secondary">1 hour ago</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
