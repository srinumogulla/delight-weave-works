import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAdminAnalytics, getAdminAnalyticsRevenue, getAdminTransactions } from '@/api/admin';
import { 
  Calendar, Users, BookOpen, TrendingUp, IndianRupee, Gift, Building2, UserCheck,
  ArrowRight, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const data = await getAdminAnalytics();
      return {
        totalBookings: data?.total_bookings || 0,
        totalUsers: data?.total_users || 0,
        totalServices: data?.total_poojas || data?.total_services || 0,
        pendingBookings: data?.pending_bookings || 0,
        giftBookings: data?.gift_bookings || 0,
        totalTemples: data?.total_temples || 0,
        pendingPundits: data?.pending_approvals || data?.pending_gurus || 0,
        totalRevenue: data?.total_revenue || 0,
      };
    },
  });

  const { data: recentBookings = [] } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: async () => {
      const data = await getAdminTransactions();
      return (data || []).slice(0, 5);
    },
  });

  const { data: bookingTrend = [] } = useQuery({
    queryKey: ['admin-booking-trend'],
    queryFn: async () => {
      try {
        const data = await getAdminAnalyticsRevenue();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
  });

  const statCards = [
    { title: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, description: 'Lifetime earnings', color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: Calendar, description: 'All time bookings', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { title: 'Pending Bookings', value: stats?.pendingBookings || 0, icon: Clock, description: 'Awaiting confirmation', color: 'text-orange-500', bgColor: 'bg-orange-500/10', href: '/admin/bookings' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, description: 'Registered users', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { title: 'Pooja Services', value: stats?.totalServices || 0, icon: BookOpen, description: 'Active services', color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Gift Bookings', value: stats?.giftBookings || 0, icon: Gift, description: 'Pooja gifts sent', color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
    { title: 'Partner Temples', value: stats?.totalTemples || 0, icon: Building2, description: 'Temple network', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    { title: 'Pending Approvals', value: stats?.pendingPundits || 0, icon: UserCheck, description: 'Pundit applications', color: 'text-red-500', bgColor: 'bg-red-500/10', href: '/admin/approvals' },
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

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden">
              {stat.href ? <Link to={stat.href} className="absolute inset-0 z-10" /> : null}
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{isLoading ? '...' : stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Booking Trend</CardTitle>
              <CardDescription>Recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bookingTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis allowDecimals={false} className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest booking activity</CardDescription>
              </div>
              <Link to="/admin/bookings">
                <Button variant="ghost" size="sm">View All<ArrowRight className="h-4 w-4 ml-1" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No recent bookings</p>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{booking.sankalpa_name || booking.user_name || 'Booking'}</p>
                        <p className="text-sm text-muted-foreground truncate">{booking.pooja_name || 'Service'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge className={statusColors[booking.status || 'pending']}>{booking.status || 'pending'}</Badge>
                        {booking.created_at && <p className="text-sm text-muted-foreground mt-1">{format(new Date(booking.created_at), 'MMM d')}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/services"><Button variant="outline"><BookOpen className="h-4 w-4 mr-2" />Add Service</Button></Link>
              <Link to="/admin/events"><Button variant="outline"><Calendar className="h-4 w-4 mr-2" />Add Event</Button></Link>
              <Link to="/admin/approvals">
                <Button variant="outline">
                  <UserCheck className="h-4 w-4 mr-2" />Review Approvals
                  {(stats?.pendingPundits || 0) > 0 && <Badge variant="destructive" className="ml-2">{stats?.pendingPundits}</Badge>}
                </Button>
              </Link>
              <Link to="/admin/reports"><Button variant="outline"><TrendingUp className="h-4 w-4 mr-2" />View Reports</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
