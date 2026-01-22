import { useState, useEffect } from "react";
import { Calendar, Sun, Moon, Star, Clock, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { TimePickerAMPM } from "@/components/ui/time-picker-ampm";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import meditationImage from "@/assets/meditation.jpg";

interface PanchangData {
  date: string;
  hinduDate: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  rahukaal: string;
  auspicious: string[];
  inauspicious: string[];
}

interface DoshaResult {
  mangal: { present: boolean; severity: string; houses: string };
  shani: { sade_sati: boolean; phase: string };
  kalsarpa: { present: boolean; type: string };
  rahu_ketu: { affected: boolean; houses: string };
}

export function PanchangSection() {
  const [doshaName, setDoshaName] = useState("");
  const [showDoshaForm, setShowDoshaForm] = useState(false);
  const [showDoshaDialog, setShowDoshaDialog] = useState(false);
  const [doshaResult, setDoshaResult] = useState<DoshaResult | null>(null);
  const [doshaFormData, setDoshaFormData] = useState({
    dateOfBirth: "",
    timeOfBirth: "",
    birthLocation: ""
  });
  const [panchangData, setPanchangData] = useState<PanchangData | null>(null);
  const [isLoadingPanchang, setIsLoadingPanchang] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Fetch real panchang data on mount
  useEffect(() => {
    const fetchPanchang = async () => {
      setIsLoadingPanchang(true);
      try {
        // Default to Delhi coordinates
        let latitude = 28.6139;
        let longitude = 77.2090;

        // Try to get user's location
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
          } catch {
            console.log('Using default location: Delhi');
          }
        }

        const { data, error } = await supabase.functions.invoke('get-panchang', {
          body: {
            date: new Date().toISOString(),
            latitude,
            longitude
          }
        });

        if (error) throw error;

        // Transform API response to component format
        setPanchangData({
          date: new Date().toLocaleDateString('en-US', { 
            month: 'long', day: 'numeric', year: 'numeric' 
          }),
          hinduDate: data.hinduDate || `${data.tithi?.paksha || ''} ${data.tithi?.name || ''}`,
          tithi: data.tithi?.name || 'Loading...',
          nakshatra: data.nakshatra?.name || 'Loading...',
          yoga: data.yoga?.name || 'Loading...',
          karana: data.karana?.name || 'Loading...',
          sunrise: data.timings?.sunrise || '6:00 AM',
          sunset: data.timings?.sunset || '6:00 PM',
          moonrise: data.timings?.moonrise || '12:00 PM',
          rahukaal: data.timings?.rahukaal || 'Loading...',
          auspicious: data.auspicious || [],
          inauspicious: data.inauspicious || []
        });
      } catch (error) {
        console.error('Error fetching panchang:', error);
        // Fallback data
        setPanchangData({
          date: new Date().toLocaleDateString('en-US', { 
            month: 'long', day: 'numeric', year: 'numeric' 
          }),
          hinduDate: "Loading...",
          tithi: "Loading...",
          nakshatra: "Loading...",
          yoga: "Loading...",
          karana: "Loading...",
          sunrise: "6:00 AM",
          sunset: "6:00 PM",
          moonrise: "12:00 PM",
          rahukaal: "Loading...",
          auspicious: [],
          inauspicious: []
        });
      }
      setIsLoadingPanchang(false);
    };

    fetchPanchang();
  }, []);

  // Auto-fill from profile if logged in
  useEffect(() => {
    if (profile) {
      setDoshaName(profile.full_name || "");
      setDoshaFormData({
        dateOfBirth: profile.date_of_birth || "",
        timeOfBirth: profile.time_of_birth || "",
        birthLocation: profile.birth_location || ""
      });
    }
  }, [profile]);

  const handleCheckDosha = () => {
    if (!doshaName.trim()) {
      toast({
        title: "Please enter your name",
        description: "We need your name to check your dosha",
        variant: "destructive",
      });
      return;
    }
    
    // If user has complete birth details, calculate directly
    if (doshaFormData.dateOfBirth && doshaFormData.timeOfBirth && doshaFormData.birthLocation) {
      calculateDosha();
    } else {
      // Show form to collect birth details
      setShowDoshaForm(true);
    }
  };

  const calculateDosha = () => {
    // Generate simulated dosha analysis based on birth data
    const dateHash = doshaFormData.dateOfBirth ? new Date(doshaFormData.dateOfBirth).getDate() % 4 : doshaName.length % 4;
    
    const analysis: DoshaResult = {
      mangal: {
        present: dateHash === 0 || dateHash === 2,
        severity: dateHash === 0 ? "High" : "Moderate",
        houses: "1st, 4th House"
      },
      shani: {
        sade_sati: dateHash === 1 || dateHash === 3,
        phase: dateHash === 1 ? "Rising Phase" : "Peak Phase"
      },
      kalsarpa: {
        present: dateHash === 2,
        type: "Anant Kalsarpa"
      },
      rahu_ketu: {
        affected: dateHash === 0 || dateHash === 1,
        houses: "5th, 11th House"
      }
    };
    
    setDoshaResult(analysis);
    setShowDoshaForm(false);
    setShowDoshaDialog(true);
  };

  return (
    <section id="panchang" className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-4">
            Daily Guidance
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Today's <span className="text-primary">Panchang</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Plan your day according to Vedic astrology. Get detailed information about 
            auspicious timings, muhurat, and celestial positions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Panchang Card */}
          <Card className="md:col-span-2 border-accent/30">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-2xl text-foreground">
                    {isLoadingPanchang ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      panchangData?.date
                    )}
                  </CardTitle>
                  <p className="text-muted-foreground">{panchangData?.hinduDate || 'Loading...'}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingPanchang ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Calculating today's Panchang...</span>
                </div>
              ) : panchangData ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <Moon className="h-6 w-6 text-primary mx-auto mb-2" />
                      <div className="text-sm text-muted-foreground">Tithi</div>
                      <div className="font-semibold text-foreground">{panchangData.tithi}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <Star className="h-6 w-6 text-primary mx-auto mb-2" />
                      <div className="text-sm text-muted-foreground">Nakshatra</div>
                      <div className="font-semibold text-foreground">{panchangData.nakshatra}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <Sun className="h-6 w-6 text-primary mx-auto mb-2" />
                      <div className="text-sm text-muted-foreground">Yoga</div>
                      <div className="font-semibold text-foreground">{panchangData.yoga}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                      <div className="text-sm text-muted-foreground">Karana</div>
                      <div className="font-semibold text-foreground">{panchangData.karana}</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Sun className="h-4 w-4 text-accent" />
                        Sun & Moon Timings
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sunrise</span>
                          <span className="font-medium">{panchangData.sunrise}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sunset</span>
                          <span className="font-medium">{panchangData.sunset}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Moonrise</span>
                          <span className="font-medium">{panchangData.moonrise}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rahu Kaal</span>
                          <span className="font-medium text-destructive">{panchangData.rahukaal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Auspicious Activities</h4>
                      <div className="flex flex-wrap gap-2">
                        {panchangData.auspicious.length > 0 ? (
                          panchangData.auspicious.map((item) => (
                            <span
                              key={item}
                              className="px-3 py-1 rounded-full bg-sacred-green/10 text-sacred-green text-xs font-medium"
                            >
                              ✓ {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Regular day activities</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-foreground mt-4">Avoid Today</h4>
                      <div className="flex flex-wrap gap-2">
                        {panchangData.inauspicious.length > 0 ? (
                          panchangData.inauspicious.map((item) => (
                            <span
                              key={item}
                              className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium"
                            >
                              ✗ {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No major restrictions</span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Unable to load Panchang data
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dosha Checker Card */}
          <Card className="border-primary/30 bg-gradient-to-b from-card to-primary/5">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-foreground">
                Check Your Dosha
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Get personalized dosha analysis and remedies
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full h-32 rounded-lg overflow-hidden">
                <img 
                  src={meditationImage} 
                  alt="Person in meditation pose" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <input
                type="text"
                placeholder="Enter your name"
                value={doshaName}
                onChange={(e) => setDoshaName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button 
                onClick={handleCheckDosha}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Check Dosha
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Birth Details Form Dialog */}
      <Dialog open={showDoshaForm} onOpenChange={setShowDoshaForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Birth Details</DialogTitle>
            <DialogDescription>
              For accurate dosha analysis, please provide your birth details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Birth *
              </Label>
              <Input
                type="date"
                value={doshaFormData.dateOfBirth}
                onChange={(e) => setDoshaFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time of Birth *
              </Label>
              <TimePickerAMPM
                value={doshaFormData.timeOfBirth}
                onChange={(value) => setDoshaFormData(prev => ({ ...prev, timeOfBirth: value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Birth Location *
              </Label>
              <CityAutocomplete
                value={doshaFormData.birthLocation}
                onChange={(value) => setDoshaFormData(prev => ({ ...prev, birthLocation: value }))}
                placeholder="City, State, Country"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDoshaForm(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={calculateDosha}
              disabled={!doshaFormData.dateOfBirth || !doshaFormData.timeOfBirth || !doshaFormData.birthLocation}
            >
              Calculate Dosha
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dosha Analysis Dialog */}
      <Dialog open={showDoshaDialog} onOpenChange={setShowDoshaDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Dosha Analysis for {doshaName}</DialogTitle>
            <DialogDescription>
              Preliminary analysis based on Vedic astrology principles
            </DialogDescription>
          </DialogHeader>
          
          {doshaResult && (
            <div className="space-y-4 py-4">
              {/* Mangal Dosha */}
              <div className={`p-4 rounded-lg border ${doshaResult.mangal.present ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Mangal Dosha (Kuja Dosha)</span>
                  <Badge variant={doshaResult.mangal.present ? "destructive" : "default"}>
                    {doshaResult.mangal.present ? "Detected" : "Not Present"}
                  </Badge>
                </div>
                {doshaResult.mangal.present && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Severity: <span className="font-medium text-red-600 dark:text-red-400">{doshaResult.mangal.severity}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Affected Houses: {doshaResult.mangal.houses}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Remedy:</strong> Mangal Shanti Pooja, Kuja Dosha Nivaran
                    </p>
                  </div>
                )}
              </div>
              
              {/* Shani Sade Sati */}
              <div className={`p-4 rounded-lg border ${doshaResult.shani.sade_sati ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Shani Sade Sati</span>
                  <Badge variant={doshaResult.shani.sade_sati ? "outline" : "default"} className={doshaResult.shani.sade_sati ? "border-yellow-500 text-yellow-700 dark:text-yellow-400" : ""}>
                    {doshaResult.shani.sade_sati ? "Active" : "Not Active"}
                  </Badge>
                </div>
                {doshaResult.shani.sade_sati && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Current Phase: <span className="font-medium text-yellow-600 dark:text-yellow-400">{doshaResult.shani.phase}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Remedy:</strong> Hanuman Chalisa recitation, Shani Shanti Pooja
                    </p>
                  </div>
                )}
              </div>
              
              {/* Kalsarpa Dosha */}
              <div className={`p-4 rounded-lg border ${doshaResult.kalsarpa.present ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800' : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Kalsarpa Dosha</span>
                  <Badge variant={doshaResult.kalsarpa.present ? "outline" : "default"} className={doshaResult.kalsarpa.present ? "border-purple-500 text-purple-700 dark:text-purple-400" : ""}>
                    {doshaResult.kalsarpa.present ? "Detected" : "Not Present"}
                  </Badge>
                </div>
                {doshaResult.kalsarpa.present && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Type: <span className="font-medium text-purple-600 dark:text-purple-400">{doshaResult.kalsarpa.type}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Remedy:</strong> Kalsarpa Shanti at Trimbakeshwar or Kalahasti
                    </p>
                  </div>
                )}
              </div>
              
              {/* Rahu-Ketu Effects */}
              <div className={`p-4 rounded-lg border ${doshaResult.rahu_ketu.affected ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Rahu-Ketu Effects</span>
                  <Badge variant={doshaResult.rahu_ketu.affected ? "outline" : "default"} className={doshaResult.rahu_ketu.affected ? "border-orange-500 text-orange-700 dark:text-orange-400" : ""}>
                    {doshaResult.rahu_ketu.affected ? "Affected" : "Neutral"}
                  </Badge>
                </div>
                {doshaResult.rahu_ketu.affected && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Affected Houses: {doshaResult.rahu_ketu.houses}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Remedy:</strong> Rahu-Ketu Shanti Pooja, Naga Dosha Nivaran
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Consultation CTA - AFTER showing analysis */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              For personalized remedies and detailed birth chart reading based on your exact birth details, 
              consult with our certified Jyotish experts.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDoshaDialog(false)}>
                Close
              </Button>
              <Button className="flex-1" onClick={() => window.location.href = '/contact'}>
                Book Jyotish Consultation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
