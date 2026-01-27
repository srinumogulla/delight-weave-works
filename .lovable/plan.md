
# Comprehensive Enhancement Plan: Pundit Dashboard, Reports, Mobile Navigation & Booking Flow

## Overview
This plan addresses all your requirements including enhancing the Pundit Dashboard with real data, connecting Reports with real database queries, fixing mobile navigation issues in both admin and public areas, and adding Gift Pooja to the bottom menu.

---

## Phase 1: Fix Admin Mobile Navigation Issues

### 1.1 Problem Analysis
The issue is that clicking "Services" and "Bookings" in the admin mobile bottom nav might be triggering the drawer instead of navigating. The current `AdminMobileNav.tsx` looks correct with proper `Link` components, so I need to verify the implementation is working and ensure there are no event conflicts.

### 1.2 Fix AdminMobileNav.tsx
Ensure the navigation links work correctly by:
- Verifying the `Link` components are properly set up
- Adding explicit `onClick` prevention if there are any parent handlers
- Ensuring the z-index is correct

### 1.3 Fix AdminDrawer Navigation
The hamburger menu items in `AdminDrawer.tsx` should close the drawer AND navigate. Currently it has `onClick={() => onOpenChange(false)}` which should work. Need to verify the Links are working properly.

**Code Change:**
```tsx
// AdminMobileNav.tsx - Ensure proper navigation
<Link
  key={item.href}
  to={item.href}
  className={cn(...)}
  onClick={(e) => e.stopPropagation()} // Prevent any parent handlers
>
```

---

## Phase 2: Add "Gift Pooja" to Main Mobile Bottom Nav

### 2.1 Update MobileBottomNav.tsx
**File:** `src/components/mobile/MobileBottomNav.tsx`

Add Gift Pooja icon between Panchang and Bookings:

```tsx
import { Home, Sun, Gift, Calendar, User } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Panchang', href: '/panchang', icon: Sun },
  { label: 'Gift', href: '/gift-pooja', icon: Gift }, // NEW
  { label: 'Bookings', href: '/profile/bookings', icon: Calendar, requireAuth: true },
  { label: 'Profile', href: '/profile', icon: User, requireAuth: true },
];
```

---

## Phase 3: Enhance Pundit Dashboard with Real Booking Stats

### 3.1 Add Real Stats Queries
**File:** `src/pages/pundit/Dashboard.tsx`

Replace hardcoded "0" values with actual database queries:

```tsx
// Fetch real booking stats for this pundit
const { data: bookingStats } = useQuery({
  queryKey: ['pundit-booking-stats', punditProfile?.id],
  queryFn: async () => {
    if (!punditProfile?.id) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = format(new Date(), 'yyyy-MM-01');
    
    const [pendingRes, completedRes, upcomingRes, earningsRes] = await Promise.all([
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_pundit_id', punditProfile.id)
        .eq('status', 'pending'),
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_pundit_id', punditProfile.id)
        .eq('status', 'completed'),
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_pundit_id', punditProfile.id)
        .in('status', ['pending', 'confirmed'])
        .gte('booking_date', today),
      supabase
        .from('bookings')
        .select('amount')
        .eq('assigned_pundit_id', punditProfile.id)
        .eq('status', 'completed')
        .gte('booking_date', startOfMonth)
    ]);
    
    const totalEarnings = earningsRes.data?.reduce((sum, b) => sum + (Number(b.amount) || 0), 0) || 0;
    
    return {
      pending: pendingRes.count || 0,
      completed: completedRes.count || 0,
      upcoming: upcomingRes.count || 0,
      monthEarnings: totalEarnings
    };
  },
  enabled: !!punditProfile?.id
});
```

### 3.2 Add Recent Bookings List
Fetch and display actual recent bookings assigned to this pundit:

```tsx
// Fetch recent bookings
const { data: recentBookings = [] } = useQuery({
  queryKey: ['pundit-recent-bookings', punditProfile?.id],
  queryFn: async () => {
    if (!punditProfile?.id) return [];
    
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        pooja_services(name, image_url)
      `)
      .eq('assigned_pundit_id', punditProfile.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    return data || [];
  },
  enabled: !!punditProfile?.id
});
```

### 3.3 Add Accept/Decline Booking Actions
Allow pundits to accept or decline their assigned bookings:

```tsx
async function handleAcceptBooking(bookingId: string) {
  await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId);
  queryClient.invalidateQueries(['pundit-recent-bookings']);
}

