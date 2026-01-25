import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  TrendingUp, 
  IndianRupee, 
  Gift, 
  Building2, 
  UserCheck,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  // Fetch all stats in parallel
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [
        bookingsRes,
        usersRes,
        servicesRes,
        pendingRes,
        giftRes,
        templesRes,
        punditsRes,
        revenueRes
      ] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('pooja_services').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('gift_bookings').select('id', { count: 'exact', head: true }),
        supabase.from('temples').select('id', { count: 'exact', head: true }),
        supabase.from('pundits').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending'),
        supabase.from('bookings').select('amount').eq('payment_status', 'paid'),
      ]);

      const totalRevenue = (revenueRes.data || []).reduce((sum, b) => sum + (b.amount || 0), 0);

      return {
        totalBookings: bookingsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalServices: servicesRes.count || 0,
        pendingBookings: pendingRes.count || 0,
        giftBookings: giftRes.count || 0,
        totalTemples: templesRes.count || 0,
        pendingPundits: punditsRes.count || 0,
        totalRevenue,
      };
    },
  });

  // Fetch recent bookings
  const { data: recentBookings = [] } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          sankalpa_name,
          booking_date,
          status,
          amount,
          created_at,
          pooja_services(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // Fetch booking trend (last 7 days)
  const { data: bookingTrend = [] } = useQuery({
    queryKey: ['admin-booking-trend'],
    queryFn: async () => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'yyyy-MM-dd');
      });

      const { data, error } = await supabase
        .from('bookings')
        .select('booking_date, amount')
        .gte('booking_date', last7Days[0])
        .lte('booking_date', last7Days[6]);

      if (error) throw error;

      // Group by date
      return last7Days.map(date => {
        const dayBookings = (data || []).filter(b => b.booking_date === date);
        return {
          date: format(new Date(date), 'MMM d'),
          bookings: dayBookings.length,
          revenue: dayBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
        };
      });
    },
  });

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, 
      icon: IndianRupee, 
      description: 'Lifetime earnings',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      title: 'Total Bookings', 
      value: stats?.totalBookings || 0, 
      icon: Calendar, 
      description: 'All time bookings',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      title: 'Pending Bookings', 
      value: stats?.pendingBookings || 0, 
      icon: Clock, 
      description: 'Awaiting confirmation',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      href: '/admin/bookings'
    },
    { 
      title: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      description: 'Registered users',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      title: 'Pooja Services', 
      value: stats?.totalServices || 0, 
      icon: BookOpen, 
      description: 'Active services',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      title: 'Gift Bookings', 
      value: stats?.giftBookings || 0, 
      icon: Gift, 
      description: 'Pooja gifts sent',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    },
    { 
      title: 'Partner Temples', 
      value: stats?.totalTemples || 0, 
      icon: Building2, 
      description: 'Temple network',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    },
    { 
      title: 'Pending Approvals', 
      value: stats?.pendingPundits || 0, 
      icon: UserCheck, 
      description: 'Pundit applications',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      href: '/admin/approvals'
    },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground">Welcome to the Vedic Pooja admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden">
              {stat.href ? (
                <Link to={stat.href} className="absolute inset-0 z-10" />
              ) : null}
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {isLoading ? '...' : stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Booking Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Trend</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bookingTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis allowDecimals={false} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest booking activity</CardDescription>
              </div>
              <Link to="/admin/bookings">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No recent bookings
                </p>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{booking.sankalpa_name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {booking.pooja_services?.name || 'Unknown Service'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge className={statusColors[booking.status || 'pending']}>
                          {booking.status || 'pending'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(booking.booking_date), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/services">
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </Link>
              <Link to="/admin/events">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </Link>
              <Link to="/admin/approvals">
                <Button variant="outline">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Review Approvals
                  {(stats?.pendingPundits || 0) > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {stats?.pendingPundits}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
