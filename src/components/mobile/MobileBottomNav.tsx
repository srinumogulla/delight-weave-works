import { Link, useLocation } from 'react-router-dom';
import { Home, Sun, Building2, UserCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Panchang', href: '/panchang', icon: Sun },
  { label: 'Temples', href: '/temples', icon: Building2 },
  { label: 'Pundits', href: '/pundits', icon: UserCheck },
  { label: 'Profile', href: '/profile', icon: User, requireAuth: true },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const href = item.requireAuth && !user ? '/login' : item.href;
          
          return (
            <Link
              key={item.label}
              to={href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn(
                "text-xs mt-1 font-medium",
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
