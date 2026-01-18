import { PunditLayout } from '@/components/pundit/PunditLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

const PunditBookings = () => {
  return (
    <PunditLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Bookings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your pooja bookings and schedule
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-2">
              <Clock className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="gap-2">
              <XCircle className="h-4 w-4" />
              Cancelled
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  No upcoming bookings. Once you receive booking requests, they will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  No completed bookings yet.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cancelled">
            <Card>
              <CardHeader>
                <CardTitle>Cancelled Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  No cancelled bookings.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PunditLayout>
  );
};

export default PunditBookings;
