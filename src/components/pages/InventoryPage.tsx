import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { InventoryItems, Stores } from '@/entities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Search, Package, AlertTriangle, TrendingUp, DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useStoreContext } from '@/store/storeContext';
import { useInventoryStats } from '@/hooks/use-inventory-stats';
import { useInventoryItems } from '@/hooks/use-inventory-items';
import { useUserStore } from '@/store/userStore';

interface InventoryPageProps {
  role: 'admin' | 'store' | 'brand';
}

export default function InventoryPage({ role }: InventoryPageProps) {
  const [inventory, setInventory] = useState<InventoryItems[]>([]);
  const [stores, setStores] = useState<Stores[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'enough' | 'low' | 'out'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItems | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(12);
  const { selectedStoreId, setSelectedStoreId } = useStoreContext();
  const { user } = useUserStore();
  
  // Use API stats for the current store/franchise
  const currentStoreId = selectedStoreId ? parseInt(selectedStoreId) : user?.storeId || user?.franchiseId;
  const { stats, loading: statsLoading, error: statsError } = useInventoryStats(currentStoreId);
  const searchTerm = searchQuery.length >= 3 ? searchQuery : '';
  const stockStatusParam = stockFilter === 'all' ? '' : stockFilter.toUpperCase();
  const { items: apiItems, pagination, loading: itemsLoading, error: itemsError } = useInventoryItems(currentStoreId, currentPage, pageSize, searchTerm, stockStatusParam);
  const [formData, setFormData] = useState({
    itemName: '',
    sku: '',
    currentStock: 0,
    reorderLevel: 0,
    unitCost: 0,
    itemImage: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const storesData = await BaseCrudService.getAll<Stores>('stores');
      setStores(storesData.items);
      
      // Set first store as default if not already selected
      if (storesData.items.length > 0 && !selectedStoreId && role === 'store') {
        setSelectedStoreId(storesData.items[0]._id);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [selectedStoreId, setSelectedStoreId, role]);

  // Use API items directly
  const displayItems = apiItems;
  
  const totalValue = statsError ? 0 : stats.totalValue;
  
  const totalItems = statsError ? 0 : stats.totalItems;
  const lowStockCount = statsError ? 0 : stats.lowStockCount;
  const outOfStockCount = statsError ? 0 : stats.outOfStockCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      await BaseCrudService.update<InventoryItems>('inventoryitems', {
        _id: editingItem._id,
        ...formData,
      });
    } else {
      await BaseCrudService.create('inventoryitems', {
        _id: crypto.randomUUID(),
        ...formData,
      });
    }

    setIsDialogOpen(false);
    setEditingItem(null);
    resetForm();
    const inventoryData = await BaseCrudService.getAll<InventoryItems>('inventoryitems');
    setInventory(inventoryData.items);
    setFilteredInventory(inventoryData.items);
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      sku: '',
      currentStock: 0,
      reorderLevel: 0,
      unitCost: 0,
      itemImage: '',
    });
  };

  const handleEdit = (item: InventoryItems) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName || '',
      sku: item.sku || '',
      currentStock: item.currentStock || 0,
      reorderLevel: item.reorderLevel || 0,
      unitCost: item.unitCost || 0,
      itemImage: item.itemImage || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await BaseCrudService.delete('inventoryitems', id);
      const inventoryData = await BaseCrudService.getAll<InventoryItems>('inventoryitems');
      setInventory(inventoryData.items);
      setFilteredInventory(inventoryData.items);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading inventory...</p>
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
            <h1 className="font-heading text-5xl text-foreground mb-2">Inventory Management</h1>
            <p className="font-paragraph text-lg text-secondary">
              Track and manage inventory levels
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-auto py-3 px-6">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">
                    {editingItem ? 'Edit Item' : 'Add New Item'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="itemName" className="font-paragraph">Item Name</Label>
                    <Input
                      id="itemName"
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      required
                      className="font-paragraph"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku" className="font-paragraph">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                      className="font-paragraph"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentStock" className="font-paragraph">Current Stock</Label>
                      <Input
                        id="currentStock"
                        type="number"
                        value={formData.currentStock}
                        onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                        required
                        className="font-paragraph"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reorderLevel" className="font-paragraph">Reorder Level</Label>
                      <Input
                        id="reorderLevel"
                        type="number"
                        value={formData.reorderLevel}
                        onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                        required
                        className="font-paragraph"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="unitCost" className="font-paragraph">Unit Cost ($)</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      step="0.01"
                      value={formData.unitCost}
                      onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                      required
                      className="font-paragraph"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemImage" className="font-paragraph">Item Image URL</Label>
                    <Input
                      id="itemImage"
                      value={formData.itemImage}
                      onChange={(e) => setFormData({ ...formData, itemImage: e.target.value })}
                      className="font-paragraph"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingItem(null);
                        resetForm();
                      }}
                      className="rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                      {editingItem ? 'Update' : 'Create'} Item
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
                  <Package className="w-6 h-6 text-primary" />
                </div>
                {statsLoading && <div className="w-4 h-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />}
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Total Items</h3>
              <p className="font-heading text-4xl text-foreground">
                {statsLoading ? '...' : totalItems}
              </p>
              {statsError && <p className="text-xs text-red-500 mt-1">Using local data</p>}
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
                {statsLoading && <div className="w-4 h-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />}
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Total Value</h3>
              <p className="font-heading text-4xl text-foreground">
                {statsLoading ? '...' : `$${(totalValue / 1000).toFixed(1)}K`}
              </p>
              {statsError && <p className="text-xs text-red-500 mt-1">Using local data</p>}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                {statsLoading && <div className="w-4 h-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />}
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Low Stock</h3>
              <p className="font-heading text-4xl text-foreground">
                {statsLoading ? '...' : lowStockCount}
              </p>
              {statsError && <p className="text-xs text-red-500 mt-1">Using local data</p>}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-destructive" />
                </div>
                {statsLoading && <div className="w-4 h-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />}
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Out of Stock</h3>
              <p className="font-heading text-4xl text-foreground">
                {statsLoading ? '...' : outOfStockCount}
              </p>
              {statsError && <p className="text-xs text-red-500 mt-1">Using local data</p>}
            </Card>
          </motion.div>
        </div>

        {/* Search */}
        <Card className="p-6 bg-white rounded-xl shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
              <Input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(0);
                }}
                className="pl-10 font-paragraph"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={stockFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStockFilter('all');
                  setCurrentPage(0);
                }}
                className="rounded-lg"
              >
                All
              </Button>
              <Button
                variant={stockFilter === 'enough' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStockFilter('enough');
                  setCurrentPage(0);
                }}
                className="rounded-lg"
              >
                Enough Stock
              </Button>
              <Button
                variant={stockFilter === 'low' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStockFilter('low');
                  setCurrentPage(0);
                }}
                className="rounded-lg"
              >
                Low Stock
              </Button>
              <Button
                variant={stockFilter === 'out' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStockFilter('out');
                  setCurrentPage(0);
                }}
                className="rounded-lg"
              >
                Out of Stock
              </Button>
            </div>
          </div>
        </Card>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px] relative">
          {itemsLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 col-span-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="font-paragraph text-secondary">Loading items...</p>
              </div>
            </div>
          )}
          {displayItems.map((item, index) => {
            const itemId = 'itemId' in item ? item.itemId : item._id;
            const itemName = 'itemName' in item ? item.itemName : '';
            const stock = 'stock' in item ? item.stock : item.currentStock || 0;
            const reorderValue = 'reorderValue' in item ? item.reorderValue : item.reorderLevel || 0;
            const costPerQuantity = 'costPerQuantity' in item ? item.costPerQuantity : item.unitCost || 0;
            const totalValue = 'totalValue' in item ? item.totalValue : stock * costPerQuantity;
            const itemImage = 'imageUrl' in item ? item.imageUrl : ('itemImage' in item ? item.itemImage : null);
            
            return (
              <motion.div
                key={itemId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.02 }}
              >
                <Card className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-3">
                    <Image
                      src={itemImage || 'https://via.placeholder.com/200x128?text=No+Image'}
                      alt={itemName || 'Item image'}
                      width={200}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="font-heading text-lg text-foreground mb-1">{itemName}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-paragraph text-xs text-secondary">Stock</span>
                      <Badge
                        className={`${
                          stock === 0 ? 'bg-red-100 text-red-800' :
                          stock <= (reorderValue || 0) ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {stock} units
                      </Badge>
                    </div>
                    {reorderValue !== null && (
                      <div className="flex items-center justify-between">
                        <span className="font-paragraph text-xs text-secondary">Reorder Level</span>
                        <span className="font-paragraph text-xs text-foreground">{reorderValue}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-paragraph text-xs text-secondary">Unit Cost</span>
                      <span className="font-paragraph text-xs text-foreground font-medium">
                        ${(costPerQuantity / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="font-paragraph text-xs text-secondary">Total Value</span>
                      <span className="font-paragraph text-sm text-foreground font-medium">
                        ${(totalValue / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {!itemsError && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEdit(item as any)}
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(String(itemId))}
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {displayItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h3 className="font-heading text-2xl text-foreground mb-2">No items found</h3>
            <p className="font-paragraph text-secondary">
              {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first item'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!itemsError && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              variant="outline"
              size="sm"
              className="rounded-lg"
            >
              Previous
            </Button>
            <span className="font-paragraph text-sm text-secondary px-4">
              Page {currentPage + 1} of {pagination.totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages - 1, prev + 1))}
              disabled={currentPage >= pagination.totalPages - 1}
              variant="outline"
              size="sm"
              className="rounded-lg"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
