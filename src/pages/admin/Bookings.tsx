import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Check, X, Eye, Calendar as CalendarIcon, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { BookingDetailModal } from '@/components/admin/BookingDetailModal';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Booking = Tables<'bookings'> & {
  profiles?: { full_name: string | null; email: string | null; phone: string | null } | null;
  pooja_services?: { name: string; temple: string | null } | null;
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Fetch verified pundits for assignment
  const { data: pundits = [] } = useQuery({
    queryKey: ['verified-pundits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pundits')
        .select('id, name, location')
        .eq('is_verified', true)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles(full_name, email, phone),
          pooja_services(name, temple)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings((data as Booking[]) || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(bookingId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
      
      toast({
        title: 'Success',
        description: `Booking ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking',
        variant: 'destructive',
      });
    }
  }

  async function assignPundit(bookingId: string, punditId: string) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ assigned_pundit_id: punditId || null })
        .eq('id', bookingId);

      if (error) throw error;
      
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, assigned_pundit_id: punditId || null } : b)
      );
      
      toast({
        title: 'Success',
        description: punditId ? 'Pundit assigned' : 'Pundit unassigned',
      });
    } catch (error) {
      console.error('Error assigning pundit:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign pundit',
        variant: 'destructive',
      });
    }
  }

  async function updateNotes(bookingId: string, notes: string) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ admin_notes: notes })
        .eq('id', bookingId);

      if (error) throw error;
      
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, admin_notes: notes } : b)
      );
      
      toast({
        title: 'Success',
        description: 'Notes saved',
      });
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        variant: 'destructive',
      });
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.pooja_services?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openDetailModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailModalOpen(true);
  };

  // Calendar view helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter(b => isSameDay(new Date(b.booking_date), date));
  };

  // Mobile card view
  const MobileBookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="cursor-pointer" onClick={() => openDetailModal(booking)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {(booking.profiles?.full_name || booking.sankalpa_name)?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{booking.profiles?.full_name || booking.sankalpa_name}</p>
              <p className="text-sm text-muted-foreground">{booking.pooja_services?.name}</p>
            </div>
          </div>
          <Badge className={statusColors[booking.status || 'pending']}>
            {booking.status || 'pending'}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {format(new Date(booking.booking_date), 'MMM d, yyyy')}
          </span>
          <span className="font-medium">₹{(booking.amount || 0).toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Bookings</h2>
            <p className="text-muted-foreground">Manage all pooja bookings</p>
          </div>
          {!isMobile && (
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}>
              <TabsList>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Calendar
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile: Card View */}
        {isMobile ? (
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading bookings...</p>
            ) : filteredBookings.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No bookings found</p>
            ) : (
              filteredBookings.map((booking) => (
                <MobileBookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        ) : viewMode === 'calendar' ? (
          /* Calendar View */
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}>
                  Previous
                </Button>
                <h3 className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
                <Button variant="outline" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}>
                  Next
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
                {/* Add empty cells for days before month start */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}
                {daysInMonth.map(day => {
                  const dayBookings = getBookingsForDate(day);
                  return (
                    <div 
                      key={day.toISOString()} 
                      className="min-h-[80px] border rounded-md p-1 hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-sm font-medium">{format(day, 'd')}</div>
                      <div className="space-y-1 mt-1">
                        {dayBookings.slice(0, 2).map(booking => (
                          <div 
                            key={booking.id}
                            className={`text-xs p-1 rounded cursor-pointer truncate ${statusColors[booking.status || 'pending']}`}
                            onClick={() => openDetailModal(booking)}
                          >
                            {booking.pooja_services?.name}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayBookings.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Desktop: Table View */
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading bookings...
                      </TableCell>
                    </TableRow>
                  ) : filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.profiles?.full_name || booking.sankalpa_name}</div>
                            <div className="text-sm text-muted-foreground">{booking.profiles?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{booking.pooja_services?.name || 'Unknown Service'}</TableCell>
                        <TableCell>
                          <div>
                            <div>{format(new Date(booking.booking_date), 'MMM d, yyyy')}</div>
                            <div className="text-sm text-muted-foreground">{booking.time_slot || 'TBD'}</div>
                          </div>
                        </TableCell>
                        <TableCell>₹{(booking.amount || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[booking.status || 'pending'] || ''}>
                            {booking.status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDetailModal(booking)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        pundits={pundits}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onAssignPundit={assignPundit}
        onUpdateNotes={updateNotes}
        onUpdateStatus={updateBookingStatus}
      />
    </AdminLayout>
  );
}
