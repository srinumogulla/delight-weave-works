import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { PunditLayout } from '@/components/pundit/PunditLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, TrendingUp, Calendar, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PunditEarnings = () => {
  const { user } = useAuth();

  // Fetch pundit profile
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
    enabled: !!user?.id
  });

  // Fetch earnings data
  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: ['pundit-earnings', punditProfile?.id],
    queryFn: async () => {
      if (!punditProfile?.id) return null;
      
      const startOfMonth = format(new Date(), 'yyyy-MM-01');
      
      const [allTimeRes, thisMonthRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('amount')
          .eq('assigned_pundit_id', punditProfile.id)
          .eq('status', 'completed'),
        supabase
          .from('bookings')
          .select('amount')
          .eq('assigned_pundit_id', punditProfile.id)
          .eq('status', 'completed')
          .gte('booking_date', startOfMonth)
      ]);
      
      return {
        total: allTimeRes.data?.reduce((sum, b) => sum + (Number(b.amount) || 0), 0) || 0,
        thisMonth: thisMonthRes.data?.reduce((sum, b) => sum + (Number(b.amount) || 0), 0) || 0,
        pending: 0 // Would need payout tracking table for real implementation
      };
    },
    enabled: !!punditProfile?.id
  });

  // Fetch transaction history (completed bookings with amounts)
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['pundit-transactions', punditProfile?.id],
    queryFn: async () => {
      if (!punditProfile?.id) return [];
      
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          pooja_services(name)
        `)
        .eq('assigned_pundit_id', punditProfile.id)
        .eq('status', 'completed')
        .not('amount', 'is', null)
        .order('booking_date', { ascending: false })
        .limit(20);
      
      return data || [];
    },
    enabled: !!punditProfile?.id
  });

  const handleExport = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['Date', 'Service', 'Devotee', 'Amount', 'Status'];
    const rows = transactions.map((t: any) => [
      t.booking_date,
      t.pooja_services?.name || 'Unknown',
      t.sankalpa_name,
      t.amount,
      t.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Earnings exported successfully');
  };

  const stats = [
    { 
      label: 'Total Earnings', 
      value: earningsLoading ? null : `₹${(earningsData?.total || 0).toLocaleString()}`, 
      icon: IndianRupee 
    },
    { 
      label: 'This Month', 
      value: earningsLoading ? null : `₹${(earningsData?.thisMonth || 0).toLocaleString()}`, 
      icon: Calendar 
    },
    { 
      label: 'Pending Payout', 
      value: earningsLoading ? null : `₹${(earningsData?.pending || 0).toLocaleString()}`, 
      icon: TrendingUp 
    },
  ];

  return (
    <PunditLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Earnings
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your earnings and payment history
            </p>
          </div>
          <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
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

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">
                No transactions yet. Your earnings from completed poojas will appear here.
              </p>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction: any) => (
                  <div 
                    key={transaction.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {transaction.pooja_services?.name || 'Pooja Service'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.booking_date), 'MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Devotee: {transaction.sankalpa_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        Completed
                      </Badge>
                      <span className="font-bold text-lg">
                        ₹{transaction.amount?.toLocaleString() || 0}
                      </span>
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

export default PunditEarnings;
