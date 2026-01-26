import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Star,
  Shield,
  UserX,
  UserCheck
} from 'lucide-react';

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
  is_disabled?: boolean;
}

interface UserDetailModalProps {
  user: Profile | null;
  roles: string[];
  bookingCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleDisabled: (userId: string, disabled: boolean) => void;
  onManageRoles: (userId: string) => void;
}

export function UserDetailModal({
  user,
  roles,
  bookingCount,
  open,
  onOpenChange,
  onToggleDisabled,
  onManageRoles,
}: UserDetailModalProps) {
  if (!user) return null;

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-lg">{getInitials(user.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{user.full_name || 'Unknown'}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {user.email || 'No email'}
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {user.phone}
                </div>
              )}
            </div>
            {user.is_disabled && (
              <Badge variant="destructive">Disabled</Badge>
            )}
          </div>

          <Separator />

          {/* Roles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Roles
              </h4>
              <Button variant="outline" size="sm" onClick={() => onManageRoles(user.id)}>
                Manage Roles
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'}>
                    {role}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">user (default)</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">{bookingCount}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm font-medium">{format(new Date(user.created_at), 'MMM d, yyyy')}</p>
              <p className="text-sm text-muted-foreground">Joined</p>
            </div>
          </div>

          <Separator />

          {/* Spiritual Details */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Star className="h-4 w-4" />
              Spiritual Details
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Gotra:</span>
                <p className="font-medium">{user.gotra || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Nakshatra:</span>
                <p className="font-medium">{user.nakshatra || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Rashi:</span>
                <p className="font-medium">{user.rashi || 'N/A'}</p>
              </div>
            </div>
            {user.date_of_birth && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Born:</span>
                <span className="font-medium">{format(new Date(user.date_of_birth), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                id="disabled"
                checked={user.is_disabled || false}
                onCheckedChange={(checked) => onToggleDisabled(user.id, checked)}
              />
              <Label htmlFor="disabled" className="flex items-center gap-2">
                {user.is_disabled ? (
                  <>
                    <UserX className="h-4 w-4 text-destructive" />
                    Account Disabled
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 text-green-600" />
                    Account Active
                  </>
                )}
              </Label>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
