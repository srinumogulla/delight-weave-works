import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { TempleLayout } from '@/components/temple/TempleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, User, IndianRupee, Clock } from 'lucide-react';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const TempleBookings = () => {
  const { user } = useAuth();

  // Fetch temple profile
  const { data: templeProfile } = useQuery({
    queryKey: ['temple-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('temples')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch bookings for this temple's services
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['temple-bookings', templeProfile?.name],
    queryFn: async () => {
      if (!templeProfile?.name) return [];
      
      // First get services for this temple
      const { data: services } = await supabase
        .from('pooja_services')
        .select('id')
        .eq('temple', templeProfile.name);
      
      if (!services || services.length === 0) return [];
      
      const serviceIds = services.map(s => s.id);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles(full_name, email, phone),
          pooja_services(name)
        `)
        .in('service_id', serviceIds)
        .order('booking_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!templeProfile?.name
  });

  return (
    <TempleLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Temple Bookings
          </h1>
          <p className="text-muted-foreground">
            Bookings for services at {templeProfile?.name || 'your temple'}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Bookings Yet</h3>
              <p className="text-muted-foreground">
                You'll see bookings here once devotees book services at your temple.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{booking.pooja_services?.name}</h3>
                        <Badge className={statusColors[booking.status || 'pending']}>
                          {booking.status || 'pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {booking.profiles?.full_name || booking.sankalpa_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                        </div>
                        {booking.time_slot && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.time_slot}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 font-semibold">
                        <IndianRupee className="h-4 w-4" />
                        {(booking.amount || 0).toLocaleString()}
                      </div>
                      <Badge variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}>
                        {booking.payment_status || 'unpaid'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TempleLayout>
  );
};

export default TempleBookings;
