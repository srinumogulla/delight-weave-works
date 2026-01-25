import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Search, Trash2, Loader2, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Tables } from '@/integrations/supabase/types';

type PoojaService = Tables<'pooja_services'>;

const categories = [
  'Homam',
  'Abhishekam',
  'Archana',
  'Pooja',
  'Vratam',
  'Jaap',
  'Shanti',
  'Other'
];

const emptyService: Partial<PoojaService> = {
  name: '',
  description: '',
  category: '',
  price: 0,
  duration: '',
  temple: '',
  guru_name: '',
  image_url: '',
  benefits: [],
  ritual_type: 'dashachara',
  is_active: true,
};

export default function AdminServices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Partial<PoojaService> | null>(null);
  const [formData, setFormData] = useState<Partial<PoojaService>>(emptyService);
  const [benefitsInput, setBenefitsInput] = useState('');

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pooja_services')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as PoojaService[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<PoojaService>) => {
      const { error } = await supabase.from('pooja_services').insert([data as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({ title: 'Service created successfully' });
      setIsFormOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PoojaService> }) => {
      const { error } = await supabase.from('pooja_services').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({ title: 'Service updated successfully' });
      setIsFormOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pooja_services').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({ title: 'Service deactivated successfully' });
      setIsDeleteOpen(false);
      setSelectedService(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData(emptyService);
    setBenefitsInput('');
    setSelectedService(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      benefits: benefitsInput.split(',').map(b => b.trim()).filter(Boolean),
    };
    if (selectedService?.id) {
      updateMutation.mutate({ id: selectedService.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (service: PoojaService) => {
    setSelectedService(service);
    setFormData(service);
    setBenefitsInput(service.benefits?.join(', ') || '');
    setIsFormOpen(true);
  };

  const handleDelete = (service: PoojaService) => {
    setSelectedService(service);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const toggleServiceStatus = async (service: PoojaService) => {
    await updateMutation.mutateAsync({ 
      id: service.id, 
      data: { is_active: !service.is_active } 
    });
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Pooja Services
            </h1>
            <p className="text-muted-foreground">Manage your pooja offerings</p>
          </div>
          <Button onClick={handleAddNew} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile Cards / Desktop Table */}
        {isMobile ? (
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : filteredServices.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No services found
                </CardContent>
              </Card>
            ) : (
              filteredServices.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.category || 'No category'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-medium text-primary">₹{service.price.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">• {service.duration || 'N/A'}</span>
                        </div>
                        <Badge variant={service.is_active ? 'default' : 'secondary'} className="mt-2">
                          {service.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(service)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Temple</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No services found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.category || '-'}</TableCell>
                        <TableCell>₹{service.price.toLocaleString()}</TableCell>
                        <TableCell>{service.duration || '-'}</TableCell>
                        <TableCell>{service.temple || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={service.is_active ? 'default' : 'secondary'}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleServiceStatus(service)}
                            >
                              {service.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(service)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedService?.id ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {selectedService?.id ? 'Update the service details' : 'Create a new pooja service'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 2 hours"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ritual_type">Ritual Type</Label>
                <Select
                  value={formData.ritual_type || 'dashachara'}
                  onValueChange={(value) => setFormData({ ...formData, ritual_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashachara">Dashachara</SelectItem>
                    <SelectItem value="vamachara">Vamachara</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temple">Temple</Label>
                <Input
                  id="temple"
                  value={formData.temple || ''}
                  onChange={(e) => setFormData({ ...formData, temple: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guru_name">Guru Name</Label>
                <Input
                  id="guru_name"
                  value={formData.guru_name || ''}
                  onChange={(e) => setFormData({ ...formData, guru_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits (comma-separated)</Label>
              <Textarea
                id="benefits"
                value={benefitsInput}
                onChange={(e) => setBenefitsInput(e.target.value)}
                placeholder="Peace of mind, Prosperity, Good health"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active || false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {selectedService?.id ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate "{selectedService?.name}"? It will no longer be visible to users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedService?.id && deleteMutation.mutate(selectedService.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
