import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { PunditLayout } from '@/components/pundit/PunditLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, IndianRupee, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PunditDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check if user has pundit role
  const { data: hasPunditRole, isLoading: roleLoading } = useQuery({
    queryKey: ['pundit-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'pundit')
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id
  });

  // Fetch pundit's profile if linked
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
    enabled: !!user?.id && hasPunditRole
  });

  // Fetch real booking stats for this pundit
  const { data: bookingStats, isLoading: statsLoading } = useQuery({
    queryKey: ['pundit-booking-stats', punditProfile?.id],
    queryFn: async () => {
      if (!punditProfile?.id) return null;
      
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = format(new Date(), 'yyyy-MM-01');
      
      const [pendingRes, completedRes, upcomingRes, earningsRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_pundit_id', punditProfile.id)
          .eq('status', 'pending'),
        supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_pundit_id', punditProfile.id)
          .eq('status', 'completed'),
        supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_pundit_id', punditProfile.id)
          .in('status', ['pending', 'confirmed'])
          .gte('booking_date', today),
        supabase
          .from('bookings')
          .select('amount')
          .eq('assigned_pundit_id', punditProfile.id)
          .eq('status', 'completed')
          .gte('booking_date', startOfMonth)
      ]);
      
      const totalEarnings = earningsRes.data?.reduce((sum, b) => sum + (Number(b.amount) || 0), 0) || 0;
      
      return {
        pending: pendingRes.count || 0,
        completed: completedRes.count || 0,
        upcoming: upcomingRes.count || 0,
        monthEarnings: totalEarnings
      };
    },
    enabled: !!punditProfile?.id
  });

  // Fetch recent bookings
  const { data: recentBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['pundit-recent-bookings', punditProfile?.id],
    queryFn: async () => {
      if (!punditProfile?.id) return [];
      
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          pooja_services(name, image_url)
        `)
        .eq('assigned_pundit_id', punditProfile.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      return data || [];
    },
    enabled: !!punditProfile?.id
  });

  // Accept booking
  const handleAcceptBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId);
    
    if (error) {
      toast.error('Failed to accept booking');
    } else {
      toast.success('Booking accepted');
      queryClient.invalidateQueries({ queryKey: ['pundit-recent-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['pundit-booking-stats'] });
    }
  };

  // Decline booking
  const handleDeclineBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', assigned_pundit_id: null })
      .eq('id', bookingId);
    
    if (error) {
      toast.error('Failed to decline booking');
    } else {
      toast.success('Booking declined');
      queryClient.invalidateQueries({ queryKey: ['pundit-recent-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['pundit-booking-stats'] });
    }
  };

  // Redirect if not pundit
  useEffect(() => {
    if (!authLoading && !roleLoading && !hasPunditRole && user) {
      navigate('/');
    }
  }, [authLoading, roleLoading, hasPunditRole, user, navigate]);

  if (authLoading || roleLoading) {
    return (
      <PunditLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </PunditLayout>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const stats = [
    {
      title: 'Pending Bookings',
      value: statsLoading ? null : (bookingStats?.pending || 0),
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    },
    {
      title: 'Completed Poojas',
      value: statsLoading ? null : (bookingStats?.completed || 0),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'This Month Earnings',
      value: statsLoading ? null : `₹${(bookingStats?.monthEarnings || 0).toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Upcoming Poojas',
      value: statsLoading ? null : (bookingStats?.upcoming || 0),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    }
  ];

  return (
    <PunditLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome, {punditProfile?.name || user.email?.split('@')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your bookings, profile, and earnings
          </p>
        </div>

        {/* Approval Status Banners */}
        {punditProfile?.approval_status === 'pending' && (
          <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-400">
                  Profile Pending Approval
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-500">
                  Your profile is under review by our admin team. Complete your profile to speed up approval. You cannot accept bookings yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {punditProfile?.approval_status === 'rejected' && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">
                  Profile Not Approved
                </p>
                <p className="text-sm text-destructive/80">
                  Unfortunately, your profile was not approved. Please contact support at support@vedhamantra.com for more information.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {punditProfile?.approval_status === 'approved' && (
          <Card className="border-green-500/50 bg-green-50 dark:bg-green-900/10">
            <CardContent className="flex items-center gap-3 py-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-400">
                  Verified Pundit
                </p>
                <p className="text-sm text-green-700 dark:text-green-500">
                  Your profile is verified. You can now receive and accept bookings from devotees.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value === null ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    stat.value
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Bookings & Schedule */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentBookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No bookings yet. Once verified, you'll start receiving bookings.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex flex-col gap-2 p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {booking.pooja_services?.name || 'Pooja Service'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.booking_date), 'PPP')}
                            {booking.time_slot && ` at ${booking.time_slot}`}
                          </p>
                          <p className="text-sm">Devotee: {booking.sankalpa_name}</p>
                          {booking.amount && (
                            <p className="text-sm font-medium">₹{booking.amount}</p>
                          )}
                        </div>
                        <Badge variant={
                          booking.status === 'completed' ? 'default' :
                          booking.status === 'confirmed' ? 'secondary' :
                          booking.status === 'pending' ? 'outline' : 'destructive'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                      {booking.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentBookings.filter((b: any) => 
                  ['pending', 'confirmed'].includes(b.status) && 
                  new Date(b.booking_date) >= new Date()
                ).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No upcoming poojas scheduled.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentBookings
                    .filter((b: any) => 
                      ['pending', 'confirmed'].includes(b.status) && 
                      new Date(b.booking_date) >= new Date()
                    )
                    .slice(0, 5)
                    .map((booking: any) => (
                      <div key={booking.id} className="flex items-center gap-3 p-2 border rounded-lg">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">
                            {booking.pooja_services?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PunditLayout>
  );
};

export default PunditDashboard;
