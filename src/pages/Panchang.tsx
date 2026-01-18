import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sun, Moon, Clock, AlertTriangle, Check, Calendar, MapPin, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PanchangCalendar } from "@/components/PanchangCalendar";
import { MuhuratFinder } from "@/components/MuhuratFinder";
import { FestivalList } from "@/components/FestivalList";
import { useLanguage } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";

interface PanchangData {
  date: string;
  hinduDate: string;
  tithi: { name: string; endTime: string };
  nakshatra: { name: string; endTime: string };
  yoga: string;
  karana: string;
  vara: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahukaal: string;
  yamagandam: string;
  gulika: string;
  auspicious: string[];
  inauspicious: string[];
  masa: string;
}

const defaultLocation = { lat: 28.6139, lng: 77.209 }; // Delhi

const Panchang = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("today");
  const [location, setLocation] = useState(defaultLocation);
  const [locationName, setLocationName] = useState("Delhi, India");
  const [manualLocation, setManualLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // Request user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationName("Your Location");
          setIsLocating(false);
        },
        () => {
          // Use default location if geolocation fails
          setIsLocating(false);
        },
        { timeout: 10000 }
      );
    }
  }, []);

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
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  const handleLocationSearch = async () => {
    if (!manualLocation.trim()) return;
    
    // Simple geocoding using a free API (for demo - in production use a proper geocoding service)
    // For now, just set some common cities
    const cities: Record<string, { lat: number; lng: number; name: string }> = {
      'mumbai': { lat: 19.076, lng: 72.8777, name: 'Mumbai, India' },
      'delhi': { lat: 28.6139, lng: 77.209, name: 'Delhi, India' },
      'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bangalore, India' },
      'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai, India' },
      'kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata, India' },
      'hyderabad': { lat: 17.385, lng: 78.4867, name: 'Hyderabad, India' },
      'pune': { lat: 18.5204, lng: 73.8567, name: 'Pune, India' },
      'ahmedabad': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad, India' },
      'varanasi': { lat: 25.3176, lng: 82.9739, name: 'Varanasi, India' },
      'jaipur': { lat: 26.9124, lng: 75.7873, name: 'Jaipur, India' },
    };
    
    const searchKey = manualLocation.toLowerCase().trim();
    const found = Object.entries(cities).find(([key]) => searchKey.includes(key));
    
    if (found) {
      setLocation({ lat: found[1].lat, lng: found[1].lng });
      setLocationName(found[1].name);
      setManualLocation("");
    }
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
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="muhurat">Muhurat</TabsTrigger>
        </TabsList>

        {/* Today's Panchang */}
        <TabsContent value="today" className="space-y-6">
          {/* Location Search */}
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              placeholder="Search city (e.g., Mumbai, Varanasi)"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
            />
            <Button onClick={handleLocationSearch} variant="outline">
              Search
            </Button>
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
                        <p className="font-semibold">{panchangData.yoga}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{t("panchang.karana")}</p>
                        <p className="font-semibold">{panchangData.karana}</p>
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
                          <p className="font-semibold">{panchangData.sunrise}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <Sun className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("panchang.sunset")}</p>
                          <p className="font-semibold">{panchangData.sunset}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Moon className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("panchang.moonrise")}</p>
                          <p className="font-semibold">{panchangData.moonrise}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                        <Moon className="h-5 w-5 text-slate-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("panchang.moonset")}</p>
                          <p className="font-semibold">{panchangData.moonset}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">{t("panchang.rahukaal")}</span>
                        </div>
                        <Badge variant="destructive">{panchangData.rahukaal}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">{t("panchang.yamagandam")}</span>
                        </div>
                        <Badge variant="outline">{panchangData.yamagandam}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">{t("panchang.gulika")}</span>
                        </div>
                        <Badge variant="outline">{panchangData.gulika}</Badge>
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
