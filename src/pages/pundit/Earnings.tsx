import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { getGuruEarnings } from '@/api/gurus';
import { PunditLayout } from '@/components/pundit/PunditLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, TrendingUp, Calendar, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PunditEarnings = () => {
  const { user } = useAuth();

  const { data: earnings, isLoading } = useQuery({
    queryKey: ['guru-earnings'],
    queryFn: getGuruEarnings,
    enabled: !!user,
  });

  const handleExport = () => {
    if (!earnings?.history?.length) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['Date', 'Service', 'Amount', 'Status'];
    const rows = earnings.history.map((t) => [t.date, t.pooja_name, t.amount, t.status]);

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
    { label: 'Total Earnings', value: isLoading ? null : `₹${(earnings?.total || 0).toLocaleString()}`, icon: IndianRupee },
    { label: 'Pending Payout', value: isLoading ? null : `₹${(earnings?.pending || 0).toLocaleString()}`, icon: TrendingUp },
    { label: 'Paid Out', value: isLoading ? null : `₹${(earnings?.paid || 0).toLocaleString()}`, icon: Calendar },
  ];

  return (
    <PunditLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Earnings</h1>
            <p className="text-muted-foreground mt-1">Track your earnings and payment history</p>
          </div>
          <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={handleExport}>
            <Download className="h-4 w-4" />Export
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value === null ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : !earnings?.history?.length ? (
              <p className="text-muted-foreground text-center py-12">No transactions yet.</p>
            ) : (
              <div className="space-y-4">
                {earnings.history.map((transaction, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{transaction.pooja_name}</h4>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        {transaction.status}
                      </Badge>
                      <span className="font-bold text-lg">₹{transaction.amount.toLocaleString()}</span>
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
