import { useEffect, useState, useMemo, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { InventoryItems, Stores } from '@/entities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Plus, Clock, CheckCircle, XCircle, Search, Trash2, X, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStoreContext } from '@/store/storeContext';
import { useUserStore } from '@/store/userStore';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfDay } from 'date-fns';

interface RequestItem {
  itemId: string;
  itemName: string;
  quantity: number;
  priority: 'Low' | 'Medium' | 'High';
}

interface InventoryRequest {
  _id: string;
  items: RequestItem[];
  status: 'Pending' | 'Approved' | 'Denied';
  requestDate: Date;
  storeId: string;
  storeName: string;
  notes?: string;
  brandManagerComment?: string;
}

interface InventoryRequestsPageProps {
  role: 'store';
}

export default function InventoryRequestsPage({ role }: InventoryRequestsPageProps) {
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItems[]>([]);
  const [stores, setStores] = useState<Stores[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Initialize date range with start of month to current date
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfDay(new Date())
  });
  
  // Form state for multiple items
  const [requestItems, setRequestItems] = useState<RequestItem[]>([]);
  const [currentItem, setCurrentItem] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [currentPriority, setCurrentPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [notes, setNotes] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [searchingItems, setSearchingItems] = useState(false);
  const [defaultItems, setDefaultItems] = useState<InventoryItems[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const { selectedStoreId, setSelectedStoreId } = useStoreContext();
  const { user } = useUserStore();
  
  // Ref to maintain focus on search input
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Get the current store ID - prioritize selectedStoreId, then user's storeId
  const currentStoreId = selectedStoreId ? parseInt(selectedStoreId) : user?.storeId || user?.franchiseId || null;

  // Fetch initial products when modal opens
  useEffect(() => {
    console.log('Modal state:', showCreateModal, 'Store ID:', currentStoreId);
    
    if (!showCreateModal || !currentStoreId) {
      console.log('Skipping fetch - modal closed or no store selected');
      return;
    }

    const fetchInitialProducts = async () => {
      console.log('Fetching initial products for store:', currentStoreId);
      setSearchingItems(true);
      try {
        const url = `http://localhost:8080/api/inventory-requests/${currentStoreId}/search-products?search=`;
        console.log('API URL:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data.status === 'success' && data.data) {
          const mappedItems = data.data.slice(0, 10).map((item: any) => ({
            _id: item.id?.toString() || item._id,
            itemName: item.name || item.itemName,
            ...item
          }));
          console.log('Mapped items:', mappedItems);
          setDefaultItems(mappedItems); // Store as default items
          setInventoryItems(mappedItems);
        }
      } catch (error) {
        console.error('Error fetching initial products:', error);
      } finally {
        setSearchingItems(false);
      }
    };

    fetchInitialProducts();
    // Reset search query when modal opens
    setItemSearchQuery('');
  }, [showCreateModal, currentStoreId]);

  // Fetch products from backend API based on search query
  useEffect(() => {
    // Only fetch if modal is open
    if (!showCreateModal || !currentStoreId) return;

    const fetchProducts = async () => {
      // If search is empty, restore default items
      if (itemSearchQuery.length === 0) {
        setInventoryItems(defaultItems);
        return;
      }

      // Only make API call if search query has 3 or more characters
      if (itemSearchQuery.length < 3) {
        return; // Don't make API call yet
      }

      setSearchingItems(true);
      try {
        const response = await fetch(
          `http://localhost:8080/api/inventory-requests/${currentStoreId}/search-products?search=${encodeURIComponent(itemSearchQuery)}`
        );
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          // Map backend response to InventoryItems format
          const mappedItems = data.data.map((item: any) => ({
            _id: item.id?.toString() || item._id,
            itemName: item.name || item.itemName,
            ...item
          }));
          setInventoryItems(mappedItems);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setSearchingItems(false);
        // Restore focus to search input after API call completes
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [itemSearchQuery, showCreateModal, currentStoreId, defaultItems]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Set store ID from user if available
        if (user?.storeId && !selectedStoreId) {
          setSelectedStoreId(user.storeId.toString());
        }
        
        const storesData = await BaseCrudService.getAll<Stores>('stores');
        setStores(storesData.items);
        
        if (storesData.items.length > 0 && !selectedStoreId && !user?.storeId) {
          setSelectedStoreId(storesData.items[0]._id);
        }
        
        // Mock requests data - replace with actual API call
        setRequests([
          {
            _id: '1',
            items: [
              { itemId: '1', itemName: 'Coffee Beans - Premium Blend', quantity: 50, priority: 'High' },
              { itemId: '2', itemName: 'Milk - Whole', quantity: 30, priority: 'Medium' }
            ],
            status: 'Pending',
            requestDate: new Date('2024-12-20'),
            storeId: storesData.items[0]?._id || '',
            storeName: storesData.items[0]?.storeName || '',
            notes: 'Running low on stock'
          },
          {
            _id: '2',
            items: [
              { itemId: '3', itemName: 'Sugar - White', quantity: 100, priority: 'Low' }
            ],
            status: 'Approved',
            requestDate: new Date('2024-12-18'),
            storeId: storesData.items[0]?._id || '',
            storeName: storesData.items[0]?.storeName || '',
            brandManagerComment: 'Approved. Will ship within 2 days.'
          },
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedStoreId, setSelectedStoreId, user]);

  const handleAddItem = () => {
    if (!currentItem || !currentQuantity) {
      return;
    }

    const item = inventoryItems.find(i => i._id === currentItem);
    if (!item) return;

    // Check if item already added
    if (requestItems.some(ri => ri.itemId === currentItem)) {
      return;
    }

    const newItem: RequestItem = {
      itemId: currentItem,
      itemName: item.itemName,
      quantity: parseInt(currentQuantity),
      priority: currentPriority,
    };

    setRequestItems([...requestItems, newItem]);
    
    // Reset current item form
    setCurrentItem('');
    setCurrentQuantity('');
    setCurrentPriority('Medium');
  };

  const handleRemoveItem = (itemId: string) => {
    setRequestItems(requestItems.filter(item => item.itemId !== itemId));
  };

  const handleEditItem = (itemId: string) => {
    const itemToEdit = requestItems.find(item => item.itemId === itemId);
    if (itemToEdit) {
      setEditingItemId(itemId);
    }
  };

  const handleUpdateItem = (itemId: string, quantity: number, priority: 'Low' | 'Medium' | 'High') => {
    setRequestItems(requestItems.map(item => 
      item.itemId === itemId 
        ? { ...item, quantity, priority }
        : item
    ));
    setEditingItemId(null);
  };

  const handleCreateRequest = async () => {
    if (requestItems.length === 0) {
      return;
    }

    if (!currentStoreId) {
      return;
    }

    try {
      // Prepare request body according to API spec
      const requestBody = {
        storeId: currentStoreId,
        notes: notes || '',
        items: requestItems.map(item => ({
          itemId: parseInt(item.itemId),
          quantityRequested: item.quantity,
          priority: item.priority
        }))
      };

      console.log('Sending request:', requestBody);

      const response = await fetch('http://localhost:8080/api/inventory-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Show success toast
        setToastMessage(`Request created successfully with ${requestItems.length} item${requestItems.length > 1 ? 's' : ''}!`);
        setToastType('success');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
        
        // Optionally add the new request to local state for immediate UI update
        const store = stores.find(s => parseInt(s._id) === currentStoreId);
        const newRequest: InventoryRequest = {
          _id: Date.now().toString(),
          items: requestItems,
          status: 'Pending',
          requestDate: new Date(),
          storeId: currentStoreId.toString(),
          storeName: store?.storeName || '',
          notes,
        };
        setRequests([newRequest, ...requests]);
        
        // Reset form
        setRequestItems([]);
        setCurrentItem('');
        setCurrentQuantity('');
        setCurrentPriority('Medium');
        setNotes('');
        setItemSearchQuery('');
        setShowCreateModal(false);
      } else {
        setToastMessage(result.message || 'Failed to create request');
        setToastType('error');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      }
    } catch (error) {
      console.error('Error creating inventory request:', error);
      setToastMessage('Failed to create inventory request. Please try again.');
      setToastType('error');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    }
  };

  // Filter available items - exclude already added items (memoized to prevent re-renders)
  const filteredInventoryItems = useMemo(() => {
    return inventoryItems.filter(item => !requestItems.some(ri => ri.itemId === item._id));
  }, [inventoryItems, requestItems]);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.items.some(item => 
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesStore = request.storeId === selectedStoreId;
    
    // Date range filter
    const matchesDateRange = !dateRange?.from || !dateRange?.to || (
      new Date(request.requestDate) >= dateRange.from &&
      new Date(request.requestDate) <= dateRange.to
    );
    
    return matchesSearch && matchesStatus && matchesStore && matchesDateRange;
  });

  const pendingCount = requests.filter(r => r.status === 'Pending' && r.storeId === selectedStoreId).length;
  const approvedCount = requests.filter(r => r.status === 'Approved' && r.storeId === selectedStoreId).length;
  const deniedCount = requests.filter(r => r.status === 'Denied' && r.storeId === selectedStoreId).length;

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading inventory requests...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="p-8 max-w-[100rem] mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-heading text-5xl text-foreground mb-2">Inventory Requests</h1>
              <p className="font-paragraph text-lg text-secondary">
                Request inventory items from brand manager
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {stores.length > 0 && (
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
                onClick={() => setShowCreateModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-auto py-3 px-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Request
              </Button>
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div className="flex items-center">
            <DateRangePicker
              placeholder="Filter by date range"
              value={dateRange}
              onChange={setDateRange}
            />
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
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Pending Requests</h3>
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
              <h3 className="font-paragraph text-sm text-secondary mb-2">Approved Requests</h3>
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
              <h3 className="font-paragraph text-sm text-secondary mb-2">Denied Requests</h3>
              <p className="font-heading text-4xl text-foreground">{deniedCount}</p>
            </Card>
          </motion.div>
        </div>

        {/* Requests Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-2xl text-foreground">My Requests</h3>
            </div>

            {/* Filters */}
            <div className="mb-6 p-4 bg-background rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
                  <Input
                    type="text"
                    placeholder="Search by item name"
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
                    <SelectItem value="Denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Request ID</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Items</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Request Date</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Notes</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Manager Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length > 0 ? filteredRequests.map((request) => (
                    <tr key={request._id} className="border-b border-gray-100 hover:bg-background transition-colors">
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">#{request._id}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-2">
                          {request.items.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <span className="font-paragraph text-sm text-foreground">{item.itemName}</span>
                              <Badge variant="outline" className="text-xs">Qty: {item.quantity}</Badge>
                              <Badge
                                className={`text-xs ${
                                  item.priority === 'High' ? 'bg-red-100 text-red-800' :
                                  item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {item.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`${
                            request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'Denied' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {request.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">{request.notes || '-'}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-secondary">{request.brandManagerComment || '-'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center font-paragraph text-secondary">
                        No requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Create Request Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl text-foreground">Create New Request</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setRequestItems([]);
                    setCurrentItem('');
                    setCurrentQuantity('');
                    setCurrentPriority('Medium');
                    setNotes('');
                    setItemSearchQuery('');
                  }}
                  className="p-2 hover:bg-background rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-secondary hover:text-foreground" />
                </button>
              </div>
              
              {/* Add Item Section */}
              <div className="mb-6 p-4 bg-background rounded-lg">
                <h3 className="font-paragraph text-sm font-semibold text-foreground mb-3">Add Items to Request</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <div className="md:col-span-2">
                    <label className="block font-paragraph text-xs text-secondary mb-1">Item *</label>
                    <Select value={currentItem} onValueChange={setCurrentItem}>
                      <SelectTrigger className="font-paragraph h-10">
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-3 py-2 sticky top-0 bg-white z-10 border-b">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
                            <Input
                              ref={searchInputRef}
                              type="text"
                              placeholder="Search items... (min 3 chars)"
                              value={itemSearchQuery}
                              onChange={(e) => {
                                e.stopPropagation();
                                setItemSearchQuery(e.target.value);
                              }}
                              onKeyDown={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="font-paragraph h-9 pl-10 text-sm border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
                              autoComplete="off"
                            />
                          </div>
                        </div>
                        {searchingItems ? (
                          <div className="px-3 py-6 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="font-paragraph text-sm text-secondary">Searching...</p>
                          </div>
                        ) : filteredInventoryItems.length > 0 ? (
                          filteredInventoryItems.map((item) => (
                            <SelectItem 
                              key={item._id} 
                              value={item._id}
                              className="font-paragraph text-sm py-2.5 cursor-pointer hover:bg-background"
                            >
                              {item.itemName}
                            </SelectItem>
                          ))
                        ) : itemSearchQuery.length > 0 && itemSearchQuery.length < 3 ? (
                          <div className="px-3 py-6 text-center">
                            <Search className="w-8 h-8 text-secondary mx-auto mb-2 opacity-50" />
                            <p className="font-paragraph text-sm text-secondary">Type at least 3 characters to search</p>
                          </div>
                        ) : (
                          <div className="px-3 py-6 text-center">
                            <Search className="w-8 h-8 text-secondary mx-auto mb-2 opacity-50" />
                            <p className="font-paragraph text-sm text-secondary">No items found</p>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block font-paragraph text-xs text-secondary mb-1">Quantity *</label>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={currentQuantity}
                      onChange={(e) => setCurrentQuantity(e.target.value)}
                      className="font-paragraph h-10"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block font-paragraph text-xs text-secondary mb-1">Priority</label>
                    <Select value={currentPriority} onValueChange={(value: any) => setCurrentPriority(value)}>
                      <SelectTrigger className="font-paragraph h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button
                  onClick={handleAddItem}
                  variant="outline"
                  className="w-full h-10"
                  disabled={!currentItem || !currentQuantity}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {/* Added Items List */}
              {requestItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-paragraph text-sm font-semibold text-foreground mb-3">
                    Items in Request ({requestItems.length})
                  </h3>
                  <div className="space-y-2">
                    {requestItems.map((item) => (
                      <div
                        key={item.itemId}
                        className="p-3 bg-background rounded-lg"
                      >
                        {editingItemId === item.itemId ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <p className="font-paragraph text-sm text-foreground font-medium">{item.itemName}</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block font-paragraph text-xs text-secondary mb-1">Quantity</label>
                                <Input
                                  type="number"
                                  defaultValue={item.quantity}
                                  min="1"
                                  id={`edit-qty-${item.itemId}`}
                                  className="font-paragraph h-9"
                                />
                              </div>
                              <div>
                                <label className="block font-paragraph text-xs text-secondary mb-1">Priority</label>
                                <Select defaultValue={item.priority} onValueChange={(value: any) => {
                                  (document.getElementById(`edit-priority-${item.itemId}`) as any).value = value;
                                }}>
                                  <SelectTrigger className="font-paragraph h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                  </SelectContent>
                                </Select>
                                <input type="hidden" id={`edit-priority-${item.itemId}`} defaultValue={item.priority} />
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => {
                                  const qtyInput = document.getElementById(`edit-qty-${item.itemId}`) as HTMLInputElement;
                                  const priorityInput = document.getElementById(`edit-priority-${item.itemId}`) as HTMLInputElement;
                                  handleUpdateItem(item.itemId, parseInt(qtyInput.value), priorityInput.value as any);
                                }}
                                size="sm"
                                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-8"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                onClick={() => setEditingItemId(null)}
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-paragraph text-sm text-foreground font-medium">{item.itemName}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">Quantity: {item.quantity}</Badge>
                                <Badge
                                  className={`text-xs ${
                                    item.priority === 'High' ? 'bg-red-100 text-red-800' :
                                    item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {item.priority} Priority
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                onClick={() => handleEditItem(item.itemId)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleRemoveItem(item.itemId)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className="mb-6">
                <label className="block font-paragraph text-sm text-secondary mb-2">Notes (Optional)</label>
                <Input
                  type="text"
                  placeholder="Add any additional notes for this request"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="font-paragraph"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleCreateRequest}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={requestItems.length === 0}
                >
                  Create Request ({requestItems.length} {requestItems.length === 1 ? 'item' : 'items'})
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    setRequestItems([]);
                    setCurrentItem('');
                    setCurrentQuantity('');
                    setCurrentPriority('Medium');
                    setNotes('');
                    setItemSearchQuery('');
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

        {/* Success/Error Toast Notification */}
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-8 right-8 z-[100] max-w-md"
          >
            <div className={`rounded-xl shadow-2xl p-4 flex items-start space-x-3 ${
              toastType === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200'
            }`}>
              <div className={`p-2 rounded-full ${
                toastType === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {toastType === 'success' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-heading text-sm font-semibold mb-1 ${
                  toastType === 'success' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {toastType === 'success' ? 'Success!' : 'Error'}
                </h4>
                <p className={`font-paragraph text-sm ${
                  toastType === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {toastMessage}
                </p>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className={`p-1 rounded-lg transition-colors ${
                  toastType === 'success' 
                    ? 'hover:bg-green-100 text-green-600' 
                    : 'hover:bg-red-100 text-red-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
