import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { Stores } from '@/entities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Search, MessageSquare } from 'lucide-react';

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

interface RequestManagementPageProps {
  role: 'brand';
}

export default function RequestManagementPage({ role }: RequestManagementPageProps) {
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [stores, setStores] = useState<Stores[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  
  // Modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'deny'>('approve');
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const storesData = await BaseCrudService.getAll<Stores>('stores');
      setStores(storesData.items);
      
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
          storeName: storesData.items[0]?.storeName || 'Downtown Store',
          notes: 'Running low on stock'
        },
        {
          _id: '2',
          items: [
            { itemId: '3', itemName: 'Sugar - White', quantity: 100, priority: 'Medium' }
          ],
          status: 'Pending',
          requestDate: new Date('2024-12-21'),
          storeId: storesData.items[1]?._id || '',
          storeName: storesData.items[1]?.storeName || 'Uptown Store',
          notes: 'Weekly restock'
        },
        {
          _id: '3',
          items: [
            { itemId: '4', itemName: 'Cups - Large', quantity: 75, priority: 'Low' }
          ],
          status: 'Approved',
          requestDate: new Date('2024-12-18'),
          storeId: storesData.items[0]?._id || '',
          storeName: storesData.items[0]?.storeName || 'Downtown Store',
          brandManagerComment: 'Approved. Will ship within 2 days.'
        },
        {
          _id: '4',
          items: [
            { itemId: '5', itemName: 'Napkins', quantity: 200, priority: 'Medium' },
            { itemId: '6', itemName: 'Straws', quantity: 150, priority: 'Low' }
          ],
          status: 'Denied',
          requestDate: new Date('2024-12-19'),
          storeId: storesData.items[1]?._id || '',
          storeName: storesData.items[1]?.storeName || 'Uptown Store',
          brandManagerComment: 'Out of stock. Will be available next month.'
        },
      ]);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleOpenActionModal = (request: InventoryRequest, action: 'approve' | 'deny') => {
    setSelectedRequest(request);
    setActionType(action);
    setComment('');
    setShowActionModal(true);
  };

  const handleSubmitAction = () => {
    if (!selectedRequest) return;

    const updatedRequests = requests.map(req => {
      if (req._id === selectedRequest._id) {
        return {
          ...req,
          status: actionType === 'approve' ? 'Approved' as const : 'Denied' as const,
          brandManagerComment: comment
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    setShowActionModal(false);
    setSelectedRequest(null);
    setComment('');
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.items.some(item => item.itemName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      request.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.items.some(item => item.priority === priorityFilter);
    const matchesStore = storeFilter === 'all' || request.storeId === storeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesStore;
  });

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const deniedCount = requests.filter(r => r.status === 'Denied').length;

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading requests...</p>
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
            <h1 className="font-heading text-5xl text-foreground mb-2">Request Management</h1>
            <p className="font-paragraph text-lg text-secondary">
              Review and manage inventory requests from stores
            </p>
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
              <h3 className="font-paragraph text-sm text-secondary mb-2">Denied</h3>
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
              <h3 className="font-heading text-2xl text-foreground">All Requests</h3>
            </div>

            {/* Filters */}
            <div className="mb-6 p-4 bg-background rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 font-paragraph h-10"
                  />
                </div>
                <Select value={storeFilter} onValueChange={setStoreFilter}>
                  <SelectTrigger className="font-paragraph h-10">
                    <SelectValue placeholder="Store" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store._id} value={store._id}>
                        {store.storeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="font-paragraph h-10">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="font-paragraph h-10">
                    <SelectValue placeholder="Status" />
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
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Store</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Items</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Request Date</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Notes</th>
                    <th className="text-left py-3 px-4 font-paragraph text-sm text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length > 0 ? filteredRequests.map((request) => (
                    <tr key={request._id} className="border-b border-gray-100 hover:bg-background transition-colors">
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">#{request._id}</td>
                      <td className="py-3 px-4 font-paragraph text-sm text-foreground">{request.storeName}</td>
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
                      <td className="py-3 px-4">
                        {request.status === 'Pending' ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleOpenActionModal(request, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleOpenActionModal(request, 'deny')}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="font-paragraph text-xs text-secondary">{request.brandManagerComment}</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center font-paragraph text-secondary">
                        No requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Action Modal */}
        {showActionModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="font-heading text-2xl text-foreground mb-4">
                {actionType === 'approve' ? 'Approve' : 'Deny'} Request
              </h2>
              
              <div className="mb-4 p-4 bg-background rounded-lg">
                <p className="font-paragraph text-sm text-secondary mb-1">Store</p>
                <p className="font-paragraph text-foreground font-medium mb-3">{selectedRequest.storeName}</p>
                
                <p className="font-paragraph text-sm text-secondary mb-2">Items Requested</p>
                <div className="space-y-2">
                  {selectedRequest.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
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
                    </div>
                  ))}
                </div>

                {selectedRequest.notes && (
                  <>
                    <p className="font-paragraph text-sm text-secondary mt-3 mb-1">Store Notes</p>
                    <p className="font-paragraph text-foreground text-sm">{selectedRequest.notes}</p>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-paragraph text-sm text-secondary mb-2">
                    Comment {actionType === 'deny' ? '*' : '(Optional)'}
                  </label>
                  <Input
                    type="text"
                    placeholder="Add a comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="font-paragraph"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <Button
                  onClick={handleSubmitAction}
                  className={`flex-1 ${
                    actionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                >
                  {actionType === 'approve' ? 'Approve' : 'Deny'} Request
                </Button>
                <Button
                  onClick={() => setShowActionModal(false)}
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
