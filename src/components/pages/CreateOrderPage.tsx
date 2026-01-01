import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Plus, X, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentProduct, setCurrentProduct] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');

  const handleAddItem = () => {
    if (!currentProduct || !currentQuantity || !currentPrice) {
      alert('Please fill in all item fields');
      return;
    }

    const newItem: OrderItem = {
      id: Date.now().toString(),
      productName: currentProduct,
      quantity: parseInt(currentQuantity),
      price: parseFloat(currentPrice),
    };

    setOrderItems([...orderItems, newItem]);
    setCurrentProduct('');
    setCurrentQuantity('');
    setCurrentPrice('');
  };

  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmitOrder = () => {
    if (!customerName || !customerEmail || !customerPhone || !paymentMethod || orderItems.length === 0) {
      alert('Please fill in all required fields and add at least one item');
      return;
    }

    // Here you would make an API call to create the order
    console.log('Creating order:', {
      customer: { customerName, customerEmail, customerPhone },
      paymentMethod,
      items: orderItems,
      total: calculateTotal(),
    });

    alert('Order created successfully!');
    navigate('/sales/orders');
  };

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
            <h1 className="font-heading text-5xl text-foreground mb-2">Create New Order</h1>
            <p className="font-paragraph text-lg text-secondary">
              Add customer details and order items
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Details */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-6 bg-white rounded-xl shadow-sm mb-6">
                <h3 className="font-heading text-2xl text-foreground mb-4">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-paragraph text-sm text-secondary mb-2">
                      Customer Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="font-paragraph"
                    />
                  </div>
                  <div>
                    <label className="block font-paragraph text-sm text-secondary mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      placeholder="customer@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="font-paragraph"
                    />
                  </div>
                  <div>
                    <label className="block font-paragraph text-sm text-secondary mb-2">
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="font-paragraph"
                    />
                  </div>
                  <div>
                    <label className="block font-paragraph text-sm text-secondary mb-2">
                      Payment Method *
                    </label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="font-paragraph">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Debit Card">Debit Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Order Items */}
              <Card className="p-6 bg-white rounded-xl shadow-sm">
                <h3 className="font-heading text-2xl text-foreground mb-4">Order Items</h3>
                
                {/* Add Item Form */}
                <div className="mb-6 p-4 bg-background rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      type="text"
                      placeholder="Product name"
                      value={currentProduct}
                      onChange={(e) => setCurrentProduct(e.target.value)}
                      className="font-paragraph"
                    />
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={currentQuantity}
                      onChange={(e) => setCurrentQuantity(e.target.value)}
                      className="font-paragraph"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(e.target.value)}
                      className="font-paragraph"
                    />
                    <Button onClick={handleAddItem} className="bg-primary text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Items List */}
                {orderItems.length > 0 ? (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-background rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-paragraph text-sm text-foreground font-medium">
                            {item.productName}
                          </p>
                          <p className="font-paragraph text-xs text-secondary">
                            Qty: {item.quantity} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-secondary font-paragraph">
                    No items added yet. Add items using the form above.
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="p-6 bg-white rounded-xl shadow-sm sticky top-8">
                <h3 className="font-heading text-2xl text-foreground mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between font-paragraph text-sm">
                    <span className="text-secondary">Items</span>
                    <span className="text-foreground">{orderItems.length}</span>
                  </div>
                  <div className="flex justify-between font-paragraph text-sm">
                    <span className="text-secondary">Subtotal</span>
                    <span className="text-foreground">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-paragraph">
                    <span className="text-foreground font-medium">Total</span>
                    <span className="text-foreground font-bold text-xl">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitOrder}
                  className="w-full bg-primary text-white hover:bg-primary/90 h-12"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Create Order
                </Button>

                <Button
                  onClick={() => navigate('/sales/dashboard')}
                  variant="outline"
                  className="w-full mt-3"
                >
                  Cancel
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
