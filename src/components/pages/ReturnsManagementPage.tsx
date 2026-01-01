import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Search, RotateCcw, CheckCircle, XCircle, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Return {
  id: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  amount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: Date;
}

export default function ReturnsManagementPage() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState<Return[]>([
    {
      id: '1',
      orderNumber: 'ORD-1234',
      customerName: 'John Doe',
      productName: 'Coffee Maker Pro',
      quantity: 1,
      amount: 450,
      reason: 'Defective product',
      status: 'Pending',
      requestDate: new Date('2024-12-23'),
    },
    {
      id: '2',
      orderNumber: 'ORD-1220',
      customerName: 'Jane Smith',
      productName: 'Espresso Machine',
      quantity: 1,
      amount: 120,
      reason: 'Wrong item received',
      status: 'Approved',
      requestDate: new Date('2024-12-22'),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleProcessReturn = (id: string, action: 'approve' | 'reject') => {
    setReturns(returns.map(ret => {
      if (ret.id === id) {
        return {
          ...ret,
          status: action === 'approve' ? 'Approved' : 'Rejected',
        };
      }
      return ret;
    }));
  };

  const handleCreateReturn = () => {
    if (!orderNumber || !customerName || !productName || !quantity || !amount || !reason) {
      alert('Please fill in all fields');
      return;
    }

    const newReturn: Return = {
      id: Date.now().toString(),
      orderNumber,
      customerName,
      productName,
      quantity: parseInt(quantity),
      amount: parseFloat(amount),
      reason,
      status: 'Pending',
      requestDate: new Date(),
    };

    setReturns([newReturn, ...returns]);
    
    // Reset form
    setOrderNumber('');
    setCustomerName('');
    setProductName('');
    setQuantity('');
    setAmount('');
    setReason('');
    setShowCreateModal(false);
  };

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = 
      ret.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = returns.filter(r => r.status === 'Pending').length;
  const approvedCount = returns.filter(r => r.status === 'Approved').length;
  const rejectedCount = returns.filter(r => r.status === 'Rejected').length;

  return (
    <DashboardLayout role="sales">
      <div className="p-8 max-w-[100rem] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              onClick={() => navigate('/sales/dashboard')}
              variant="ghost"
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-heading text-5xl text-foreground mb-2">Returns Management</h1>
              <p className="font-paragraph text-lg text-secondary">
                Process customer returns and refunds
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-white hover:bg-primary/90"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Return
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <RotateCcw className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Pending Returns</h3>
              <p className="font-heading text-4xl text-foreground">{pendingCount}</p>
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
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Approved</h3>
              <p className="font-heading text-4xl text-foreground">{approvedCount}</p>
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
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Rejected</h3>
              <p className="font-heading text-4xl text-foreground">{rejectedCount}</p>
            </Card>
          </motion.div>
        </div>

        {/* Returns Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-heading text-2xl text-foreground mb-6">All Returns</h3>

            {/* Filters */}
            <div className="mb-6 p-4 bg-background rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
                  <Input
                    type="text"
                    placeholder="Search by order, customer, or product"
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
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
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
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Product</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Qty</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Amount</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Reason</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Date</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.length > 0 ? filteredReturns.map((ret) => (
                    <tr key={ret.id} className="border-b border-gray-100 hover:bg-background transition-colors">
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground font-medium">
                        {ret.orderNumber}
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">{ret.customerName}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">{ret.productName}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">{ret.quantity}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground font-medium">
                        ${ret.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">{ret.reason}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`${
                            ret.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            ret.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {ret.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">
                        {new Date(ret.requestDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {ret.status === 'Pending' && (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleProcessReturn(ret.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleProcessReturn(ret.id, 'reject')}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center font-paragraph text-secondary">
                        No returns found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Create Return Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="font-heading text-2xl text-foreground mb-4">Create New Return</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-paragraph text-sm text-secondary mb-2">Order Number *</label>
                  <Input
                    type="text"
                    placeholder="ORD-1234"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="font-paragraph"
                  />
                </div>

                <div>
                  <label className="block font-paragraph text-sm text-secondary mb-2">Customer Name *</label>
                  <Input
                    type="text"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="font-paragraph"
                  />
                </div>

                <div>
                  <label className="block font-paragraph text-sm text-secondary mb-2">Product Name *</label>
                  <Input
                    type="text"
                    placeholder="Enter product name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="font-paragraph"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-paragraph text-sm text-secondary mb-2">Quantity *</label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="font-paragraph"
                    />
                  </div>
                  <div>
                    <label className="block font-paragraph text-sm text-secondary mb-2">Amount *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="font-paragraph"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-paragraph text-sm text-secondary mb-2">Reason *</label>
                  <Input
                    type="text"
                    placeholder="Enter return reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="font-paragraph"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <Button
                  onClick={handleCreateReturn}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create Return
                </Button>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
