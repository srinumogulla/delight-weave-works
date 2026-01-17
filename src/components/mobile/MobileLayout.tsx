import { ReactNode } from 'react';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showBottomNav?: boolean;
  showSearch?: boolean;
}

export function MobileLayout({ 
  children, 
  title,
  showHeader = true,
  showBottomNav = true,
  showSearch = false
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <MobileHeader title={title} showSearch={showSearch} />}
      
      <main className={`flex-1 ${showBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
}
