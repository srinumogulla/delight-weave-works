import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { TempleLayout } from '@/components/temple/TempleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, IndianRupee, CheckCircle, AlertCircle, BookOpen, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const TempleDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Check if user has temple role
  const { data: hasTempleRole, isLoading: roleLoading } = useQuery({
    queryKey: ['temple-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'temple')
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id
  });

  // Fetch temple profile if linked
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
    enabled: !!user?.id && hasTempleRole
  });

  // Fetch temple stats
  const { data: stats } = useQuery({
    queryKey: ['temple-stats', templeProfile?.name],
    queryFn: async () => {
      if (!templeProfile?.name) return { services: 0, bookings: 0, revenue: 0, pending: 0 };
      
      const [servicesRes, bookingsRes] = await Promise.all([
        supabase
          .from('pooja_services')
          .select('*', { count: 'exact', head: true })
          .eq('temple', templeProfile.name)
          .eq('is_active', true),
        supabase
          .from('bookings')
          .select('amount, status, pooja_services!inner(temple)')
          .eq('pooja_services.temple', templeProfile.name)
      ]);

      const bookings = bookingsRes.data || [];
      const completedBookings = bookings.filter(b => b.status === 'completed');
      const pendingBookings = bookings.filter(b => b.status === 'pending');
      const revenue = completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

      return {
        services: servicesRes.count || 0,
        bookings: bookings.length,
        revenue,
        pending: pendingBookings.length
      };
    },
    enabled: !!templeProfile?.name
  });

  // Redirect if not temple role
  useEffect(() => {
    if (!authLoading && !roleLoading && !hasTempleRole && user) {
      navigate('/');
    }
  }, [authLoading, roleLoading, hasTempleRole, user, navigate]);

  if (authLoading || roleLoading) {
    return (
      <TempleLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </TempleLayout>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const statCards = [
    {
      title: 'Active Services',
      value: stats?.services || 0,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Total Bookings',
      value: stats?.bookings || 0,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Pending Bookings',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.revenue || 0).toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    }
  ];

  return (
    <TempleLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome, {templeProfile?.name || 'Temple Manager'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your temple services and bookings
          </p>
        </div>

        {/* Approval Status Banners */}
        {templeProfile?.approval_status === 'pending' && (
          <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-400">
                  Temple Pending Approval
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-500">
                  Your temple is under review. You can set up services but they won't be visible until approved.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {templeProfile?.approval_status === 'approved' && templeProfile?.is_active && (
          <Card className="border-green-500/50 bg-green-50 dark:bg-green-900/10">
            <CardContent className="flex items-center gap-3 py-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-400">
                  Temple Active
                </p>
                <p className="text-sm text-green-700 dark:text-green-500">
                  Your temple is live and accepting bookings from devotees.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
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
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No recent bookings to display.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No services configured yet.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TempleLayout>
  );
};

export default TempleDashboard;
