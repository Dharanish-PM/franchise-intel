import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  paymentMethod: string;
  orderDate: Date;
}

export default function SalesOrdersPage() {
  const navigate = useNavigate();
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-1234',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      totalAmount: 450,
      status: 'Completed',
      paymentMethod: 'Credit Card',
      orderDate: new Date('2024-12-23'),
    },
    {
      id: '2',
      orderNumber: 'ORD-1233',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      totalAmount: 890,
      status: 'Pending',
      paymentMethod: 'Cash',
      orderDate: new Date('2024-12-23'),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout role="sales">
      <div className="p-8 max-w-[100rem] mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={() => navigate('/sales/dashboard')}
            variant="ghost"
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-heading text-5xl text-foreground mb-2">Sales Orders</h1>
            <p className="font-paragraph text-lg text-secondary">
              View and manage your sales orders
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-heading text-2xl text-foreground mb-6">Order History</h3>

            {/* Filters */}
            <div className="mb-6 p-4 bg-background rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
                  <Input
                    type="text"
                    placeholder="Search by order number or customer"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 font-paragraph h-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="font-paragraph h-10">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Email</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Amount</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Payment</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Date</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-background transition-colors">
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground font-medium">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">{order.customerName}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">{order.customerEmail}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">{order.paymentMethod}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`${
                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center font-paragraph text-secondary">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
