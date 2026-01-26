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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { User, Calendar, Clock, IndianRupee, FileText, MessageSquare } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Booking = Tables<'bookings'> & {
  profiles?: { full_name: string | null; email: string | null; phone: string | null } | null;
  pooja_services?: { name: string; temple: string | null } | null;
};

interface Pundit {
  id: string;
  name: string;
  location: string | null;
}

interface BookingDetailModalProps {
  booking: Booking | null;
  pundits: Pundit[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignPundit: (bookingId: string, punditId: string) => void;
  onUpdateNotes: (bookingId: string, notes: string) => void;
  onUpdateStatus: (bookingId: string, status: string) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function BookingDetailModal({
  booking,
  pundits,
  open,
  onOpenChange,
  onAssignPundit,
  onUpdateNotes,
  onUpdateStatus,
}: BookingDetailModalProps) {
  const [notes, setNotes] = useState(booking?.admin_notes || '');
  const [selectedPundit, setSelectedPundit] = useState(booking?.assigned_pundit_id || '');

  if (!booking) return null;

  const handleSaveNotes = () => {
    onUpdateNotes(booking.id, notes);
  };

  const handleAssignPundit = (punditId: string) => {
    setSelectedPundit(punditId);
    onAssignPundit(booking.id, punditId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Booking Details</span>
            <Badge className={statusColors[booking.status || 'pending']}>
              {booking.status || 'pending'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">{booking.profiles?.full_name || booking.sankalpa_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{booking.profiles?.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-medium">{booking.profiles?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Info */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Service Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Service:</span>
                <p className="font-medium">{booking.pooja_services?.name || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Temple:</span>
                <p className="font-medium">{booking.pooja_services?.temple || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{format(new Date(booking.booking_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{booking.time_slot || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">₹{(booking.amount || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Payment:</span>
                <Badge variant={booking.payment_status === 'paid' ? 'default' : 'secondary'} className="ml-2">
                  {booking.payment_status || 'unpaid'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sankalpa Details */}
          <div className="space-y-3">
            <h3 className="font-semibold">Sankalpa Details</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Sankalpa Name:</span>
                <p className="font-medium">{booking.sankalpa_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Gotra:</span>
                <p className="font-medium">{booking.gotra || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Nakshatra:</span>
                <p className="font-medium">{booking.nakshatra || 'N/A'}</p>
              </div>
            </div>
            {booking.special_requests && (
              <div>
                <span className="text-muted-foreground text-sm">Special Requests:</span>
                <p className="text-sm mt-1 p-3 bg-muted rounded-md">{booking.special_requests}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Pundit Assignment */}
          <div className="space-y-3">
            <h3 className="font-semibold">Assign Pundit</h3>
            <Select value={selectedPundit} onValueChange={handleAssignPundit}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pundit to assign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not Assigned</SelectItem>
                {pundits.map((pundit) => (
                  <SelectItem key={pundit.id} value={pundit.id}>
                    {pundit.name} {pundit.location && `(${pundit.location})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Admin Notes */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Admin Notes
            </h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this booking..."
              rows={3}
            />
            <Button onClick={handleSaveNotes} size="sm">
              Save Notes
            </Button>
          </div>

          <Separator />

          {/* Status Actions */}
          <div className="flex gap-2 justify-end">
            {booking.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  className="text-destructive border-destructive"
                  onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                >
                  Cancel Booking
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                >
                  Confirm Booking
                </Button>
              </>
            )}
            {booking.status === 'confirmed' && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => onUpdateStatus(booking.id, 'completed')}
              >
                Mark as Completed
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
