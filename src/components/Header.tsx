import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User, LogOut, Settings, Gift, Calendar, Users, BookOpen, Sun, Building2, UserCheck, Phone, Bell, Heart, Search, Loader2, Star } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/AuthProvider";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, profile, isAdmin, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Real-time database search
  const { results, isLoading: isSearching, hasResults } = useSearch(searchQuery);

  // Keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Clear search query when dialog closes
  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Static pages for quick navigation
  const staticPages = [
    { name: "Panchang Calendar", path: "/panchang", icon: Sun },
    { name: "Gift a Pooja", path: "/gift-pooja", icon: Gift },
    { name: "Events", path: "/community/events", icon: Calendar },
    { name: "About Us", path: "/community/about", icon: Users },
    { name: "Contact", path: "/contact", icon: Phone },
  ];

  const handleSearchSelect = (path: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleMobileSubmenu = (menu: string) => {
    setExpandedMobile(expandedMobile === menu ? null : menu);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <span className="font-heading text-xl font-bold text-primary-foreground">ॐ</span>
          </div>
          <span className="font-heading text-xl font-bold text-primary">Vedha Mantra</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-0">
            {/* Pooja Dropdown */}
            <NavigationMenuItem className="min-w-[70px]">
              <NavigationMenuTrigger className="text-sm font-medium text-foreground/80 hover:text-primary bg-transparent">
                {t("nav.pooja")}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[400px] p-4">
                  <div className="grid gap-3">
                    <Link
                      to="/pooja/dashachara"
                      className="group block p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary">Dashachara</div>
                          <p className="text-sm text-muted-foreground">
                            Concierge-managed traditional poojas with verified priests
                          </p>
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/pooja/vamachara"
                      className="group block p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                          <span className="text-lg">🕉️</span>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary">Vamachara</div>
                          <p className="text-sm text-muted-foreground">
                            Powerful rituals performed with strict scriptural discipline
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Panchang Dropdown */}
            <NavigationMenuItem className="min-w-[90px]">
              <NavigationMenuTrigger className="text-sm font-medium text-foreground/80 hover:text-primary bg-transparent">
                <Sun className="h-4 w-4 mr-1" />
                {t("nav.panchang")}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[350px] p-4">
                  <div className="grid gap-3">
                    <Link
                      to="/panchang"
                      className="group block p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary">Today's Panchang</div>
                          <p className="text-sm text-muted-foreground">
                            Daily tithi, nakshatra & muhurat
                          </p>
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/kundali"
                      className="group block p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                          <Star className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary">Kundali / Birth Chart</div>
                          <p className="text-sm text-muted-foreground">
                            Generate your Vedic horoscope
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Explore Dropdown */}
            <NavigationMenuItem className="min-w-[80px] relative">
              <NavigationMenuTrigger className="text-sm font-medium text-foreground/80 hover:text-primary bg-transparent">
                Explore
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[350px] p-4">
                  <div className="grid gap-3">
                    <Link
                      to="/temples"
                      className="group block p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-sacred-green/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-sacred-green" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary">{t("nav.temples")}</div>
                          <p className="text-sm text-muted-foreground">
                            Browse sacred temples & book darshan
                          </p>
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/pundits"
                      className="group block p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary">{t("nav.pundit")}</div>
                          <p className="text-sm text-muted-foreground">
                            Find verified priests for rituals
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Gift */}
            <NavigationMenuItem className="min-w-[60px]">
              <Link to="/gift-pooja" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2 flex items-center gap-1">
                <Gift className="h-4 w-4" />
                {t("nav.gift")}
              </Link>
            </NavigationMenuItem>

            {/* Community Dropdown */}
            <NavigationMenuItem className="min-w-[100px] relative">
              <NavigationMenuTrigger className="text-sm font-medium text-foreground/80 hover:text-primary bg-transparent flex items-center gap-1">
                <Users className="h-4 w-4" />
                Community
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[300px] p-4">
                  <Link
                    to="/community/events"
                    className="group block p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sacred-green/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-sacred-green" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary">Events</div>
                        <p className="text-sm text-muted-foreground">
                          Spiritual events, festivals & satsangs
                        </p>
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/community/about"
                    className="group block p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary">About Us</div>
                        <p className="text-sm text-muted-foreground">
                          Our mission, vision & principles
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Contact */}
            <NavigationMenuItem className="min-w-[70px]">
              <Link to="/contact" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2 flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {t("nav.contact")}
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="relative"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search (⌘K)</span>
          </Button>

          {/* Language Selector */}
          <LanguageSwitcher />
          
          {/* Logged-in user icons */}
          {user && (
            <>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/profile/saved">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {/* Notification badge - placeholder */}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </Button>
            </>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span>{profile?.full_name || user.email?.split('@')[0]}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/bookings" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/saved" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Saved Items
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/spiritual" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Spiritual Details
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" variant="outline" asChild>
              <Link to="/login">Login / Sign Up</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            {/* Language Switcher at top */}
            <div className="flex justify-end pb-2 border-b border-border mb-2">
              <LanguageSwitcher />
            </div>

            {/* Pooja Submenu */}
            <div>
              <button
                onClick={() => toggleMobileSubmenu('pooja')}
                className="flex items-center justify-between w-full text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
              >
                Pooja
                <ChevronDown className={cn("h-4 w-4 transition-transform", expandedMobile === 'pooja' && "rotate-180")} />
              </button>
              {expandedMobile === 'pooja' && (
                <div className="pl-4 flex flex-col gap-2 mt-2">
                  <Link
                    to="/pooja/dashachara"
                    className="text-sm text-muted-foreground hover:text-primary py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashachara
                  </Link>
                  <Link
                    to="/pooja/vamachara"
                    className="text-sm text-muted-foreground hover:text-primary py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Vamachara
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/panchang"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Sun className="h-4 w-4" />
              Panchang
            </Link>

            {/* Explore Submenu */}
            <div>
              <button
                onClick={() => toggleMobileSubmenu('explore')}
                className="flex items-center justify-between w-full text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
              >
                Explore
                <ChevronDown className={cn("h-4 w-4 transition-transform", expandedMobile === 'explore' && "rotate-180")} />
              </button>
              {expandedMobile === 'explore' && (
                <div className="pl-4 flex flex-col gap-2 mt-2">
                  <Link
                    to="/temples"
                    className="text-sm text-muted-foreground hover:text-primary py-1 flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Building2 className="h-4 w-4" />
                    Temples
                  </Link>
                  <Link
                    to="/pundits"
                    className="text-sm text-muted-foreground hover:text-primary py-1 flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCheck className="h-4 w-4" />
                    Pundits
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/gift-pooja"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Gift className="h-4 w-4" />
              Gift
            </Link>

            {/* Community Submenu */}
            <div>
              <button
                onClick={() => toggleMobileSubmenu('community')}
                className="flex items-center justify-between w-full text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
              >
                Community
                <ChevronDown className={cn("h-4 w-4 transition-transform", expandedMobile === 'community' && "rotate-180")} />
              </button>
              {expandedMobile === 'community' && (
                <div className="pl-4 flex flex-col gap-2 mt-2">
                  <Link
                    to="/community/events"
                    className="text-sm text-muted-foreground hover:text-primary py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Events
                  </Link>
                  <Link
                    to="/community/about"
                    className="text-sm text-muted-foreground hover:text-primary py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About Us
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/contact"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Phone className="h-4 w-4" />
              Contact
            </Link>

            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              {user ? (
                <>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/profile?tab=saved" onClick={() => setIsMenuOpen(false)}>
                      <Heart className="h-4 w-4 mr-2" />
                      Saved Items
                    </Link>
                  </Button>
                  {isAdmin && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90" asChild>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login / Sign Up</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Search Command Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput 
          placeholder="Search poojas, temples, pundits..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isSearching ? (
              <div className="flex items-center justify-center gap-2 py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching...</span>
              </div>
            ) : searchQuery.length < 2 ? (
              "Type at least 2 characters to search..."
            ) : (
              "No results found."
            )}
          </CommandEmpty>
          
          {/* Dynamic Poojas from Database */}
          {results.poojas.length > 0 && (
            <CommandGroup heading="Poojas">
              {results.poojas.map((pooja) => (
                <CommandItem
                  key={pooja.id}
                  value={pooja.name}
                  onSelect={() => handleSearchSelect(`/booking?service=${pooja.id}`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{pooja.name}</span>
                    {pooja.category && (
                      <span className="text-xs text-muted-foreground">{pooja.category}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {/* Dynamic Temples from Database */}
          {results.temples.length > 0 && (
            <CommandGroup heading="Temples">
              {results.temples.map((temple) => (
                <CommandItem
                  key={temple.id}
                  value={temple.name}
                  onSelect={() => handleSearchSelect(`/temples`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{temple.name}</span>
                    {(temple.city || temple.deity) && (
                      <span className="text-xs text-muted-foreground">
                        {[temple.deity, temple.city].filter(Boolean).join(' • ')}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {/* Dynamic Pundits from Database */}
          {results.pundits.length > 0 && (
            <CommandGroup heading="Pundits">
              {results.pundits.map((pundit) => (
                <CommandItem
                  key={pundit.id}
                  value={pundit.name}
                  onSelect={() => handleSearchSelect(`/pundits`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{pundit.name}</span>
                    {pundit.location && (
                      <span className="text-xs text-muted-foreground">{pundit.location}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {/* Static Pages - always shown when no search or as fallback */}
          {(!searchQuery || searchQuery.length < 2 || !hasResults) && (
            <CommandGroup heading="Pages">
              {staticPages.map((page) => (
                <CommandItem
                  key={page.path}
                  value={page.name}
                  onSelect={() => handleSearchSelect(page.path)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <page.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{page.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