async function handleDeclineBooking(bookingId: string) {
  await supabase
    .from('bookings')
    .update({ status: 'cancelled', assigned_pundit_id: null })
    .eq('id', bookingId);
  queryClient.invalidateQueries(['pundit-recent-bookings']);
}
```

---

## Phase 4: Enhance Pundit Bookings Page with Real Data

### 4.1 Update PunditBookings.tsx
**File:** `src/pages/pundit/Bookings.tsx`

Add real booking queries:

```tsx
const { data: bookings = [], isLoading } = useQuery({
  queryKey: ['pundit-all-bookings', punditProfile?.id],
  queryFn: async () => {
    if (!punditProfile?.id) return [];
    
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        pooja_services(name, price, duration)
      `)
      .eq('assigned_pundit_id', punditProfile.id)
      .order('booking_date', { ascending: false });
    
    return data || [];
  },
  enabled: !!punditProfile?.id
});

const upcomingBookings = bookings.filter(b => 
  ['pending', 'confirmed'].includes(b.status) && 
  new Date(b.booking_date) >= new Date()
);
const completedBookings = bookings.filter(b => b.status === 'completed');
const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
```

### 4.2 Add Booking Cards
Display booking details with action buttons:

```tsx
function BookingCard({ booking, onAccept, onDecline, showActions }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{booking.pooja_services?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(booking.booking_date), 'PPP')} at {booking.time_slot}
            </p>
            <p className="text-sm">Devotee: {booking.sankalpa_name}</p>
            <p className="text-sm">Amount: ₹{booking.amount}</p>
          </div>
          {showActions && booking.status === 'pending' && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onAccept(booking.id)}>Accept</Button>
              <Button size="sm" variant="outline" onClick={() => onDecline(booking.id)}>Decline</Button>
            </div>
          )}
        </div>
        <Badge className="mt-2">{booking.status}</Badge>
      </CardContent>
    </Card>
  );
}
```

---

## Phase 5: Enhance Pundit Earnings Page with Real Data

### 5.1 Update PunditEarnings.tsx
**File:** `src/pages/pundit/Earnings.tsx`

Add real earnings queries:

```tsx
const { data: earningsData } = useQuery({
  queryKey: ['pundit-earnings', punditProfile?.id],
  queryFn: async () => {
    if (!punditProfile?.id) return null;
    
    const startOfMonth = format(new Date(), 'yyyy-MM-01');
    
    const [allTime, thisMonth, pendingPayouts] = await Promise.all([
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
        .gte('booking_date', startOfMonth),
      supabase
        .from('bookings')
        .select('amount')
        .eq('assigned_pundit_id', punditProfile.id)
        .eq('status', 'completed')
        .eq('payment_status', 'paid')
        // Assuming pending payout = paid by customer but not yet transferred
    ]);
    
    return {
      total: allTime.data?.reduce((sum, b) => sum + (Number(b.amount) || 0), 0) || 0,
      thisMonth: thisMonth.data?.reduce((sum, b) => sum + (Number(b.amount) || 0), 0) || 0,
      pending: 0 // Placeholder - would need payout tracking
    };
  },
  enabled: !!punditProfile?.id
});
```

---

## Phase 6: Connect Reports Page with Real Database Queries

### 6.1 Current State
The Reports page (`src/pages/admin/Reports.tsx`) is **already connected** to real database queries! It fetches:
- Bookings within date range
- New users in date range
- Calculates revenue from completed bookings
- Shows booking status distribution
- Has working CSV export

### 6.2 Enhancements to Add
Add more comprehensive data:

```tsx
// Add gift bookings to reports
const { data: giftBookings = [] } = useQuery({
  queryKey: ['report-gift-bookings', startDate, endDate],
  queryFn: async () => {
    const { data } = await supabase
      .from('gift_bookings')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    return data || [];
  },
});

// Add service category breakdown
const categoryBreakdown = bookings.reduce((acc, b) => {
  // Would need to join with pooja_services to get category
  return acc;
}, {});
```

---

## Phase 7: Complete Booking Flow Testing

### 7.1 End-to-End Flow
The booking flow works as follows:
1. **User books pooja** → Creates entry in `bookings` table with `status: 'pending'`
2. **Admin sees booking** → In `/admin/bookings`, can view details via `BookingDetailModal`
3. **Admin assigns pundit** → Updates `assigned_pundit_id` in booking
4. **Pundit sees in dashboard** → Queries `bookings` where `assigned_pundit_id = pundit.id`
5. **Pundit accepts** → Updates `status: 'confirmed'`
6. **After completion** → Updates `status: 'completed'`

### 7.2 Already Implemented
- BookingDetailModal with pundit assignment ✓
- Admin can update booking status ✓
- RLS policies allow pundits to view/update assigned bookings ✓

### 7.3 Remaining Work
- Add real-time notifications when pundit is assigned (future)
- Add email notifications (future)

---

## Summary of File Changes

### Files to Modify:

1. **`src/components/admin/AdminMobileNav.tsx`**
   - Add `onClick={(e) => e.stopPropagation()}` to links to ensure navigation works

2. **`src/components/admin/AdminDrawer.tsx`**
   - Verify drawer closes and navigates properly (already has this)

3. **`src/components/mobile/MobileBottomNav.tsx`**
   - Add "Gift" nav item between Panchang and Bookings

4. **`src/pages/pundit/Dashboard.tsx`**
   - Add real booking stats queries
   - Add recent bookings list with accept/decline actions
   - Replace hardcoded "0" values with real data

5. **`src/pages/pundit/Bookings.tsx`**
   - Add real booking queries
   - Add booking cards with details
   - Add accept/decline functionality

6. **`src/pages/pundit/Earnings.tsx`**
   - Add real earnings queries
   - Show actual transaction history from completed bookings

7. **`src/pages/admin/Reports.tsx`**
   - Add gift bookings stats
   - Enhance with more breakdown data

---

## Mobile Responsiveness

All changes will work on both desktop and mobile:
- Pundit Dashboard already uses `PunditLayout` which handles mobile layout
- Admin pages use `AdminLayout` which handles mobile
- Bottom nav changes are mobile-only components

---

## Implementation Order

1. **Fix Admin Mobile Navigation** - Critical fix
2. **Add Gift Pooja to Main Bottom Nav** - Simple addition
3. **Enhance Pundit Dashboard** - Core functionality
4. **Enhance Pundit Bookings** - Complete the pundit experience
5. **Enhance Pundit Earnings** - Financial tracking
6. **Enhance Reports** - Admin analytics
