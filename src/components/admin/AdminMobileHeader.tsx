import { Link } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminMobileHeaderProps {
  title: string;
  onMenuClick: () => void;
  pendingCount?: number;
}

export function AdminMobileHeader({ title, onMenuClick, pendingCount = 0 }: AdminMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="-ml-2">
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="font-heading text-sm font-bold text-primary-foreground">ॐ</span>
            </div>
          </Link>
        </div>
        
        <h1 className="text-lg font-semibold">{title}</h1>
        
        <Link to="/admin/approvals" className="relative">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {pendingCount > 9 ? '9+' : pendingCount}
              </Badge>
            )}
          </Button>
        </Link>
      </div>
    </header>
  );
}
