import { PunditLayout } from '@/components/pundit/PunditLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, TrendingUp, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PunditEarnings = () => {
  const stats = [
    { label: 'Total Earnings', value: '₹0', icon: IndianRupee },
    { label: 'This Month', value: '₹0', icon: Calendar },
    { label: 'Pending Payout', value: '₹0', icon: TrendingUp },
  ];

  return (
    <PunditLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Earnings
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your earnings and payment history
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
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
            <p className="text-muted-foreground text-center py-12">
              No transactions yet. Your earnings from completed poojas will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </PunditLayout>
  );
};

export default PunditEarnings;
