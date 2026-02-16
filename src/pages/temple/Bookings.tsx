import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { apiGet } from '@/api/client';
import { TempleLayout } from '@/components/temple/TempleLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

const TempleBookings = () => {
  const { user } = useAuth();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['temple-bookings'],
    queryFn: () => apiGet<any[]>('/temples/bookings'),
    enabled: !!user,
  });

  return (
    <TempleLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" /> Bookings
          </h1>
          <p className="text-muted-foreground">Bookings at your temple</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Bookings Yet</h3>
              <p className="text-muted-foreground">Bookings will appear here when devotees book your services.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any) => (
              <Card key={booking.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{booking.pooja_name || 'Pooja'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.booking_date), 'PPP')}
                      {booking.time_slot && ` at ${booking.time_slot}`}
                    </p>
                    <p className="text-sm">Devotee: {booking.devotee_name || booking.sankalpa_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={booking.status === 'completed' ? 'default' : 'outline'}>{booking.status}</Badge>
                    {booking.amount && <span className="font-bold">₹{booking.amount}</span>}
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
