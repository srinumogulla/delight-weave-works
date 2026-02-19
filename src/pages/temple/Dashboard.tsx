import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { getTempleAnalytics } from '@/api/temples';
import { TempleLayout } from '@/components/temple/TempleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, IndianRupee, BookOpen, Loader2 } from 'lucide-react';

const TempleDashboard = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['temple-analytics'],
    queryFn: getTempleAnalytics,
    enabled: !!user,
  });

  const stats = [
    { title: 'Total Poojas', value: isLoading ? null : (analytics?.total_poojas || 0), icon: BookOpen, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Total Bookings', value: isLoading ? null : (analytics?.total_bookings || 0), icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
    { title: 'Revenue', value: isLoading ? null : `₹${(analytics?.total_revenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' },
  ];

  return (
    <TempleLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Temple Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your temple operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value === null ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TempleLayout>
  );
};

export default TempleDashboard;
