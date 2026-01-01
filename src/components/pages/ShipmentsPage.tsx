import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { InventoryItems, Stores } from '@/entities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Plus, Package, Truck, CheckCircle, Clock, Search, X } from 'lucide-react';
import { useStoreContext } from '@/store/storeContext';

interface ShipmentItem {
  itemId: string;
  itemName: string;
  quantity: number;
}

interface Shipment {
  _id: string;
  shipmentNumber: string;
  storeId: string;
  storeName: string;
  items: ShipmentItem[];
  status: 'In Transit' | 'Delivered' | 'Confirmed';
  shipmentDate: Date;
  deliveryDate?: Date;
  confirmationDate?: Date;
  notes?: string;
}

interface ShipmentsPageProps {
  role: 'brand' | 'store';
}

export default function ShipmentsPage({ role }: ShipmentsPageProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItems[]>([]);
  const [stores, setStores] = useState<Stores[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form state for creating shipment
  const [selectedStore, setSelectedStore] = useState('');
  const [shipmentItems, setShipmentItems] = useState<ShipmentItem[]>([]);
  const [currentItem, setCurrentItem] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [shipmentNotes, setShipmentNotes] = useState('');
  
  const { selectedStoreId, setSelectedStoreId } = useStoreContext();

  useEffect(() => {
    const fetchData = async () => {
      const [itemsData, storesData] = await Promise.all([
        BaseCrudService.getAll<InventoryItems>('inventoryitems'),
        BaseCrudService.getAll<Stores>('stores'),
      ]);
      setInventoryItems(itemsData.items);
      setStores(storesData.items);
      
      if (storesData.items.length > 0 && !selectedStoreId && role === 'store') {
        setSelectedStoreId(storesData.items[0]._id);
      }
      
      // Mock shipments data - replace with actual API call
      setShipments([
        {
          _id: '1',
          shipmentNumber: 'SHP-001',
          storeId: storesData.items[0]?._id || '',
          storeName: storesData.items[0]?.storeName || 'Downtown Store',
          items: [
            { itemId: '1', itemName: 'Coffee Beans - Premium Blend', quantity: 50 },
            { itemId: '2', itemName: 'Milk - Whole', quantity: 100 },
          ],
          status: 'In Transit',
          shipmentDate: new Date('2024-12-22'),
          notes: 'Handle with care'
        },
        {
          _id: '2',
          shipmentNumber: 'SHP-002',
          storeId: storesData.items[0]?._id || '',
          storeName: storesData.items[0]?.storeName || 'Downtown Store',
          items: [
            { itemId: '3', itemName: 'Sugar - White', quantity: 75 },
          ],
          status: 'Delivered',
          shipmentDate: new Date('2024-12-20'),
          deliveryDate: new Date('2024-12-23'),
        },
        {
          _id: '3',
          shipmentNumber: 'SHP-003',
          storeId: storesData.items[0]?._id || '',
          storeName: storesData.items[0]?.storeName || 'Downtown Store',
          items: [
            { itemId: '4', itemName: 'Cups - Medium', quantity: 150 },
          ],
          status: 'Confirmed',
          shipmentDate: new Date('2024-12-18'),
          deliveryDate: new Date('2024-12-21'),
          confirmationDate: new Date('2024-12-21'),
        },
      ]);
      
      setLoading(false);
    };

    fetchData();
  }, [selectedStoreId, setSelectedStoreId, role]);

  const handleAddItem = () => {
    if (!currentItem || !currentQuantity) {
      alert('Please select an item and enter quantity');
      return;
    }

    const item = inventoryItems.find(i => i._id === currentItem);
    if (!item) return;

    const newItem: ShipmentItem = {
      itemId: item._id,
      itemName: item.itemName || '',
      quantity: parseInt(currentQuantity),
    };

    setShipmentItems([...shipmentItems, newItem]);
    setCurrentItem('');
    setCurrentQuantity('');
  };

  const handleRemoveItem = (index: number) => {
    setShipmentItems(shipmentItems.filter((_, i) => i !== index));
  };

  const handleCreateShipment = () => {
    if (!selectedStore || shipmentItems.length === 0) {
      alert('Please select a store and add at least one item');
      return;
    }

    const store = stores.find(s => s._id === selectedStore);
    const newShipment: Shipment = {
      _id: Date.now().toString(),
      shipmentNumber: `SHP-${String(shipments.length + 1).padStart(3, '0')}`,
      storeId: selectedStore,
      storeName: store?.storeName || '',
      items: shipmentItems,
      status: 'In Transit',
      shipmentDate: new Date(),
      notes: shipmentNotes,
    };

    setShipments([newShipment, ...shipments]);
    
    // Reset form
    setSelectedStore('');
    setShipmentItems([]);
    setShipmentNotes('');
    setShowCreateModal(false);
  };

  const handleConfirmDelivery = (shipmentId: string) => {
    const updatedShipments = shipments.map(shipment => {
      if (shipment._id === shipmentId && shipment.status === 'Delivered') {
        // Here you would update inventory stocks
        return {
          ...shipment,
          status: 'Confirmed' as const,
          confirmationDate: new Date(),
        };
      }
      return shipment;
    });

    setShipments(updatedShipments);
  };

  const handleMarkAsDelivered = (shipmentId: string) => {
    const updatedShipments = shipments.map(shipment => {
      if (shipment._id === shipmentId && shipment.status === 'In Transit') {
        return {
          ...shipment,
          status: 'Delivered' as const,
          deliveryDate: new Date(),
        };
      }
      return shipment;
    });

    setShipments(updatedShipments);
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.shipmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    const matchesStore = role === 'brand' || shipment.storeId === selectedStoreId;
    return matchesSearch && matchesStatus && matchesStore;
  });

  const inTransitCount = shipments.filter(s => 
    s.status === 'In Transit' && (role === 'brand' || s.storeId === selectedStoreId)
  ).length;
  const deliveredCount = shipments.filter(s => 
    s.status === 'Delivered' && (role === 'brand' || s.storeId === selectedStoreId)
  ).length;
  const confirmedCount = shipments.filter(s => 
    s.status === 'Confirmed' && (role === 'brand' || s.storeId === selectedStoreId)
  ).length;

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading shipments...</p>
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
            <h1 className="font-heading text-5xl text-foreground mb-2">Shipments</h1>
            <p className="font-paragraph text-lg text-secondary">
              {role === 'brand' ? 'Create and manage inventory shipments' : 'Track and confirm shipments'}
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
            {role === 'brand' && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-auto py-3 px-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Shipment
              </Button>
            )}
          </div>
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
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">In Transit</h3>
              <p className="font-heading text-4xl text-foreground">{inTransitCount}</p>
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
                  <Package className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Delivered</h3>
              <p className="font-heading text-4xl text-foreground">{deliveredCount}</p>
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
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Confirmed</h3>
              <p className="font-heading text-4xl text-foreground">{confirmedCount}</p>
            </Card>
          </motion.div>
        </div>

        {/* Shipments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-2xl text-foreground">All Shipments</h3>
            </div>

            {/* Filters */}
            <div className="mb-6 p-4 bg-background rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
                  <Input
                    type="text"
                    placeholder="Search by shipment number or store"
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
                    <SelectItem value="In Transit">In Transit</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Shipment #</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Store</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Items</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Shipment Date</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Delivery Date</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.length > 0 ? filteredShipments.map((shipment) => (
                    <tr key={shipment._id} className="border-b border-gray-100 hover:bg-background transition-colors">
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground font-medium">
                        {shipment.shipmentNumber}
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">{shipment.storeName}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {shipment.items.map((item, idx) => (
                            <div key={idx} className="font-paragraph text-xs text-secondary">
                              {item.itemName} (x{item.quantity})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`${
                            shipment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            shipment.status === 'Delivered' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {shipment.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">
                        {new Date(shipment.shipmentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">
                        {shipment.deliveryDate ? new Date(shipment.deliveryDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {role === 'brand' && shipment.status === 'In Transit' && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsDelivered(shipment._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Mark Delivered
                          </Button>
                        )}
                        {role === 'store' && shipment.status === 'Delivered' && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmDelivery(shipment._id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Confirm Receipt
                          </Button>
                        )}
                        {shipment.status === 'Confirmed' && (
                          <span className="font-paragraph text-xs text-green-600">✓ Confirmed</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center font-paragraph text-secondary">
                        No shipments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Create Shipment Modal */}
        {showCreateModal && role === 'brand' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl m-4"
            >
              <h2 className="font-heading text-2xl text-foreground mb-4">Create New Shipment</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-paragraph text-sm text-secondary mb-2">Store *</label>
                  <Select value={selectedStore} onValueChange={setSelectedStore}>
                    <SelectTrigger className="font-paragraph">
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
                </div>

                <div>
                  <label className="block font-paragraph text-sm text-secondary mb-2">Add Items</label>
                  <div className="flex items-center space-x-2">
                    <Select value={currentItem} onValueChange={setCurrentItem}>
                      <SelectTrigger className="font-paragraph flex-1">
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((item) => (
                          <SelectItem key={item._id} value={item._id}>
                            {item.itemName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={currentQuantity}
                      onChange={(e) => setCurrentQuantity(e.target.value)}
                      className="font-paragraph w-24"
                    />
                    <Button onClick={handleAddItem} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {shipmentItems.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <p className="font-paragraph text-sm text-secondary mb-2">Items in Shipment:</p>
                    <div className="space-y-2">
                      {shipmentItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-background p-2 rounded">
                          <span className="font-paragraph text-sm">
                            {item.itemName} - Qty: {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-paragraph text-sm text-secondary mb-2">Notes</label>
                  <Input
                    type="text"
                    placeholder="Add any notes"
                    value={shipmentNotes}
                    onChange={(e) => setShipmentNotes(e.target.value)}
                    className="font-paragraph"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <Button
                  onClick={handleCreateShipment}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create Shipment
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedStore('');
                    setShipmentItems([]);
                    setShipmentNotes('');
                  }}
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
