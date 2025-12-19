import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { Stores, Franchises } from '@/entities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Plus, Store, Mail, MapPin, Phone, ExternalLink, Edit, Trash2, Eye, BarChart3 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useNavigate } from 'react-router-dom';

export default function StoresPage() {
  const [stores, setStores] = useState<Stores[]>([]);
  const [franchises, setFranchises] = useState<Franchises[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Stores | null>(null);
  const [formData, setFormData] = useState({
    storeName: '',
    address: '',
    phoneNumber: '',
    emailAddress: '',
    storeWebsite: '',
    storeImage: '',
    operationalStatus: true,
    franchiseId: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [storesData, franchisesData] = await Promise.all([
      BaseCrudService.getAll<Stores>('stores', ['franchises']),
      BaseCrudService.getAll<Franchises>('franchises'),
    ]);
    setStores(storesData.items);
    setFranchises(franchisesData.items);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const storeData = {
      storeName: formData.storeName,
      address: formData.address,
      phoneNumber: formData.phoneNumber,
      emailAddress: formData.emailAddress,
      storeWebsite: formData.storeWebsite,
      storeImage: formData.storeImage,
      operationalStatus: formData.operationalStatus,
    };

    if (editingStore) {
      await BaseCrudService.update<Stores>('stores', {
        _id: editingStore._id,
        ...storeData,
      });
    } else {
      await BaseCrudService.create(
        'stores',
        {
          _id: crypto.randomUUID(),
          ...storeData,
        },
        formData.franchiseId ? { franchises: [formData.franchiseId] } : undefined
      );
    }

    setIsDialogOpen(false);
    setEditingStore(null);
    resetForm();
    fetchData();
  };

  const resetForm = () => {
    setFormData({
      storeName: '',
      address: '',
      phoneNumber: '',
      emailAddress: '',
      storeWebsite: '',
      storeImage: '',
      operationalStatus: true,
      franchiseId: '',
    });
  };

  const handleEdit = (store: Stores) => {
    setEditingStore(store);
    setFormData({
      storeName: store.storeName || '',
      address: store.address || '',
      phoneNumber: store.phoneNumber || '',
      emailAddress: store.emailAddress || '',
      storeWebsite: store.storeWebsite || '',
      storeImage: store.storeImage || '',
      operationalStatus: store.operationalStatus ?? true,
      franchiseId: Array.isArray(store.franchises) && store.franchises.length > 0 
        ? store.franchises[0]._id 
        : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this store?')) {
      await BaseCrudService.delete('stores', id);
      fetchData();
    }
  };

  const handleViewProfile = (storeId: string) => {
    navigate(`/admin/stores/${storeId}`);
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading stores...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-8 max-w-[100rem] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-5xl text-foreground mb-2">Store Management</h1>
            <p className="font-paragraph text-lg text-secondary">
              Manage all store locations and their settings
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/admin/stores/comparison')}
              className="bg-soft-gold text-foreground hover:bg-soft-gold/90 rounded-lg h-auto py-3 px-6"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Compare Stores
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-auto py-3 px-6">
                <Plus className="w-5 h-5 mr-2" />
                Add Store
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">
                  {editingStore ? 'Edit Store' : 'Add New Store'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="storeName" className="font-paragraph">Store Name</Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    required
                    className="font-paragraph"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="font-paragraph">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="font-paragraph"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phoneNumber" className="font-paragraph">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      required
                      className="font-paragraph"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailAddress" className="font-paragraph">Email Address</Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      value={formData.emailAddress}
                      onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                      required
                      className="font-paragraph"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="franchise" className="font-paragraph">Franchise</Label>
                  <Select
                    value={formData.franchiseId}
                    onValueChange={(value) => setFormData({ ...formData, franchiseId: value })}
                  >
                    <SelectTrigger className="font-paragraph">
                      <SelectValue placeholder="Select a franchise" />
                    </SelectTrigger>
                    <SelectContent>
                      {franchises.map((franchise) => (
                        <SelectItem key={franchise._id} value={franchise._id}>
                          {franchise.franchiseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="storeWebsite" className="font-paragraph">Website URL</Label>
                  <Input
                    id="storeWebsite"
                    type="url"
                    value={formData.storeWebsite}
                    onChange={(e) => setFormData({ ...formData, storeWebsite: e.target.value })}
                    className="font-paragraph"
                  />
                </div>
                <div>
                  <Label htmlFor="storeImage" className="font-paragraph">Store Image URL</Label>
                  <Input
                    id="storeImage"
                    value={formData.storeImage}
                    onChange={(e) => setFormData({ ...formData, storeImage: e.target.value })}
                    className="font-paragraph"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="operationalStatus"
                    checked={formData.operationalStatus}
                    onChange={(e) => setFormData({ ...formData, operationalStatus: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="operationalStatus" className="font-paragraph">
                    Operational
                  </Label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingStore(null);
                      resetForm();
                    }}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                    {editingStore ? 'Update' : 'Create'} Store
                  </Button>
                </div>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store, index) => (
            <motion.div
              key={store._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {store.storeImage && (
                  <div className="mb-4">
                    <Image
                      src={store.storeImage}
                      alt={store.storeName || 'Store image'}
                      width={300}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading text-2xl text-foreground">
                    {store.storeName}
                  </h3>
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
                <div className="space-y-3 mb-6">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-secondary mt-1" />
                    <p className="font-paragraph text-sm text-secondary">
                      {store.address}
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Phone className="w-4 h-4 text-secondary mt-1" />
                    <p className="font-paragraph text-sm text-secondary">
                      {store.phoneNumber}
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Mail className="w-4 h-4 text-secondary mt-1" />
                    <p className="font-paragraph text-sm text-secondary">
                      {store.emailAddress}
                    </p>
                  </div>
                  {store.storeWebsite && (
                    <div className="flex items-start space-x-2">
                      <ExternalLink className="w-4 h-4 text-secondary mt-1" />
                      <a
                        href={store.storeWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-paragraph text-sm text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
                {Array.isArray(store.franchises) && store.franchises.length > 0 && (
                  <div className="mb-4 p-3 bg-background rounded-lg">
                    <p className="font-paragraph text-xs text-secondary mb-1">Franchise</p>
                    <p className="font-paragraph text-sm text-foreground">
                      {store.franchises[0].franchiseName}
                    </p>
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleViewProfile(store._id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    onClick={() => handleEdit(store)}
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(store._id)}
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {stores.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h3 className="font-heading text-2xl text-foreground mb-2">No stores yet</h3>
            <p className="font-paragraph text-secondary">
              Get started by adding your first store
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
