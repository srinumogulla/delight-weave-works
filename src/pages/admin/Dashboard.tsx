import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Users, BookOpen, TrendingUp } from 'lucide-react';

interface Stats {
  totalBookings: number;
  totalUsers: number;
  totalServices: number;
  pendingBookings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalUsers: 0,
    totalServices: 0,
    pendingBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [bookingsRes, usersRes, servicesRes, pendingRes] = await Promise.all([
          supabase.from('bookings').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('pooja_services').select('id', { count: 'exact', head: true }),
          supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);

        setStats({
          totalBookings: bookingsRes.count || 0,
          totalUsers: usersRes.count || 0,
          totalServices: servicesRes.count || 0,
          pendingBookings: pendingRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { 
      title: 'Total Bookings', 
      value: stats.totalBookings, 
      icon: Calendar, 
      description: 'All time bookings',
      color: 'text-blue-500'
    },
    { 
      title: 'Pending Bookings', 
      value: stats.pendingBookings, 
      icon: TrendingUp, 
      description: 'Awaiting confirmation',
      color: 'text-orange-500'
    },
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: Users, 
      description: 'Registered users',
      color: 'text-green-500'
    },
    { 
      title: 'Pooja Services', 
      value: stats.totalServices, 
      icon: BookOpen, 
      description: 'Active services',
      color: 'text-purple-500'
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground">Welcome to the Vedic Pooja admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest bookings and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              No recent activity to display. Start by adding services and accepting bookings.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
