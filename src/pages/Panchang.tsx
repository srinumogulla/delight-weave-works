import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sun, Moon, Clock, AlertTriangle, Check, Calendar, MapPin, Loader2, User } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PanchangCalendar } from "@/components/PanchangCalendar";
import { MuhuratFinder } from "@/components/MuhuratFinder";
import { FestivalList } from "@/components/FestivalList";
import { useLanguage } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface PanchangData {
  date: string;
  hinduDate: string;
  tithi: { name: string; endTime: string; paksha?: string };
  nakshatra: { name: string; endTime: string };
  yoga: { name: string; endTime: string };
  karana: { name: string };
  vara: string;
  timings: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    rahukaal: string;
    yamagandam: string;
    gulika: string;
  };
  auspicious: string[];
  inauspicious: string[];
  masa: string;
}

const defaultLocation = { lat: 28.6139, lng: 77.209 }; // Delhi

const Panchang = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const profile = user;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("today");
  const [location, setLocation] = useState(defaultLocation);
  const [locationName, setLocationName] = useState("Delhi, India");
  const [manualLocation, setManualLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  
  // City autocomplete state
  const [citySuggestions, setCitySuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // My Panchang form state
  const [myPanchangData, setMyPanchangData] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    birthLocation: ''
  });
  const [showMyPanchangResult, setShowMyPanchangResult] = useState(false);

  // Request user location on mount with reverse geocoding
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          
          // Reverse geocode to get city name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.village || 'Your Location';
            const state = data.address?.state || '';
            const cityName = state ? `${city}, ${state}` : city;
            setLocationName(cityName);
            setManualLocation(cityName);
          } catch {
            setLocationName('Your Location');
          }
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { timeout: 10000 }
      );
    }
  }, []);

  // Pre-fill My Panchang form if user is logged in with birth details
  useEffect(() => {
    if (user && profile) {
      setMyPanchangData({
        name: profile.full_name || '',
        dateOfBirth: profile.date_of_birth || '',
        timeOfBirth: profile.time_of_birth || '',
        birthLocation: profile.birth_location || ''
      });
    }
  }, [user, profile]);

  // Fetch panchang data from edge function
  const { data: panchangData, isLoading, error } = useQuery<PanchangData>({
    queryKey: ['panchang', location.lat, location.lng],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.functions.invoke('get-panchang', {
        body: { 
          date: today, 
          latitude: location.lat, 
          longitude: location.lng 
        }
      });
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });

  // City autocomplete - debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (manualLocation.length >= 3) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualLocation)}&format=json&limit=5&addressdetails=1`
          );
          const data = await response.json();
          setCitySuggestions(data);
          setShowSuggestions(true);
        } catch {
          setCitySuggestions([]);
        }
      } else {
        setCitySuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [manualLocation]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const selectCity = (city: { display_name: string; lat: string; lon: string }) => {
    const displayName = city.display_name.split(',').slice(0, 2).join(',');
    setLocation({ lat: parseFloat(city.lat), lng: parseFloat(city.lon) });
    setLocationName(displayName);
    setManualLocation(displayName);
    setShowSuggestions(false);
    toast({
      title: "Location Updated",
      description: `Panchang now showing for ${displayName}`,
    });
  };

  const handleGenerateMyPanchang = () => {
    if (!myPanchangData.name || !myPanchangData.dateOfBirth) {
      toast({
        title: "Missing Details",
        description: "Please enter your name and date of birth",
        variant: "destructive",
      });
      return;
    }
    setShowMyPanchangResult(true);
    toast({
      title: "Personal Panchang Generated",
      description: `Birth chart analysis for ${myPanchangData.name}`,
    });
  };

  const content = (
    <main className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          {t("panchang.title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("panchang.subtitle")}
        </p>
        
        {/* Location Display */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {isLocating ? "Detecting location..." : locationName}
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="muhurat">Muhurat</TabsTrigger>
          <TabsTrigger value="mypanchang">My Panchang</TabsTrigger>
        </TabsList>

        {/* Today's Panchang */}
        <TabsContent value="today" className="space-y-6">
          {/* Location Search with Autocomplete */}
          <div className="relative max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <Input
                placeholder="Search city (e.g., Mumbai, Varanasi)"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
                className="flex-1"
              />
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && citySuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                {citySuggestions.map((city, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-2 border-b last:border-b-0"
                    onClick={() => selectCity(city)}
                  >
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="truncate text-sm">{city.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading Panchang data...</span>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                <p className="text-muted-foreground">
                  Unable to load Panchang data. Please try again later.
                </p>
              </CardContent>
            </Card>
          ) : panchangData ? (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Main Panchang Details */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      {panchangData.date}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {panchangData.hinduDate}
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{t("panchang.tithi")}</p>
                        <p className="font-semibold">{panchangData.tithi.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Until {panchangData.tithi.endTime}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{t("panchang.nakshatra")}</p>
                        <p className="font-semibold">{panchangData.nakshatra.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Until {panchangData.nakshatra.endTime}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{t("panchang.yoga")}</p>
                        <p className="font-semibold">{panchangData.yoga.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Until {panchangData.yoga.endTime}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{t("panchang.karana")}</p>
                        <p className="font-semibold">{panchangData.karana.name}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-2">{t("panchang.vara")}</p>
                      <p className="font-semibold">{panchangData.vara}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Timings Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Timings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Sun className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("panchang.sunrise")}</p>
                          <p className="font-semibold">{panchangData.timings.sunrise}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <Sun className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("panchang.sunset")}</p>
                          <p className="font-semibold">{panchangData.timings.sunset}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Moon className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("panchang.moonrise")}</p>
                          <p className="font-semibold">{panchangData.timings.moonrise}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                        <Moon className="h-5 w-5 text-slate-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("panchang.moonset")}</p>
                          <p className="font-semibold">{panchangData.timings.moonset}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">{t("panchang.rahukaal")}</span>
                        </div>
                        <Badge variant="destructive">{panchangData.timings.rahukaal}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">{t("panchang.yamagandam")}</span>
                        </div>
                        <Badge variant="outline">{panchangData.timings.yamagandam}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">{t("panchang.gulika")}</span>
                        </div>
                        <Badge variant="outline">{panchangData.timings.gulika}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Auspicious/Inauspicious */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="bg-green-50 dark:bg-green-900/20">
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      {t("panchang.auspicious")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {panchangData.auspicious.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-red-50 dark:bg-red-900/20">
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <AlertTriangle className="h-5 w-5" />
                      {t("panchang.inauspicious")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {panchangData.inauspicious.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}

          {/* Festivals */}
          <FestivalList />
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-6">
              <PanchangCalendar />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Muhurat Finder */}
        <TabsContent value="muhurat">
          <MuhuratFinder />
        </TabsContent>

        {/* My Panchang - Personal Birth Chart */}
        <TabsContent value="mypanchang">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Personal Panchang
              </CardTitle>
              <CardDescription>
                Enter your birth details to see your personalized birth chart and astrological analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {user && profile?.date_of_birth && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    ✓ Your birth details are pre-filled from your profile
                  </p>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="myName">Full Name *</Label>
                  <Input
                    id="myName"
                    value={myPanchangData.name}
                    onChange={(e) => setMyPanchangData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="myDob">Date of Birth *</Label>
                  <Input
                    id="myDob"
                    type="date"
                    value={myPanchangData.dateOfBirth}
                    onChange={(e) => setMyPanchangData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="myTob">Time of Birth</Label>
                  <Input
                    id="myTob"
                    type="time"
                    value={myPanchangData.timeOfBirth}
                    onChange={(e) => setMyPanchangData(prev => ({ ...prev, timeOfBirth: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="myBirthLocation">Birth Location</Label>
                  <Input
                    id="myBirthLocation"
                    value={myPanchangData.birthLocation}
                    onChange={(e) => setMyPanchangData(prev => ({ ...prev, birthLocation: e.target.value }))}
                    placeholder="City, State, Country"
                  />
                </div>
              </div>

              <Button onClick={handleGenerateMyPanchang} className="w-full md:w-auto">
                Generate My Panchang
              </Button>

              {showMyPanchangResult && (
                <div className="mt-6 p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border">
                  <h3 className="text-lg font-semibold mb-4">Birth Chart for {myPanchangData.name}</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-background rounded-lg border">
                      <p className="text-sm text-muted-foreground">Moon Sign (Rashi)</p>
                      <p className="font-semibold text-lg">Calculated from DOB</p>
                    </div>
                    <div className="p-4 bg-background rounded-lg border">
                      <p className="text-sm text-muted-foreground">Birth Nakshatra</p>
                      <p className="font-semibold text-lg">Based on Moon</p>
                    </div>
                    <div className="p-4 bg-background rounded-lg border">
                      <p className="text-sm text-muted-foreground">Tithi at Birth</p>
                      <p className="font-semibold text-lg">Lunar Day</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    For a complete and accurate birth chart reading, please consult with our Jyotish experts.
                  </p>
                  <Button variant="outline" className="mt-4">
                    Book Jyotish Consultation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );

  if (isMobile) {
    return (
      <MobileLayout showHeader={true}>
        {content}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {content}
      <Footer />
    </div>
  );
};

export default Panchang;