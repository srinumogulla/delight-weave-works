

# Fix Admin Mobile Navigation Issues

## Problem Analysis

After thorough investigation, I've identified the root causes of the admin mobile navigation problems:

### Issue 1: Bottom Menu Clicks Opening Drawer / Not Working
The `Sheet` component from Radix UI (`AdminDrawer`) creates an invisible overlay that persists or has a high z-index. When the user opens the drawer once and closes it, residual overlay elements or incorrect z-index stacking causes clicks on the bottom nav to be intercepted.

**Root Cause:** The `AdminMobileNav` has `z-50`, but the `Sheet` overlay also uses `z-50`. When the drawer closes, there may be a timing issue or the overlay's click handler fires before the link navigation.

### Issue 2: Hamburger Menu Items Not Navigating
The drawer links call `onClick={() => onOpenChange(false)}` which closes the drawer, but on some devices/browsers, closing the sheet before navigation completes can cancel the navigation.

**Root Cause:** The `Link` component's navigation happens asynchronously, and calling `onOpenChange(false)` synchronously may close the sheet portal before React Router completes its navigation cycle.

### Issue 3: Bottom Menu Missing on Some Pages
All admin pages use `AdminLayout` which renders `AdminMobileNav` at line 88. If any admin page fails to wrap content in `AdminLayout`, or if there's a CSS issue hiding the nav, it will appear missing.

**Root Cause:** Likely a CSS z-index or positioning issue where the nav is rendered but obscured by content.

---

## Solution Plan

### Phase 1: Fix AdminMobileNav Z-Index and Pointer Events
**File:** `src/components/admin/AdminMobileNav.tsx`

1. Increase z-index to `z-[60]` (higher than Sheet's z-50)
2. Add `pointer-events-auto` to ensure clicks are captured
3. Add `position: relative` with explicit stacking context

```tsx
// Line 28: Update nav className
<nav className="fixed bottom-0 left-0 right-0 z-[60] bg-card border-t border-border safe-area-bottom md:hidden pointer-events-auto">
```

### Phase 2: Fix AdminDrawer Navigation Timing
**File:** `src/components/admin/AdminDrawer.tsx`

The problem is that closing the sheet before navigation can prevent navigation. The fix is to use `useNavigate` and handle navigation programmatically after a small delay, OR let the navigation happen first.

1. Import `useNavigate` from react-router-dom
2. Create a `handleNavigation` function that navigates first, then closes the drawer
3. Use `setTimeout` with 0ms to ensure navigation starts before sheet closes

```tsx
// Add at component level
const navigate = useNavigate();

const handleNavigation = (href: string) => {
  // Navigate first
  navigate(href);
  // Then close drawer after navigation initiates
  setTimeout(() => {
    onOpenChange(false);
  }, 0);
};

// Update Link onClick
<Link
  key={item.href}
  to={item.href}
  onClick={(e) => {
    e.preventDefault();
    handleNavigation(item.href);
  }}
  ...
>
```

### Phase 3: Fix Sheet Overlay Z-Index Competition
**File:** `src/components/ui/sheet.tsx`

The Sheet overlay uses `z-50`, which competes with the bottom nav. We should NOT modify the Sheet component directly as it's a shared UI component. Instead, we'll ensure the bottom nav is always above by using a higher z-index.

No changes needed here - Phase 1 handles this.

### Phase 4: Ensure Bottom Nav Visibility
**File:** `src/components/admin/AdminLayout.tsx`

Add explicit styling to ensure the bottom nav container doesn't get obscured:

1. Add `relative` to the main container
2. Ensure proper padding at bottom for safe area

```tsx
// Line 74: Update wrapper div
<div className="min-h-screen bg-muted/30 pb-20 relative">
```

---

## Technical Implementation Details

### AdminMobileNav.tsx Changes
```tsx
// Before
<nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom md:hidden">

// After
<nav className="fixed bottom-0 left-0 right-0 z-[60] bg-card border-t border-border safe-area-bottom md:hidden pointer-events-auto isolate">
```

The `isolate` CSS property creates a new stacking context, ensuring our z-index is evaluated independently.

### AdminDrawer.tsx Changes
```tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Inside component:
const navigate = useNavigate();

const handleNavClick = (e: React.MouseEvent, href: string) => {
  e.preventDefault();
  navigate(href);
  // Close drawer after navigation starts
  requestAnimationFrame(() => {
    onOpenChange(false);
  });
};

// Update all navigation links:
<Link
  key={item.href}
  to={item.href}
  onClick={(e) => handleNavClick(e, item.href)}
  className={...}
>
```

Using `requestAnimationFrame` ensures the navigation state update happens before the drawer closes, preventing any race conditions.

### AdminLayout.tsx Changes
```tsx
// Line 74: Increase bottom padding to ensure content doesn't overlap nav
<div className="min-h-screen bg-muted/30 pb-20 relative">
```

---

## Summary of File Changes

| File | Change |
|------|--------|
| `src/components/admin/AdminMobileNav.tsx` | Increase z-index to z-[60], add isolate and pointer-events-auto |
| `src/components/admin/AdminDrawer.tsx` | Add useNavigate, create handleNavClick function that navigates before closing drawer |
| `src/components/admin/AdminLayout.tsx` | Increase bottom padding to pb-20 for proper spacing |

---

## Additional Enhancements (Already Requested)

The plan also includes the previously approved enhancements:
1. **Pundit Dashboard real stats** - Already implemented with real booking queries
2. **Reports page real data** - Already connected to actual database queries
3. **Gift Pooja in main mobile nav** - Already added between Panchang and Bookings

---

## Testing Checklist

After implementation:
1. On mobile, tap each bottom nav item - should navigate directly
2. Open hamburger menu, tap each item - should navigate and close drawer
3. Navigate between multiple admin pages - bottom nav should always be visible
4. Rapidly open/close drawer - navigation should remain functional

