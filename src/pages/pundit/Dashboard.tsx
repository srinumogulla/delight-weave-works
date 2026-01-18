import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { PunditLayout } from '@/components/pundit/PunditLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, IndianRupee, CheckCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PunditDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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
      value: '0',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    },
    {
      title: 'Completed Poojas',
      value: '0',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'This Month Earnings',
      value: '₹0',
      icon: IndianRupee,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Upcoming Poojas',
      value: '0',
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

        {/* Verification Status */}
        {punditProfile && !punditProfile.is_verified && (
          <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-400">
                  Profile Under Review
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-500">
                  Your profile is pending verification. You'll be notified once approved.
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
                No bookings yet. Once verified, you'll start receiving bookings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No upcoming poojas scheduled.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PunditLayout>
  );
};

export default PunditDashboard;
