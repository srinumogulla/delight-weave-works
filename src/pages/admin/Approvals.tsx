import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Clock, MapPin, Languages, Briefcase, Building2, BookOpen } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

interface PendingPundit {
  id: string;
  user_id: string | null;
  name: string;
  photo_url: string | null;
  specializations: string[] | null;
  languages: string[] | null;
  experience_years: number | null;
  location: string | null;
  bio: string | null;
  approval_status: string | null;
  created_at: string | null;
}

interface PendingTemple {
  id: string;
  name: string;
  deity: string | null;
  city: string | null;
  state: string | null;
  description: string | null;
  image_url: string | null;
  approval_status: string | null;
  created_at: string | null;
}

interface PendingService {
  id: string;
  name: string;
  category: string | null;
  price: number;
  temple: string | null;
  description: string | null;
  is_active: boolean | null;
  created_at: string;
}

const AdminApprovals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id: string;
    action: 'approve' | 'reject';
    name: string;
    type: 'pundit' | 'temple' | 'service';
  } | null>(null);

  // Fetch pending pundits
  const { data: pendingPundits = [], isLoading: loadingPundits } = useQuery({
    queryKey: ['pending-pundits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pundits')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PendingPundit[];
    },
  });

  // Fetch pending temples
  const { data: pendingTemples = [], isLoading: loadingTemples } = useQuery({
    queryKey: ['pending-temples'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('temples')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PendingTemple[];
    },
  });

  // Fetch inactive services (pending activation)
  const { data: pendingServices = [], isLoading: loadingServices } = useQuery({
    queryKey: ['pending-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pooja_services')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PendingService[];
    },
  });

  // Pundit approval mutation
  const punditMutation = useMutation({
    mutationFn: async ({ punditId, status }: { punditId: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('pundits')
        .update({
          approval_status: status,
          is_verified: status === 'approved',
        })
        .eq('id', punditId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-pundits'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals-count'] });
      toast({
        title: variables.status === 'approved' ? 'Pundit Approved' : 'Pundit Rejected',
        description: `The pundit has been ${variables.status}.`,
      });
      setConfirmDialog(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Temple approval mutation
  const templeMutation = useMutation({
    mutationFn: async ({ templeId, status }: { templeId: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('temples')
        .update({
          approval_status: status,
          is_active: status === 'approved',
        })
        .eq('id', templeId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-temples'] });
      toast({
        title: variables.status === 'approved' ? 'Temple Approved' : 'Temple Rejected',
        description: `The temple has been ${variables.status}.`,
      });
      setConfirmDialog(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Service approval mutation
  const serviceMutation = useMutation({
    mutationFn: async ({ serviceId, activate }: { serviceId: string; activate: boolean }) => {
      const { error } = await supabase
        .from('pooja_services')
        .update({ is_active: activate })
        .eq('id', serviceId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-services'] });
      toast({
        title: variables.activate ? 'Service Activated' : 'Service Rejected',
        description: `The service has been ${variables.activate ? 'activated' : 'rejected'}.`,
      });
      setConfirmDialog(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleAction = (id: string, action: 'approve' | 'reject', name: string, type: 'pundit' | 'temple' | 'service') => {
    setConfirmDialog({ open: true, id, action, name, type });
  };

  const confirmAction = () => {
    if (!confirmDialog) return;
    
    if (confirmDialog.type === 'pundit') {
      punditMutation.mutate({
        punditId: confirmDialog.id,
        status: confirmDialog.action === 'approve' ? 'approved' : 'rejected',
      });
    } else if (confirmDialog.type === 'temple') {
      templeMutation.mutate({
        templeId: confirmDialog.id,
        status: confirmDialog.action === 'approve' ? 'approved' : 'rejected',
      });
    } else if (confirmDialog.type === 'service') {
      serviceMutation.mutate({
        serviceId: confirmDialog.id,
        activate: confirmDialog.action === 'approve',
      });
    }
  };

  const isPending = punditMutation.isPending || templeMutation.isPending || serviceMutation.isPending;

  const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <Card>
      <CardContent className="py-12 text-center">
        <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const LoadingState = () => (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Approvals</h2>
          <p className="text-muted-foreground">Review and approve pending registrations</p>
        </div>

        <Tabs defaultValue="pundits" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pundits" className="relative">
              Pundits
              {pendingPundits.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                  {pendingPundits.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="temples">
              Temples
              {pendingTemples.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                  {pendingTemples.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="services">
              Services
              {pendingServices.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                  {pendingServices.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Pundits Tab */}
          <TabsContent value="pundits" className="space-y-4">
            {loadingPundits ? (
              <LoadingState />
            ) : pendingPundits.length === 0 ? (
              <EmptyState 
                icon={Clock} 
                title="No Pending Approvals" 
                description="All pundit registrations have been reviewed."
              />
            ) : (
              <div className="grid gap-4">
                {pendingPundits.map((pundit) => (
                  <Card key={pundit.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={pundit.photo_url || undefined} alt={pundit.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xl">
                            {pundit.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-lg font-semibold">{pundit.name}</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                              {pundit.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {pundit.location}
                                </span>
                              )}
                              {pundit.experience_years && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  {pundit.experience_years} years exp
                                </span>
                              )}
                              {pundit.languages && pundit.languages.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Languages className="h-3.5 w-3.5" />
                                  {pundit.languages.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>

                          {pundit.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {pundit.bio}
                            </p>
                          )}

                          {pundit.specializations && pundit.specializations.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {pundit.specializations.map((spec) => (
                                <Badge key={spec} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex md:flex-col gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleAction(pundit.id, 'approve', pundit.name, 'pundit')}
                            disabled={isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => handleAction(pundit.id, 'reject', pundit.name, 'pundit')}
                            disabled={isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Temples Tab */}
          <TabsContent value="temples" className="space-y-4">
            {loadingTemples ? (
              <LoadingState />
            ) : pendingTemples.length === 0 ? (
              <EmptyState 
                icon={Building2} 
                title="No Pending Temples" 
                description="All temple registrations have been reviewed."
              />
            ) : (
              <div className="grid gap-4">
                {pendingTemples.map((temple) => (
                  <Card key={temple.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {temple.image_url ? (
                          <img 
                            src={temple.image_url} 
                            alt={temple.name}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}

                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="text-lg font-semibold">{temple.name}</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                              {temple.deity && <span>Deity: {temple.deity}</span>}
                              {(temple.city || temple.state) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {[temple.city, temple.state].filter(Boolean).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                          {temple.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {temple.description}
                            </p>
                          )}
                        </div>

                        <div className="flex md:flex-col gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleAction(temple.id, 'approve', temple.name, 'temple')}
                            disabled={isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => handleAction(temple.id, 'reject', temple.name, 'temple')}
                            disabled={isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            {loadingServices ? (
              <LoadingState />
            ) : pendingServices.length === 0 ? (
              <EmptyState 
                icon={BookOpen} 
                title="No Pending Services" 
                description="All services have been activated."
              />
            ) : (
              <div className="grid gap-4">
                {pendingServices.map((service) => (
                  <Card key={service.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="text-lg font-semibold">{service.name}</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                              {service.category && (
                                <Badge variant="outline">{service.category}</Badge>
                              )}
                              <span>₹{service.price.toLocaleString()}</span>
                              {service.temple && <span>Temple: {service.temple}</span>}
                            </div>
                          </div>
                          {service.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {service.description}
                            </p>
                          )}
                        </div>

                        <div className="flex md:flex-col gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleAction(service.id, 'approve', service.name, 'service')}
                            disabled={isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => handleAction(service.id, 'reject', service.name, 'service')}
                            disabled={isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog?.open} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === 'approve' ? 'Approve' : 'Reject'} {confirmDialog?.type}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === 'approve'
                ? `Are you sure you want to approve ${confirmDialog?.name}? They will become active immediately.`
                : `Are you sure you want to reject ${confirmDialog?.name}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={confirmDialog?.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive hover:bg-destructive/90'}
            >
              {confirmDialog?.action === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminApprovals;
