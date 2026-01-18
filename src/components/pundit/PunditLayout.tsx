import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { LayoutDashboard, Calendar, User, IndianRupee, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PunditLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/pundit', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pundit/bookings', label: 'Bookings', icon: Calendar },
  { href: '/pundit/profile', label: 'My Profile', icon: User },
  { href: '/pundit/earnings', label: 'Earnings', icon: IndianRupee },
];

export function PunditLayout({ children }: PunditLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();

  const sidebar = (
    <aside className="w-64 border-r border-border bg-card min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-primary">Pundit Portal</h2>
        <p className="text-sm text-muted-foreground">Manage your services</p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );

  const content = (
    <div className="flex-1 p-6">
      {children}
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout title="Pundit Dashboard" showBottomNav={false}>
        {/* Mobile navigation tabs */}
        <div className="flex overflow-x-auto border-b border-border bg-card px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  isActive 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="p-4">
          {children}
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        {sidebar}
        {content}
      </div>
      <Footer />
    </div>
  );
}
