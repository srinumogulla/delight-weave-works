import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { getMyTransactions } from '@/api/transactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { format } from 'date-fns';

const ProfileBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: bookings = [], isLoading: loading } = useQuery({
    queryKey: ['my-transactions'],
    queryFn: () => getMyTransactions(),
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const content = (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-sanskrit text-saffron">My Bookings</h1>
          <p className="text-muted-foreground text-sm">View your past and upcoming pooja bookings</p>
        </div>

        <Card className="border-saffron/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Booking History</CardTitle>
            <CardDescription>All your pooja bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-saffron" /></div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No bookings yet</p>
                <Button className="mt-4 bg-gradient-to-r from-saffron to-gold text-temple-dark" onClick={() => navigate('/services')}>Book a Pooja</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <div key={booking.id} className="flex items-center gap-4 p-4 rounded-lg bg-temple-dark/30 border border-saffron/10">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-temple-dark flex-shrink-0">
                      <img src={booking.image_url || booking.pooja_image || '/ritual-pooja.jpg'} alt={booking.pooja_name || 'Pooja'} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{booking.pooja_name || 'Pooja Service'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {booking.created_at ? format(new Date(booking.created_at), 'MMM d, yyyy') : 'N/A'}
                      </p>
                      <p className="text-sm text-saffron truncate">Amount: ₹{booking.amount || 0}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge className={getStatusColor(booking.status || 'pending')}>{booking.status || 'pending'}</Badge>
                      <p className="text-sm text-gold mt-1">₹{booking.amount || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );

  if (isMobile) return <MobileLayout title="My Bookings">{content}</MobileLayout>;

  return <div className="min-h-screen bg-background flex flex-col"><Header />{content}<Footer /></div>;
};

export default ProfileBookings;
