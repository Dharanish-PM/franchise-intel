import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { Franchises } from '@/entities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, Building2, Mail, MapPin, Calendar, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function FranchisesPage() {
  const [franchises, setFranchises] = useState<Franchises[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState<Franchises | null>(null);
  const [formData, setFormData] = useState({
    franchiseName: '',
    contactPerson: '',
    contactEmail: '',
    headquartersAddress: '',
    websiteUrl: '',
    franchiseLogo: '',
  });

  useEffect(() => {
    fetchFranchises();
  }, []);

  const fetchFranchises = async () => {
    const data = await BaseCrudService.getAll<Franchises>('franchises', ['stores']);
    setFranchises(data.items);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFranchise) {
      await BaseCrudService.update<Franchises>('franchises', {
        _id: editingFranchise._id,
        ...formData,
      });
    } else {
      await BaseCrudService.create('franchises', {
        _id: crypto.randomUUID(),
        ...formData,
        startDate: new Date().toISOString(),
      });
    }

    setIsDialogOpen(false);
    setEditingFranchise(null);
    setFormData({
      franchiseName: '',
      contactPerson: '',
      contactEmail: '',
      headquartersAddress: '',
      websiteUrl: '',
      franchiseLogo: '',
    });
    fetchFranchises();
  };

  const handleEdit = (franchise: Franchises) => {
    setEditingFranchise(franchise);
    setFormData({
      franchiseName: franchise.franchiseName || '',
      contactPerson: franchise.contactPerson || '',
      contactEmail: franchise.contactEmail || '',
      headquartersAddress: franchise.headquartersAddress || '',
      websiteUrl: franchise.websiteUrl || '',
      franchiseLogo: franchise.franchiseLogo || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this franchise?')) {
      await BaseCrudService.delete('franchises', id);
      fetchFranchises();
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading franchises...</p>
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
            <h1 className="font-heading text-5xl text-foreground mb-2">Franchise Management</h1>
            <p className="font-paragraph text-lg text-secondary">
              Manage all franchise entities and their information
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-auto py-3 px-6">
                <Plus className="w-5 h-5 mr-2" />
                Add Franchise
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">
                  {editingFranchise ? 'Edit Franchise' : 'Add New Franchise'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="franchiseName" className="font-paragraph">Franchise Name</Label>
                  <Input
                    id="franchiseName"
                    value={formData.franchiseName}
                    onChange={(e) => setFormData({ ...formData, franchiseName: e.target.value })}
                    required
                    className="font-paragraph"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson" className="font-paragraph">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                    className="font-paragraph"
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail" className="font-paragraph">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                    className="font-paragraph"
                  />
                </div>
                <div>
                  <Label htmlFor="headquartersAddress" className="font-paragraph">Headquarters Address</Label>
                  <Input
                    id="headquartersAddress"
                    value={formData.headquartersAddress}
                    onChange={(e) => setFormData({ ...formData, headquartersAddress: e.target.value })}
                    required
                    className="font-paragraph"
                  />
                </div>
                <div>
                  <Label htmlFor="websiteUrl" className="font-paragraph">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="font-paragraph"
                  />
                </div>
                <div>
                  <Label htmlFor="franchiseLogo" className="font-paragraph">Logo URL</Label>
                  <Input
                    id="franchiseLogo"
                    value={formData.franchiseLogo}
                    onChange={(e) => setFormData({ ...formData, franchiseLogo: e.target.value })}
                    className="font-paragraph"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingFranchise(null);
                      setFormData({
                        franchiseName: '',
                        contactPerson: '',
                        contactEmail: '',
                        headquartersAddress: '',
                        websiteUrl: '',
                        franchiseLogo: '',
                      });
                    }}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                    {editingFranchise ? 'Update' : 'Create'} Franchise
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {franchises.map((franchise, index) => (
            <motion.div
              key={franchise._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {franchise.franchiseLogo && (
                  <div className="mb-4">
                    <Image
                      src={franchise.franchiseLogo}
                      alt={franchise.franchiseName || 'Franchise logo'}
                      width={200}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                <h3 className="font-heading text-2xl text-foreground mb-4">
                  {franchise.franchiseName}
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start space-x-2">
                    <Building2 className="w-4 h-4 text-secondary mt-1" />
                    <p className="font-paragraph text-sm text-secondary">
                      {franchise.contactPerson}
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Mail className="w-4 h-4 text-secondary mt-1" />
                    <p className="font-paragraph text-sm text-secondary">
                      {franchise.contactEmail}
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-secondary mt-1" />
                    <p className="font-paragraph text-sm text-secondary">
                      {franchise.headquartersAddress}
                    </p>
                  </div>
                  {franchise.startDate && (
                    <div className="flex items-start space-x-2">
                      <Calendar className="w-4 h-4 text-secondary mt-1" />
                      <p className="font-paragraph text-sm text-secondary">
                        Since {new Date(franchise.startDate).getFullYear()}
                      </p>
                    </div>
                  )}
                  {franchise.websiteUrl && (
                    <div className="flex items-start space-x-2">
                      <ExternalLink className="w-4 h-4 text-secondary mt-1" />
                      <a
                        href={franchise.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-paragraph text-sm text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="font-paragraph text-sm text-secondary mb-3">
                    {Array.isArray(franchise.stores) ? franchise.stores.length : 0} Stores
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(franchise)}
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(franchise._id)}
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {franchises.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h3 className="font-heading text-2xl text-foreground mb-2">No franchises yet</h3>
            <p className="font-paragraph text-secondary">
              Get started by adding your first franchise
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
