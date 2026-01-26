import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const availableRoles = [
  { id: 'admin', label: 'Admin', description: 'Full access to admin dashboard' },
  { id: 'pundit', label: 'Pundit', description: 'Can perform poojas and view assigned bookings' },
  { id: 'temple', label: 'Temple', description: 'Can manage temple services and bookings' },
  { id: 'moderator', label: 'Moderator', description: 'Can moderate content and approvals' },
  { id: 'field_officer', label: 'Field Officer', description: 'Can manage on-ground operations' },
];

interface RoleManagementDialogProps {
  userId: string;
  userName: string;
  currentRoles: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, rolesToAdd: string[], rolesToRemove: string[]) => Promise<void>;
}

export function RoleManagementDialog({
  userId,
  userName,
  currentRoles,
  open,
  onOpenChange,
  onSave,
}: RoleManagementDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const rolesToAdd = selectedRoles.filter((r) => !currentRoles.includes(r));
      const rolesToRemove = currentRoles.filter((r) => !selectedRoles.includes(r));
      await onSave(userId, rolesToAdd, rolesToRemove);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Roles for {userName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {availableRoles.map((role) => (
            <div key={role.id} className="flex items-start space-x-3">
              <Checkbox
                id={role.id}
                checked={selectedRoles.includes(role.id)}
                onCheckedChange={() => handleToggleRole(role.id)}
              />
              <div className="space-y-1">
                <Label htmlFor={role.id} className="font-medium cursor-pointer">
                  {role.label}
                </Label>
                <p className="text-xs text-muted-foreground">{role.description}</p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Roles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
