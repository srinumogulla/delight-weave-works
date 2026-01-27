import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { PunditLayout } from '@/components/pundit/PunditLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PunditBookings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch pundit profile
  const { data: punditProfile } = useQuery({
    queryKey: ['pundit-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('pundits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch all bookings for this pundit
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['pundit-all-bookings', punditProfile?.id],
    queryFn: async () => {
      if (!punditProfile?.id) return [];
      
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          pooja_services(name, price, duration, image_url)
        `)
        .eq('assigned_pundit_id', punditProfile.id)
        .order('booking_date', { ascending: false });
      
      return data || [];
    },
    enabled: !!punditProfile?.id
  });

  const today = new Date().toISOString().split('T')[0];
  const upcomingBookings = bookings.filter((b: any) => 
    ['pending', 'confirmed'].includes(b.status || '') && 
    b.booking_date >= today
  );
  const completedBookings = bookings.filter((b: any) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b: any) => b.status === 'cancelled');

  const handleAcceptBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId);
    
    if (error) {
      toast.error('Failed to accept booking');
    } else {
      toast.success('Booking accepted');
      queryClient.invalidateQueries({ queryKey: ['pundit-all-bookings'] });
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', assigned_pundit_id: null })
      .eq('id', bookingId);
    
    if (error) {
      toast.error('Failed to decline booking');
    } else {
      toast.success('Booking declined');
      queryClient.invalidateQueries({ queryKey: ['pundit-all-bookings'] });
    }
  };

  const handleMarkComplete = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', bookingId);
    
    if (error) {
      toast.error('Failed to mark as complete');
    } else {
      toast.success('Booking marked as complete');
      queryClient.invalidateQueries({ queryKey: ['pundit-all-bookings'] });
    }
  };

  const BookingCard = ({ booking, showActions = false }: { booking: any; showActions?: boolean }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              {booking.pooja_services?.image_url && (
                <img 
                  src={booking.pooja_services.image_url} 
                  alt={booking.pooja_services.name}
                  className="w-16 h-16 rounded-lg object-cover hidden sm:block"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {booking.pooja_services?.name || 'Pooja Service'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                  {booking.time_slot && ` at ${booking.time_slot}`}
                </p>
                <p className="text-sm mt-1">
                  <span className="text-muted-foreground">Devotee:</span> {booking.sankalpa_name}
                </p>
                {booking.gotra && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Gotra:</span> {booking.gotra}
                  </p>
                )}
                {booking.nakshatra && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Nakshatra:</span> {booking.nakshatra}
                  </p>
                )}
                {booking.amount && (
                  <p className="text-sm font-medium mt-1">Amount: ₹{booking.amount}</p>
                )}
                {booking.special_requests && (
                  <p className="text-sm text-muted-foreground mt-1 italic">
                    Note: {booking.special_requests}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={
              booking.status === 'completed' ? 'default' :
              booking.status === 'confirmed' ? 'secondary' :
              booking.status === 'pending' ? 'outline' : 'destructive'
            }>
              {booking.status}
            </Badge>
            {showActions && booking.status === 'pending' && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleAcceptBooking(booking.id)}
                >
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDeclineBooking(booking.id)}
                >
                  Decline
                </Button>
              </div>
            )}
            {showActions && booking.status === 'confirmed' && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleMarkComplete(booking.id)}
              >
                Mark Complete
              </Button>
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Bookings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your pooja bookings and schedule
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="w-full sm:w-auto flex">
            <TabsTrigger value="upcoming" className="flex-1 sm:flex-none gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Upcoming</span>
              <span className="sm:hidden">({upcomingBookings.length})</span>
              <span className="hidden sm:inline">({upcomingBookings.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 sm:flex-none gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Completed</span>
              <span className="sm:hidden">({completedBookings.length})</span>
              <span className="hidden sm:inline">({completedBookings.length})</span>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1 sm:flex-none gap-2">
              <XCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Cancelled</span>
              <span className="sm:hidden">({cancelledBookings.length})</span>
              <span className="hidden sm:inline">({cancelledBookings.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : upcomingBookings.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-12">
                    No upcoming bookings. Once you receive booking requests, they will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking: any) => (
                  <BookingCard key={booking.id} booking={booking} showActions />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : completedBookings.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Completed Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-12">
                    No completed bookings yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedBookings.map((booking: any) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : cancelledBookings.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Cancelled Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-12">
                    No cancelled bookings.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {cancelledBookings.map((booking: any) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PunditLayout>
  );
};

export default PunditBookings;
