import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User, LogOut, Settings, Gift, Calendar, Users, BookOpen, Sun, Building2, UserCheck } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";


export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const { user, profile, isAdmin, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

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
          <NavigationMenuList>
            {/* Pooja Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm font-medium text-foreground/80 hover:text-primary bg-transparent">
                {t("nav.pooja")}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[400px] p-4 bg-card">
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

            {/* Panchang */}
            <NavigationMenuItem>
              <Link to="/panchang" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2 flex items-center gap-1">
                <Sun className="h-4 w-4" />
                {t("nav.panchang")}
              </Link>
            </NavigationMenuItem>

            {/* Temples */}
            <NavigationMenuItem>
              <Link to="/temples" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2 flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {t("nav.temples")}
              </Link>
            </NavigationMenuItem>

            {/* Pundit */}
            <NavigationMenuItem>
              <Link to="/pundits" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2 flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                {t("nav.pundit")}
              </Link>
            </NavigationMenuItem>

            {/* Gift */}
            <NavigationMenuItem>
              <Link to="/gift-pooja" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2 flex items-center gap-1">
                <Gift className="h-4 w-4" />
                {t("nav.gift")}
              </Link>
            </NavigationMenuItem>

            {/* Contact */}
            <NavigationMenuItem>
              <Link to="/contact" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2">
                {t("nav.contact")}
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Community Dropdown - Using DropdownMenu for proper positioning */}
        <div className="hidden md:flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium text-foreground/80 hover:text-primary">
                Community
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[300px] p-4 bg-card">
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Selector */}
          <LanguageSwitcher />

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

            <Link
              to="/temples"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Building2 className="h-4 w-4" />
              Temples
            </Link>

            <Link
              to="/pundits"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserCheck className="h-4 w-4" />
              Pundits
            </Link>

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
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              {user ? (
                <>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
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
    </header>
  );
}