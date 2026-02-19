import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { getMyGuruProfile, getGuruAnalytics, getGuruEarnings } from '@/api/gurus';
import { PunditLayout } from '@/components/pundit/PunditLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, IndianRupee, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PunditDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isGuru = role === 'guru' || role === 'pundit' || role === 'admin';

  // Fetch guru profile
  const { data: guruProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['guru-profile'],
    queryFn: getMyGuruProfile,
    enabled: !!user && isGuru,
  });

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['guru-analytics'],
    queryFn: getGuruAnalytics,
    enabled: !!user && isGuru,
  });

  // Fetch earnings
  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ['guru-earnings'],
    queryFn: getGuruEarnings,
    enabled: !!user && isGuru,
  });

  useEffect(() => {
    if (!authLoading && !isGuru && user) {
      navigate('/');
    }
  }, [authLoading, isGuru, user, navigate]);

  if (authLoading || profileLoading) {
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

  const statsLoading = analyticsLoading || earningsLoading;

  const stats = [
    {
      title: 'Pending Bookings',
      value: statsLoading ? null : (analytics?.total_bookings || 0),
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    },
    {
      title: 'Completed Poojas',
      value: statsLoading ? null : (analytics?.total_poojas || 0),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'This Month Earnings',
      value: statsLoading ? null : `₹${(earnings?.total || 0).toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Rating',
      value: statsLoading ? null : (analytics?.rating || 0),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    }
  ];

  return (
    <PunditLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome, {guruProfile?.name || user.full_name || 'Guru'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your bookings, profile, and earnings
          </p>
        </div>

        {guruProfile?.approval_status === 'pending' && (
          <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-400">Profile Pending Approval</p>
                <p className="text-sm text-amber-700 dark:text-amber-500">
                  Your profile is under review by our admin team.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {guruProfile?.approval_status === 'approved' && (
          <Card className="border-green-500/50 bg-green-50 dark:bg-green-900/10">
            <CardContent className="flex items-center gap-3 py-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-400">Verified Guru</p>
                <p className="text-sm text-green-700 dark:text-green-500">
                  Your profile is verified. You can now receive bookings.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Earnings History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {earningsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !earnings?.history?.length ? (
              <p className="text-muted-foreground text-center py-8">
                No earnings yet. Complete bookings to start earning.
              </p>
            ) : (
              <div className="space-y-4">
                {earnings.history.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.pooja_name}</h4>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === 'paid' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      <span className="font-bold">₹{item.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PunditLayout>
  );
};

export default PunditDashboard;
