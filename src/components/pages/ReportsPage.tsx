import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { Orders, Customers, InventoryItems, Stores } from '@/entities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react';

interface ReportsPageProps {
  role: 'admin' | 'store';
}

export default function ReportsPage({ role }: ReportsPageProps) {
  const [orders, setOrders] = useState<Orders[]>([]);
  const [customers, setCustomers] = useState<Customers[]>([]);
  const [inventory, setInventory] = useState<InventoryItems[]>([]);
  const [stores, setStores] = useState<Stores[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('month');

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
      setLoading(false);
    };

    fetchData();
  }, []);

  const generateSalesReport = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = totalRevenue / (orders.length || 1);
    
    const csv = [
      ['Sales Report', `Generated: ${new Date().toLocaleDateString()}`],
      ['Date Range', dateRange],
      [''],
      ['Metric', 'Value'],
      ['Total Orders', orders.length.toString()],
      ['Total Revenue', `$${totalRevenue.toFixed(2)}`],
      ['Average Order Value', `$${avgOrderValue.toFixed(2)}`],
      ['Completed Orders', orders.filter(o => o.orderStatus === 'Completed').length.toString()],
      ['Pending Orders', orders.filter(o => o.orderStatus === 'Pending').length.toString()],
      [''],
      ['Order Number', 'Customer', 'Date', 'Amount', 'Status'],
      ...orders.map(order => [
        order.orderNumber,
        order.customerName,
        new Date(order.orderDate || '').toLocaleDateString(),
        order.totalAmount?.toFixed(2),
        order.orderStatus,
      ].join(','))
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

    downloadCSV(csv, `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const generateCustomerReport = () => {
    const totalSpend = customers.reduce((sum, customer) => sum + (customer.totalSpend || 0), 0);
    const avgSpend = totalSpend / (customers.length || 1);
    
    const csv = [
      ['Customer Report', `Generated: ${new Date().toLocaleDateString()}`],
      [''],
      ['Metric', 'Value'],
      ['Total Customers', customers.length.toString()],
      ['Total Customer Spend', `$${totalSpend.toFixed(2)}`],
      ['Average Customer Value', `$${avgSpend.toFixed(2)}`],
      [''],
      ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spend', 'Registration Date'],
      ...customers.map(customer => [
        customer.customerName,
        customer.email,
        customer.phoneNumber,
        customer.totalOrders,
        customer.totalSpend?.toFixed(2),
        new Date(customer.registrationDate || '').toLocaleDateString(),
      ].join(','))
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

    downloadCSV(csv, `customer-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const generateInventoryReport = () => {
    const totalValue = inventory.reduce((sum, item) => 
      sum + ((item.currentStock || 0) * (item.unitCost || 0)), 0
    );
    const lowStockItems = inventory.filter(item => 
      (item.currentStock || 0) <= (item.reorderLevel || 0)
    );
    
    const csv = [
      ['Inventory Report', `Generated: ${new Date().toLocaleDateString()}`],
      [''],
      ['Metric', 'Value'],
      ['Total Items', inventory.length.toString()],
      ['Total Inventory Value', `$${totalValue.toFixed(2)}`],
      ['Low Stock Items', lowStockItems.length.toString()],
      ['Out of Stock Items', inventory.filter(i => (i.currentStock || 0) === 0).length.toString()],
      [''],
      ['Item Name', 'SKU', 'Current Stock', 'Reorder Level', 'Unit Cost', 'Total Value'],
      ...inventory.map(item => [
        item.itemName,
        item.sku,
        item.currentStock,
        item.reorderLevel,
        item.unitCost?.toFixed(2),
        ((item.currentStock || 0) * (item.unitCost || 0)).toFixed(2),
      ].join(','))
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

    downloadCSV(csv, `inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const generateStorePerformanceReport = () => {
    const csv = [
      ['Store Performance Report', `Generated: ${new Date().toLocaleDateString()}`],
      [''],
      ['Store Name', 'Address', 'Status', 'Phone', 'Email'],
      ...stores.map(store => [
        store.storeName,
        store.address,
        store.operationalStatus ? 'Active' : 'Inactive',
        store.phoneNumber,
        store.emailAddress,
      ].join(','))
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

    downloadCSV(csv, `store-performance-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    switch (reportType) {
      case 'sales':
        generateSalesReport();
        break;
      case 'customers':
        generateCustomerReport();
        break;
      case 'inventory':
        generateInventoryReport();
        break;
      case 'stores':
        generateStorePerformanceReport();
        break;
    }
  };

  const reportTypes = [
    {
      id: 'sales',
      name: 'Sales Report',
      description: 'Comprehensive sales data including orders, revenue, and trends',
      icon: TrendingUp,
    },
    {
      id: 'customers',
      name: 'Customer Report',
      description: 'Customer demographics, behavior, and spending patterns',
      icon: FileText,
    },
    {
      id: 'inventory',
      name: 'Inventory Report',
      description: 'Stock levels, values, and reorder alerts',
      icon: FileText,
    },
  ];

  if (role === 'admin') {
    reportTypes.push({
      id: 'stores',
      name: 'Store Performance Report',
      description: 'Performance metrics across all store locations',
      icon: FileText,
    });
  }

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading reports...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="p-8 max-w-[100rem] mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-5xl text-foreground mb-2">Reports & Analytics</h1>
          <p className="font-paragraph text-lg text-secondary">
            Generate and export comprehensive business reports
          </p>
        </div>

        {/* Report Configuration */}
        <Card className="p-8 bg-white rounded-xl shadow-sm mb-8">
          <h2 className="font-heading text-2xl text-foreground mb-6">Generate Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="font-paragraph text-sm text-secondary mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="font-paragraph">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="customers">Customer Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  {role === 'admin' && <SelectItem value="stores">Store Performance Report</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-paragraph text-sm text-secondary mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="font-paragraph">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-auto py-3"
              >
                <Download className="w-5 h-5 mr-2" />
                Generate & Download
              </Button>
            </div>
          </div>
        </Card>

        {/* Available Reports */}
        <div className="mb-8">
          <h2 className="font-heading text-3xl text-foreground mb-6">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-background rounded-xl">
                      <report.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-xl text-foreground mb-2">{report.name}</h3>
                      <p className="font-paragraph text-sm text-secondary mb-4">
                        {report.description}
                      </p>
                      <Button
                        onClick={() => {
                          setReportType(report.id);
                          handleGenerateReport();
                        }}
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Total Orders</h3>
              <p className="font-heading text-4xl text-foreground">{orders.length}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Total Customers</h3>
              <p className="font-heading text-4xl text-foreground">{customers.length}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Inventory Items</h3>
              <p className="font-heading text-4xl text-foreground">{inventory.length}</p>
            </Card>
          </motion.div>

          {role === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
            >
              <Card className="p-6 bg-white rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-background rounded-xl">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-paragraph text-sm text-secondary mb-2">Active Stores</h3>
                <p className="font-heading text-4xl text-foreground">
                  {stores.filter(s => s.operationalStatus).length}
                </p>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
