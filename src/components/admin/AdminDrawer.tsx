import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  BarChart3,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/auth/AuthProvider';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface AdminDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingCount: number;
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
  { label: 'Approvals', href: '/admin/approvals', icon: ClipboardCheck, hasBadge: true },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminDrawer({ open, onOpenChange, pendingCount }: AdminDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user: profile } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    navigate(href);
    requestAnimationFrame(() => {
      onOpenChange(false);
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2" onClick={() => onOpenChange(false)}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <span className="font-heading text-xl font-bold text-primary-foreground">ॐ</span>
              </div>
              <div>
                <SheetTitle className="font-heading text-lg font-bold text-primary text-left">Vedic Pooja</SheetTitle>
                <span className="text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </Link>
          </div>
        </SheetHeader>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            const showBadge = item.hasBadge && pendingCount > 0;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-card space-y-1">
          <Link
            to="/"
            onClick={(e) => handleNavClick(e, '/')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Home className="h-5 w-5" />
            Back to Site
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              signOut();
              onOpenChange(false);
            }}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
