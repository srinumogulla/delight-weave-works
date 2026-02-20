import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { PunditLayout } from '@/components/pundit/PunditLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const PunditBookings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['guru-bookings'],
    queryFn: async () => {
      if (!user) return [];
      const { data: pundit } = await supabase.from('pundits').select('id').eq('user_id', user.id).single();
      if (!pundit) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('*, pooja_services(name), profiles(full_name)')
        .eq('assigned_pundit_id', pundit.id)
        .order('booking_date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const today = new Date().toISOString().split('T')[0];
  const upcomingBookings = bookings.filter((b: any) => 
    ['pending', 'confirmed'].includes(b.status || '') && b.booking_date >= today
  );
  const completedBookings = bookings.filter((b: any) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b: any) => b.status === 'cancelled');

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
      if (error) throw error;
      toast.success(`Booking ${status}`);
      queryClient.invalidateQueries({ queryKey: ['guru-bookings'] });
    } catch {
      toast.error('Failed to update booking');
    }
  };

  const BookingCard = ({ booking, showActions = false }: { booking: any; showActions?: boolean }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{booking.pooja_services?.name || 'Pooja Service'}</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
              {booking.time_slot && ` at ${booking.time_slot}`}
            </p>
            <p className="text-sm mt-1"><span className="text-muted-foreground">Devotee:</span> {booking.sankalpa_name}</p>
            {booking.amount && <p className="text-sm font-medium mt-1">Amount: ₹{booking.amount}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={booking.status === 'completed' ? 'default' : booking.status === 'confirmed' ? 'secondary' : booking.status === 'pending' ? 'outline' : 'destructive'}>
              {booking.status}
            </Badge>
            {showActions && booking.status === 'pending' && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => updateStatus(booking.id, 'confirmed')}>Accept</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, 'cancelled')}>Decline</Button>
              </div>
            )}
            {showActions && booking.status === 'confirmed' && (
              <Button size="sm" variant="secondary" onClick={() => updateStatus(booking.id, 'completed')}>Mark Complete</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PunditLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage your pooja bookings and schedule</p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="w-full sm:w-auto flex">
            <TabsTrigger value="upcoming" className="flex-1 sm:flex-none gap-2"><Clock className="h-4 w-4" />Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 sm:flex-none gap-2"><CheckCircle className="h-4 w-4" />Completed ({completedBookings.length})</TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1 sm:flex-none gap-2"><XCircle className="h-4 w-4" />Cancelled ({cancelledBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              : upcomingBookings.length === 0 ? <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No upcoming bookings.</p></CardContent></Card>
              : <div className="space-y-4">{upcomingBookings.map((b: any) => <BookingCard key={b.id} booking={b} showActions />)}</div>}
          </TabsContent>

          <TabsContent value="completed">
            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              : completedBookings.length === 0 ? <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No completed bookings yet.</p></CardContent></Card>
              : <div className="space-y-4">{completedBookings.map((b: any) => <BookingCard key={b.id} booking={b} />)}</div>}
          </TabsContent>

          <TabsContent value="cancelled">
            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              : cancelledBookings.length === 0 ? <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No cancelled bookings.</p></CardContent></Card>
              : <div className="space-y-4">{cancelledBookings.map((b: any) => <BookingCard key={b.id} booking={b} />)}</div>}
          </TabsContent>
        </Tabs>
      </div>
    </PunditLayout>
  );
};

export default PunditBookings;
