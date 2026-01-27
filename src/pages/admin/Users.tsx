import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Search, Eye, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserDetailModal } from '@/components/admin/UserDetailModal';
import { RoleManagementDialog } from '@/components/admin/RoleManagementDialog';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  gotra: string | null;
  nakshatra: string | null;
  rashi: string | null;
  avatar_url: string | null;
  created_at: string;
  date_of_birth: string | null;
  is_disabled: boolean;
}

interface UserRole {
  user_id: string;
  role: string;
}

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleDialogUser, setRoleDialogUser] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const [profilesRes, rolesRes, bookingsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('bookings').select('user_id'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setProfiles((profilesRes.data as Profile[]) || []);
      
      // Group roles by user
      const rolesMap: Record<string, string[]> = {};
      (rolesRes.data || []).forEach((role: UserRole) => {
        if (!rolesMap[role.user_id]) {
          rolesMap[role.user_id] = [];
        }
        rolesMap[role.user_id].push(role.role);
      });
      setUserRoles(rolesMap);

      // Count bookings per user
      const countsMap: Record<string, number> = {};
      (bookingsRes.data || []).forEach((booking: { user_id: string }) => {
        countsMap[booking.user_id] = (countsMap[booking.user_id] || 0) + 1;
      });
      setBookingCounts(countsMap);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleUserDisabled(userId: string, disabled: boolean) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_disabled: disabled })
        .eq('id', userId);

      if (error) throw error;

      setProfiles(prev =>
        prev.map(p => p.id === userId ? { ...p, is_disabled: disabled } : p)
      );

      toast({
        title: 'Success',
        description: disabled ? 'User account disabled' : 'User account enabled',
      });
    } catch (error) {
      console.error('Error toggling user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    }
  }

  async function saveRoles(userId: string, rolesToAdd: string[], rolesToRemove: string[]) {
    type AppRole = "admin" | "moderator" | "user" | "pundit" | "temple" | "field_officer";
    
    try {
      // Remove roles
      for (const role of rolesToRemove) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role as AppRole);
      }

      // Add roles
      for (const role of rolesToAdd) {
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: role as AppRole });
      }

      // Refresh roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const rolesMap: Record<string, string[]> = {};
      (rolesData || []).forEach((role: UserRole) => {
        if (!rolesMap[role.user_id]) {
          rolesMap[role.user_id] = [];
        }
        rolesMap[role.user_id].push(role.role);
      });
      setUserRoles(rolesMap);

      toast({
        title: 'Success',
        description: 'User roles updated',
      });
    } catch (error) {
      console.error('Error updating roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to update roles',
        variant: 'destructive',
      });
    }
  }

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.phone?.includes(searchQuery)
  );

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const openDetailModal = (user: Profile) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const openRoleDialog = (userId: string) => {
    const user = profiles.find(p => p.id === userId);
    if (user) {
      setRoleDialogUser({ id: userId, name: user.full_name || 'User' });
      setRoleDialogOpen(true);
      setDetailModalOpen(false);
    }
  };

  // Mobile card view
  const MobileUserCard = ({ profile }: { profile: Profile }) => (
    <Card onClick={() => openDetailModal(profile)} className="cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{profile.full_name || 'Unknown'}</p>
              {profile.is_disabled && (
                <Badge variant="destructive" className="text-xs">Disabled</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {userRoles[profile.id]?.map((role) => (
                <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {role}
                </Badge>
              )) || <span className="text-xs text-muted-foreground">user</span>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{bookingCounts[profile.id] || 0}</p>
            <p className="text-xs text-muted-foreground">bookings</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-muted-foreground">Manage registered users and their roles</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile: Card View */}
        {isMobile ? (
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading users...</p>
            ) : filteredProfiles.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No users found</p>
            ) : (
              filteredProfiles.map((profile) => (
                <MobileUserCard key={profile.id} profile={profile} />
              ))
            )}
          </div>
        ) : (
          /* Desktop: Table View */
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredProfiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProfiles.map((profile) => (
                      <TableRow key={profile.id} className={profile.is_disabled ? 'opacity-50' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={profile.avatar_url || undefined} />
                              <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{profile.full_name || 'Unknown'}</span>
                                {profile.is_disabled && (
                                  <Badge variant="destructive" className="text-xs">Disabled</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{profile.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {profile.phone || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {profile.gotra && <div>Gotra: {profile.gotra}</div>}
                            {profile.nakshatra && <div>Nakshatra: {profile.nakshatra}</div>}
                            {profile.rashi && <div>Rashi: {profile.rashi}</div>}
                            {!profile.gotra && !profile.nakshatra && !profile.rashi && '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {userRoles[profile.id]?.map((role) => (
                              <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'}>
                                {role}
                              </Badge>
                            )) || <span className="text-muted-foreground">user</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {bookingCounts[profile.id] || 0}
                        </TableCell>
                        <TableCell>
                          {format(new Date(profile.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDetailModal(profile)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openRoleDialog(profile.id)}
                            >
                              <UserCog className="h-4 w-4" />
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

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        roles={selectedUser ? userRoles[selectedUser.id] || [] : []}
        bookingCount={selectedUser ? bookingCounts[selectedUser.id] || 0 : 0}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onToggleDisabled={toggleUserDisabled}
        onManageRoles={openRoleDialog}
      />

      {/* Role Management Dialog */}
      {roleDialogUser && (
        <RoleManagementDialog
          userId={roleDialogUser.id}
          userName={roleDialogUser.name}
          currentRoles={userRoles[roleDialogUser.id] || []}
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          onSave={saveRoles}
        />
      )}
    </AdminLayout>
  );
}
