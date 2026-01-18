import { Link } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
}

export function MobileHeader({ 
  title, 
  showSearch = false, 
  showNotifications = true 
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo / Title */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="font-heading text-lg font-bold text-primary-foreground">ॐ</span>
          </div>
          <span className="font-heading text-lg font-bold text-primary">
            {title || 'Vedha Mantra'}
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-5 w-5" />
            </Button>
          )}
          {showNotifications && (
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}