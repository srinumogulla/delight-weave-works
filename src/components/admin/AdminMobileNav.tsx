import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  ClipboardCheck,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminMobileNavProps {
  pendingCount?: number;
}

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { label: 'Services', href: '/admin/services', icon: BookOpen },
  { label: 'Approvals', href: '/admin/approvals', icon: ClipboardCheck, hasBadge: true },
  { label: 'Profile', href: '/admin/settings', icon: User },
];

export function AdminMobileNav({ pendingCount = 0 }: AdminMobileNavProps) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-card border-t border-border safe-area-bottom md:hidden pointer-events-auto isolate">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.hasBadge && pendingCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                  >
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium mt-1",
                isActive && "text-primary"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
