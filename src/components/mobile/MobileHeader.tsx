import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, ChevronDown, Sun, Building2, UserCheck, Gift, Phone, Users, BookOpen, Heart, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuth } from '@/components/AuthProvider';
import { useSearch } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
}

export function MobileHeader({ 
  title, 
  showSearch = true, 
  showNotifications = true 
}: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Real-time database search
  const { results, isLoading: isSearching, hasResults } = useSearch(searchQuery);

  const toggleSubmenu = (menu: string) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setExpandedMenu(null);
  };

  const handleSearchSelect = (path: string) => {
    setSearchExpanded(false);
    setSearchQuery("");
    navigate(path);
  };

  const closeSearch = () => {
    setSearchExpanded(false);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Search Expanded State */}
        {searchExpanded ? (
          <div className="flex items-center w-full gap-2">
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search poojas, temples, pundits..."
              className="flex-1 h-9 border-0 focus-visible:ring-0 px-0"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 flex-shrink-0"
              onClick={closeSearch}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <>
            {/* Hamburger Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="p-4 border-b border-border">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <span className="font-heading text-lg font-bold text-primary-foreground">ॐ</span>
                    </div>
                    <span className="font-heading text-lg font-bold text-primary">Vedha Mantra</span>
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col p-4 space-y-1">
                  {/* Pooja Submenu */}
                  <div>
                    <button
                      onClick={() => toggleSubmenu('pooja')}
                      className="flex items-center justify-between w-full py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4" />
                        Pooja
                      </span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", expandedMenu === 'pooja' && "rotate-180")} />
                    </button>
                    {expandedMenu === 'pooja' && (
                      <div className="pl-7 space-y-1">
                        <Link
                          to="/pooja/dashachara"
                          className="block py-2 text-sm text-muted-foreground hover:text-primary"
                          onClick={closeMenu}
                        >
                          Dashachara
                        </Link>
                        <Link
                          to="/pooja/vamachara"
                          className="block py-2 text-sm text-muted-foreground hover:text-primary"
                          onClick={closeMenu}
                        >
                          Vamachara
                        </Link>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/panchang"
                    className="flex items-center gap-3 py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                    onClick={closeMenu}
                  >
                    <Sun className="h-4 w-4" />
                    Panchang
                  </Link>

                  {/* Explore Submenu */}
                  <div>
                    <button
                      onClick={() => toggleSubmenu('explore')}
                      className="flex items-center justify-between w-full py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <Building2 className="h-4 w-4" />
                        Explore
                      </span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", expandedMenu === 'explore' && "rotate-180")} />
                    </button>
                    {expandedMenu === 'explore' && (
                      <div className="pl-7 space-y-1">
                        <Link
                          to="/temples"
                          className="block py-2 text-sm text-muted-foreground hover:text-primary"
                          onClick={closeMenu}
                        >
                          Temples
                        </Link>
                        <Link
                          to="/pundits"
                          className="block py-2 text-sm text-muted-foreground hover:text-primary"
                          onClick={closeMenu}
                        >
                          Pundits
                        </Link>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/gift-pooja"
                    className="flex items-center gap-3 py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                    onClick={closeMenu}
                  >
                    <Gift className="h-4 w-4" />
                    Gift Pooja
                  </Link>

                  {/* Community Submenu */}
                  <div>
                    <button
                      onClick={() => toggleSubmenu('community')}
                      className="flex items-center justify-between w-full py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <Users className="h-4 w-4" />
                        Community
                      </span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", expandedMenu === 'community' && "rotate-180")} />
                    </button>
                    {expandedMenu === 'community' && (
                      <div className="pl-7 space-y-1">
                        <Link
                          to="/community/events"
                          className="block py-2 text-sm text-muted-foreground hover:text-primary"
                          onClick={closeMenu}
                        >
                          Events
                        </Link>
                        <Link
                          to="/community/about"
                          className="block py-2 text-sm text-muted-foreground hover:text-primary"
                          onClick={closeMenu}
                        >
                          About Us
                        </Link>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/contact"
                    className="flex items-center gap-3 py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                    onClick={closeMenu}
                  >
                    <Phone className="h-4 w-4" />
                    Contact
                  </Link>

                  <div className="pt-4 mt-4 border-t border-border space-y-2">
                    {user ? (
                      <>
                        <Link
                          to="/profile"
                          className="block w-full py-2 text-center text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors"
                          onClick={closeMenu}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/profile?tab=saved"
                          className="flex items-center justify-center gap-2 w-full py-2 text-center text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors"
                          onClick={closeMenu}
                        >
                          <Heart className="h-4 w-4" />
                          Saved Items
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="block w-full py-2 text-center text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors"
                            onClick={closeMenu}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            signOut();
                            closeMenu();
                          }}
                        >
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        className="block w-full py-2 text-center text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        onClick={closeMenu}
                      >
                        Login / Sign Up
                      </Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

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
            <div className="flex items-center gap-1">
              {showSearch && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => setSearchExpanded(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
              <LanguageSwitcher />
              {user && (
                <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                  <Link to="/profile?tab=saved">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              {showNotifications && user && (
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    2
                  </span>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Search Results Dropdown */}
      {searchExpanded && searchQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg max-h-80 overflow-y-auto z-50">
          {isSearching ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : !hasResults ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            <div className="py-2">
              {/* Poojas */}
              {results.poojas.length > 0 && (
                <div className="px-4 py-2">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Poojas</h4>
                  {results.poojas.map((pooja) => (
                    <button
                      key={pooja.id}
                      onClick={() => handleSearchSelect(`/booking?service=${pooja.id}`)}
                      className="flex items-center gap-3 w-full py-2 text-left hover:bg-muted rounded-md px-2 transition-colors"
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{pooja.name}</span>
                        {pooja.category && (
                          <span className="text-xs text-muted-foreground">{pooja.category}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Temples */}
              {results.temples.length > 0 && (
                <div className="px-4 py-2">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Temples</h4>
                  {results.temples.map((temple) => (
                    <button
                      key={temple.id}
                      onClick={() => handleSearchSelect(`/temples`)}
                      className="flex items-center gap-3 w-full py-2 text-left hover:bg-muted rounded-md px-2 transition-colors"
                    >
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{temple.name}</span>
                        {(temple.city || temple.deity) && (
                          <span className="text-xs text-muted-foreground">
                            {[temple.deity, temple.city].filter(Boolean).join(' • ')}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Pundits */}
              {results.pundits.length > 0 && (
                <div className="px-4 py-2">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Pundits</h4>
                  {results.pundits.map((pundit) => (
                    <button
                      key={pundit.id}
                      onClick={() => handleSearchSelect(`/pundits`)}
                      className="flex items-center gap-3 w-full py-2 text-left hover:bg-muted rounded-md px-2 transition-colors"
                    >
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{pundit.name}</span>
                        {pundit.location && (
                          <span className="text-xs text-muted-foreground">{pundit.location}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
