import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { Stores, Orders, InventoryItems } from '@/entities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ExternalLink, Store, ShoppingCart, Package, DollarSign } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StoreProfilePage() {
  const { storeId } = useParams();
  const [store, setStore] = useState<Stores | null>(null);
  const [orders, setOrders] = useState<Orders[]>([]);
  const [inventory, setInventory] = useState<InventoryItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) return;

      const [storeData, ordersData, inventoryData] = await Promise.all([
        BaseCrudService.getById<Stores>('stores', storeId),
        BaseCrudService.getAll<Orders>('orders'),
        BaseCrudService.getAll<InventoryItems>('inventoryitems'),
      ]);

      setStore(storeData);
      setOrders(ordersData.items);
      setInventory(inventoryData.items);
      setLoading(false);
    };

    fetchData();
  }, [storeId]);

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading store profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!store) {
    return (
      <DashboardLayout role="admin">
        <div className="p-8 text-center">
          <h2 className="font-heading text-3xl text-foreground">Store not found</h2>
        </div>
      </DashboardLayout>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const lowStockItems = inventory.filter(item => 
    (item.currentStock || 0) <= (item.reorderLevel || 0)
  ).length;

  const monthlySales = [
    { month: 'Jan', sales: 45000 },
    { month: 'Feb', sales: 52000 },
    { month: 'Mar', sales: 48000 },
    { month: 'Apr', sales: 61000 },
    { month: 'May', sales: 55000 },
    { month: 'Jun', sales: 67000 },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="p-8 max-w-[100rem] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-8 bg-white rounded-xl shadow-sm mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                {store.storeImage && (
                  <Image
                    src={store.storeImage}
                    alt={store.storeName || 'Store image'}
                    width={400}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
                <div className="flex items-start justify-between mb-4">
                  <h1 className="font-heading text-4xl text-foreground">
                    {store.storeName}
                  </h1>
                  <Badge
                    className={`${
                      store.operationalStatus
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {store.operationalStatus ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {Array.isArray(store.franchises) && store.franchises.length > 0 && (
                  <p className="font-paragraph text-sm text-secondary mb-6">
                    Part of {store.franchises[0].franchiseName}
                  </p>
                )}
              </div>

              <div className="lg:col-span-2">
                <h2 className="font-heading text-2xl text-foreground mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-secondary mt-1" />
                      <div>
                        <p className="font-paragraph text-xs text-secondary mb-1">Address</p>
                        <p className="font-paragraph text-sm text-foreground">{store.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-secondary mt-1" />
                      <div>
                        <p className="font-paragraph text-xs text-secondary mb-1">Phone</p>
                        <p className="font-paragraph text-sm text-foreground">{store.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-secondary mt-1" />
                      <div>
                        <p className="font-paragraph text-xs text-secondary mb-1">Email</p>
                        <p className="font-paragraph text-sm text-foreground">{store.emailAddress}</p>
                      </div>
                    </div>
                    {store.storeWebsite && (
                      <div className="flex items-start space-x-3">
                        <ExternalLink className="w-5 h-5 text-secondary mt-1" />
                        <div>
                          <p className="font-paragraph text-xs text-secondary mb-1">Website</p>
                          <a
                            href={store.storeWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-paragraph text-sm text-primary hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Total Orders</h3>
              <p className="font-heading text-4xl text-foreground">{orders.length}</p>
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
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <Package className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Inventory Items</h3>
              <p className="font-heading text-4xl text-foreground">{inventory.length}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <Store className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Low Stock Items</h3>
              <p className="font-heading text-4xl text-foreground">{lowStockItems}</p>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-heading text-2xl text-foreground mb-6">Sales Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySales}>
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
                <Bar dataKey="sales" fill="#374151" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
