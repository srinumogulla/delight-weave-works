import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Clock, User, MapPin, Languages, Briefcase } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const AdminApprovals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    punditId: string;
    action: 'approve' | 'reject';
    punditName: string;
  } | null>(null);

  // Fetch pending pundits
  const { data: pendingPundits = [], isLoading } = useQuery({
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

  // Approve/Reject mutation
  const updateStatusMutation = useMutation({
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
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAction = (punditId: string, action: 'approve' | 'reject', punditName: string) => {
    setConfirmDialog({ open: true, punditId, action, punditName });
  };

  const confirmAction = () => {
    if (confirmDialog) {
      updateStatusMutation.mutate({
        punditId: confirmDialog.punditId,
        status: confirmDialog.action === 'approve' ? 'approved' : 'rejected',
      });
    }
  };

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
            <TabsTrigger value="temples" disabled>
              Temples
              <Badge variant="secondary" className="ml-2 text-xs">Coming Soon</Badge>
            </TabsTrigger>
            <TabsTrigger value="poojas" disabled>
              Poojas
              <Badge variant="secondary" className="ml-2 text-xs">Coming Soon</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pundits" className="space-y-4">
            {isLoading ? (
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
            ) : pendingPundits.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Pending Approvals</h3>
                  <p className="text-muted-foreground">All pundit registrations have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingPundits.map((pundit) => (
                  <Card key={pundit.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Avatar */}
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={pundit.photo_url || undefined} alt={pundit.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xl">
                            {pundit.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Details */}
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

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleAction(pundit.id, 'approve', pundit.name)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => handleAction(pundit.id, 'reject', pundit.name)}
                            disabled={updateStatusMutation.isPending}
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

          <TabsContent value="temples">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Temple approvals coming in Phase 2</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="poojas">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Pooja approvals coming in Phase 4</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog?.open} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === 'approve' ? 'Approve Pundit' : 'Reject Pundit'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === 'approve'
                ? `Are you sure you want to approve ${confirmDialog.punditName}? They will be able to accept bookings and appear in public listings.`
                : `Are you sure you want to reject ${confirmDialog?.punditName}? They will be notified and will need to contact support.`}
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
