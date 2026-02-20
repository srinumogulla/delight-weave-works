import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  LogOut,
  Home,
  BookOpen,
  Building2,
  UserCheck,
  ClipboardCheck,
  Gift,
  CalendarDays,
  Settings,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/auth/AuthProvider';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminMobileNav } from './AdminMobileNav';
import { AdminMobileHeader } from './AdminMobileHeader';
import { AdminDrawer } from './AdminDrawer';

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Services', href: '/admin/services', icon: BookOpen },
  { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { label: 'Gift Bookings', href: '/admin/gift-bookings', icon: Gift },
  { label: 'Events', href: '/admin/events', icon: CalendarDays },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Temples', href: '/admin/temples', icon: Building2 },
  { label: 'Pundits', href: '/admin/pundits', icon: UserCheck },
  { label: 'Approvals', href: '/admin/approvals', icon: ClipboardCheck },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { signOut, user: profile } = useAuth();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Get current page title
  const currentPage = sidebarItems.find(item => item.href === location.pathname);
  const pageTitle = currentPage?.label || 'Admin';

  // Fetch pending approvals count from API
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['pending-approvals-count'],
    queryFn: async () => {
      try {
        const { count } = await supabase
          .from('pundits')
          .select('*', { count: 'exact', head: true })
          .eq('approval_status', 'pending');
        return count ?? 0;
      } catch {
        return 0;
      }
    },
  });

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-muted/30 pb-20 relative">
        <AdminMobileHeader 
          title={pageTitle} 
          onMenuClick={() => setDrawerOpen(true)}
          pendingCount={pendingCount}
        />
        <AdminDrawer 
          open={drawerOpen} 
          onOpenChange={setDrawerOpen}
          pendingCount={pendingCount}
        />
        <main className="p-4">
          {children}
        </main>
        <AdminMobileNav pendingCount={pendingCount} />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <span className="font-heading text-xl font-bold text-primary-foreground">ॐ</span>
            </div>
            <div>
              <span className="font-heading text-lg font-bold text-primary block">Vedic Pooja</span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            const showBadge = item.href === '/admin/approvals' && pendingCount > 0;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {showBadge && (
                  <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                    {pendingCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Home className="h-5 w-5" />
            Back to Site
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {profile?.full_name || 'Admin'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
