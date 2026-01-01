import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Search, Plus, Upload } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

interface BrandData {
  id: number;
  name: string;
  industry: string;
  imageUrl: string;
  websiteUrl: string;
  address: string;
  contact: string;
  franchiseCount: number;
}

export default function FranchisesPage() {
  const { user } = useUserStore();
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Determine role for layout - only ADMIN should see this page
  const layoutRole = user?.role === 'ADMIN' ? 'admin' : 'brand';
  
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    address: '',
    contact: '',
    managerEmail: '',
    websiteUrl: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/brands?pageNumber=0&pageSize=10');
      const data = await response.json();
      
      if (data.status === 'success') {
        setBrands(data.data.content);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
    setLoading(false);
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = !selectedIndustry || brand.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  if (loading) {
    return (
      <DashboardLayout role={layoutRole}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading brands...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={layoutRole}>
      <div className="p-8 max-w-[100rem] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-5xl text-foreground mb-2">Brand Management</h1>
            <p className="font-paragraph text-lg text-secondary">
              Manage all brand entities and their franchise information
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-auto py-3 px-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Brand
          </Button>
        </div>

        {/* Add Brand Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="font-heading text-2xl font-bold mb-4">Add New Brand</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 font-paragraph">Brand Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="font-paragraph"
                    placeholder="Enter brand name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 font-paragraph">Industry</label>
                  <Input
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    placeholder="Enter industry"
                    className="font-paragraph"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 font-paragraph">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter address"
                    className="font-paragraph"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 font-paragraph">Contact</label>
                  <Input
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    placeholder="Enter contact"
                    className="font-paragraph"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 font-paragraph">Brand Manager Email</label>
                  <Input
                    type="email"
                    value={formData.managerEmail}
                    onChange={(e) => setFormData({...formData, managerEmail: e.target.value})}
                    placeholder="Enter manager email"
                    className="font-paragraph"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 font-paragraph">Website URL</label>
                  <Input
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                    placeholder="Enter website URL"
                    className="font-paragraph"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 font-paragraph">Brand Logo</label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center font-paragraph"
                    onClick={() => console.log('Upload logo clicked')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      console.log('Form data:', formData);
                      setShowForm(false);
                      setFormData({
                        name: '',
                        industry: '',
                        address: '',
                        contact: '',
                        managerEmail: '',
                        websiteUrl: '',
                        imageUrl: ''
                      });
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Create Brand
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
            <Input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 font-paragraph"
            />
          </div>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md font-paragraph text-sm min-w-48"
          >
            <option value="">All Industries</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Retail">Retail</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Education">Education</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <Card key={brand.id} className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              {brand.imageUrl && (
                <div className="mb-4">
                  <img
                    src={brand.imageUrl}
                    alt={brand.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              <h3 className="font-heading text-2xl text-foreground mb-2">
                {brand.name}
              </h3>
              <p className="font-paragraph text-sm text-secondary mb-4">
                {brand.industry}
              </p>
              <p className="font-paragraph text-sm text-primary font-medium mb-4">
                Manager: John Smith
              </p>
              <div className="space-y-3 mb-6">
                <p className="font-paragraph text-sm text-secondary">
                  {brand.address}
                </p>
                <p className="font-paragraph text-sm text-secondary">
                  {brand.contact}
                </p>
                {brand.websiteUrl && (
                  <a
                    href={brand.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-paragraph text-sm text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                )}
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="font-paragraph text-sm text-secondary">
                  {brand.franchiseCount} Franchises
                </p>
              </div>
            </Card>
          ))}
        </div>

        {filteredBrands.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h3 className="font-heading text-2xl text-foreground mb-2">No brands found</h3>
            <p className="font-paragraph text-secondary">
              No brand data available at the moment
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}