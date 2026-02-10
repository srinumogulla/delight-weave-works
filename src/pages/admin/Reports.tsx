import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAdminAnalyticsRevenue, getAdminAnalyticsUsers, getAdminAnalytics } from '@/integrations/vedhaApi/admin';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Download, Calendar, IndianRupee, Users, TrendingUp, Loader2, Gift } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#22c55e', '#eab308', '#ef4444'];

export default function AdminReports() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['report-revenue', startDate, endDate],
    queryFn: async () => {
      try {
        const data = await getAdminAnalyticsRevenue();
        return data || {};
      } catch { return {}; }
    },
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['report-users', startDate, endDate],
    queryFn: async () => {
      try {
        const data = await getAdminAnalyticsUsers();
        return data || {};
      } catch { return {}; }
    },
  });

  const { data: overview } = useQuery({
    queryKey: ['report-overview'],
    queryFn: () => getAdminAnalytics(),
  });

  const totalBookings = (revenueData as any)?.total_bookings || overview?.total_bookings || 0;
  const totalGiftBookings = (revenueData as any)?.gift_bookings || 0;
  const totalRevenue = (revenueData as any)?.total_revenue || overview?.total_revenue || 0;
  const giftRevenue = (revenueData as any)?.gift_revenue || 0;
  const completedBookings = (revenueData as any)?.completed || 0;
  const newUsers = (usersData as any)?.new_users || 0;

  const statusData = ((revenueData as any)?.status_distribution || []).filter((d: any) => d.value > 0);
  const trendData = (revenueData as any)?.daily_trend || [];

  const isLoading = revenueLoading || usersLoading;

  const handleExportCSV = () => {
    toast({ title: 'Export initiated', description: 'Report download will begin shortly.' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6" />Reports & Analytics</h1>
            <p className="text-muted-foreground">View insights and export reports</p>
          </div>
          <Button onClick={handleExportCSV} disabled={isLoading} className="w-full sm:w-auto"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1 w-full"><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
              <div className="space-y-2 flex-1 w-full"><Label htmlFor="endDate">End Date</Label><Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => { setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd')); setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd')); }}>This Month</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Bookings</CardTitle><Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" /></CardHeader><CardContent><div className="text-xl sm:text-2xl font-bold">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalBookings}</div><p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Regular bookings</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Gift Bookings</CardTitle><Gift className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" /></CardHeader><CardContent><div className="text-xl sm:text-2xl font-bold">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalGiftBookings}</div><p className="text-[10px] sm:text-xs text-muted-foreground mt-1">₹{giftRevenue.toLocaleString()}</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Revenue</CardTitle><IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" /></CardHeader><CardContent><div className="text-xl sm:text-2xl font-bold">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `₹${(totalRevenue + giftRevenue).toLocaleString()}`}</div><p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Combined</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Completed</CardTitle><TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" /></CardHeader><CardContent><div className="text-xl sm:text-2xl font-bold">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : completedBookings}</div><p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{totalBookings > 0 ? `${Math.round((completedBookings / totalBookings) * 100)}%` : '0%'}</p></CardContent></Card>
          <Card className="col-span-2 lg:col-span-1"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">New Users</CardTitle><Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" /></CardHeader><CardContent><div className="text-xl sm:text-2xl font-bold">{newUsers}</div><p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Registered</p></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base sm:text-lg">Booking Trend</CardTitle><CardDescription className="text-xs sm:text-sm">Daily bookings</CardDescription></CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px]">
                {isLoading ? <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} className="text-xs" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="bookings" name="Regular" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="gifts" name="Gift" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base sm:text-lg">Booking Status</CardTitle><CardDescription className="text-xs sm:text-sm">Distribution by status</CardDescription></CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px]">
                {isLoading ? <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                 : statusData.length === 0 ? <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No booking data available</div>
                 : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {statusData.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip /><Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
