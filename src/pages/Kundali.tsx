import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Star, Moon, Sun, Loader2, Download, MessageSquare, User } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { TimePickerAMPM } from "@/components/ui/time-picker-ampm";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NorthIndianChart } from "@/components/NorthIndianChart";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Planetary data constants
const planets = [
  { id: "sun", name: "Sun (Surya)", symbol: "☉", color: "text-orange-500" },
  { id: "moon", name: "Moon (Chandra)", symbol: "☽", color: "text-blue-300" },
  { id: "mars", name: "Mars (Mangal)", symbol: "♂", color: "text-red-500" },
  { id: "mercury", name: "Mercury (Budha)", symbol: "☿", color: "text-green-500" },
  { id: "jupiter", name: "Jupiter (Guru)", symbol: "♃", color: "text-yellow-500" },
  { id: "venus", name: "Venus (Shukra)", symbol: "♀", color: "text-pink-400" },
  { id: "saturn", name: "Saturn (Shani)", symbol: "♄", color: "text-gray-600" },
  { id: "rahu", name: "Rahu", symbol: "☊", color: "text-purple-500" },
  { id: "ketu", name: "Ketu", symbol: "☋", color: "text-amber-700" },
];

const rashis = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
  "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)",
  "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
];

const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
  "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
  "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati"
];

const dashas = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

interface KundaliData {
  lagna: string;
  rashi: string;
  nakshatra: string;
  pada: number;
  planetaryPositions: Array<{
    planet: string;
    sign: string;
    degree: string;
    house: number;
    retrograde: boolean;
  }>;
  houses: Array<{
    number: number;
    sign: string;
    planets: string[];
  }>;
  currentDasha: {
    mahadasha: string;
    antardasha: string;
    startDate: string;
    endDate: string;
  };
  doshas: {
    mangal: boolean;
    shani: boolean;
    kalsarpa: boolean;
  };
  yogas: string[];
}

export default function Kundali() {
  const { user } = useAuth();
  const profile = user;
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    timeOfBirth: "",
    birthLocation: "",
    gender: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [kundaliData, setKundaliData] = useState<KundaliData | null>(null);
  const [chartStyle, setChartStyle] = useState<'south' | 'north'>('south');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.full_name || "",
        dateOfBirth: profile.date_of_birth || "",
        timeOfBirth: profile.time_of_birth || "",
        birthLocation: profile.birth_location || "",
        gender: profile.gender || ""
      }));
    }
  }, [profile]);

  const generateKundali = () => {
    if (!formData.dateOfBirth || !formData.timeOfBirth || !formData.birthLocation || !formData.gender) {
      toast({
        title: "Missing Details",
        description: "Please fill in all birth details including gender to generate your Kundali",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    // Simulate calculation (in production, this would call an edge function)
    setTimeout(() => {
      const dateHash = new Date(formData.dateOfBirth).getDate();
      const timeHash = parseInt(formData.timeOfBirth.split(':')[0]) || 0;
      
      const lagnaIndex = (dateHash + timeHash) % 12;
      const rashiIndex = (dateHash * 2 + timeHash) % 12;
      const nakshatraIndex = (dateHash + timeHash * 2) % 27;

      // Generate planetary positions
      const planetaryPositions = planets.map((planet, i) => ({
        planet: planet.name,
        sign: rashis[(lagnaIndex + i * 3) % 12],
        degree: `${(dateHash + i * 7) % 30}°${(timeHash * i) % 60}'`,
        house: ((lagnaIndex + i) % 12) + 1,
        retrograde: i > 1 && i < 7 && dateHash % 3 === 0
      }));

      // Generate houses with planets
      const houses = Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        sign: rashis[(lagnaIndex + i) % 12],
        planets: planetaryPositions
          .filter(p => p.house === i + 1)
          .map(p => planets.find(pl => pl.name === p.planet)?.symbol || "")
      }));

      // Current Dasha
      const dashaIndex = dateHash % 9;
      const currentYear = new Date().getFullYear();

      // Doshas
      const mangalDosha = dateHash % 4 === 0;
      const shaniDosha = timeHash % 3 === 0;
      const kalsarpaDosha = dateHash % 7 === 0;

      // Yogas
      const possibleYogas = ["Gaja Kesari Yoga", "Budhaditya Yoga", "Raja Yoga", "Dhana Yoga", "Neecha Bhanga Raja Yoga"];
      const yogas = possibleYogas.filter((_, i) => (dateHash + i) % 3 === 0);

      setKundaliData({
        lagna: rashis[lagnaIndex],
        rashi: rashis[rashiIndex],
        nakshatra: nakshatras[nakshatraIndex],
        pada: (dateHash % 4) + 1,
        planetaryPositions,
        houses,
        currentDasha: {
          mahadasha: dashas[dashaIndex],
          antardasha: dashas[(dashaIndex + 2) % 9],
          startDate: `${currentYear - 2}`,
          endDate: `${currentYear + 5}`
        },
        doshas: {
          mangal: mangalDosha,
          shani: shaniDosha,
          kalsarpa: kalsarpaDosha
        },
        yogas
      });

      setIsGenerating(false);
      toast({
        title: "Kundali Generated",
        description: "Your birth chart has been calculated successfully"
      });
    }, 2000);
  };

  const handleDownloadPDF = async () => {
    if (!chartRef.current || !kundaliData) return;
    
    setIsExportingPdf(true);
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add header
      pdf.setFontSize(24);
      pdf.setTextColor(139, 69, 19); // Brown/saffron color
      pdf.text('॥ श्री गणेशाय नमः ॥', 105, 20, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Kundali - ${formData.fullName || 'Birth Chart'}`, 105, 35, { align: 'center' });
      
      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Birth: ${formData.dateOfBirth} at ${formData.timeOfBirth}`, 105, 45, { align: 'center' });
      pdf.text(`Location: ${formData.birthLocation}`, 105, 52, { align: 'center' });
      
      // Add basic info
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Lagna: ${kundaliData.lagna}  |  Rashi: ${kundaliData.rashi}  |  Nakshatra: ${kundaliData.nakshatra}  |  Pada: ${kundaliData.pada}`, 105, 62, { align: 'center' });
      
      // Add chart image
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const maxHeight = 200; // Max height to fit on page
      const finalHeight = Math.min(imgHeight, maxHeight);
      const finalWidth = (finalHeight / imgHeight) * imgWidth;
      
      pdf.addImage(imgData, 'PNG', (210 - finalWidth) / 2, 70, finalWidth, finalHeight);
      
      // Add footer
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${new Date().toLocaleDateString()} by OnlinePooja.in`, 105, 285, { align: 'center' });
      pdf.text('For personalized consultation, contact our Jyotish experts', 105, 290, { align: 'center' });
      
      pdf.save(`Kundali_${(formData.fullName || 'Chart').replace(/\s+/g, '_')}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your Kundali has been saved as PDF"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsExportingPdf(false);
  };

  const content = (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          Vedic Astrology
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
          Kundali / Birth Chart
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Generate your complete Vedic birth chart with planetary positions, houses, 
          doshas, and astrological predictions based on ancient wisdom.
        </p>
      </div>

      {/* Input Form */}
      <Card className="max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Enter Birth Details
          </CardTitle>
          <CardDescription>
            {user ? "Your saved details have been auto-filled" : "Enter your exact birth details for accurate calculations"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Birth *
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time of Birth *
              </Label>
              <TimePickerAMPM
                value={formData.timeOfBirth}
                onChange={(value) => setFormData(prev => ({ ...prev, timeOfBirth: value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Birth Location *
            </Label>
            <CityAutocomplete
              value={formData.birthLocation}
              onChange={(value) => setFormData(prev => ({ ...prev, birthLocation: value }))}
              placeholder="City, State, Country"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Gender *
            </Label>
            <RadioGroup 
              value={formData.gender} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="male" id="kundali-male" />
                <Label htmlFor="kundali-male" className="cursor-pointer">Male</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="female" id="kundali-female" />
                <Label htmlFor="kundali-female" className="cursor-pointer">Female</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={generateKundali} className="w-full" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Calculating Planetary Positions...
              </>
            ) : (
              "Generate Kundali"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Kundali Results */}
      {kundaliData && (
        <div ref={chartRef} className="space-y-6" id="kundali-export">
          {/* Basic Info */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 text-center">
                <Sun className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Lagna (Ascendant)</div>
                <div className="font-semibold text-foreground">{kundaliData.lagna}</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6 text-center">
                <Moon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Moon Sign (Rashi)</div>
                <div className="font-semibold text-foreground">{kundaliData.rashi}</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6 text-center">
                <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Nakshatra</div>
                <div className="font-semibold text-foreground">{kundaliData.nakshatra}</div>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6 text-center">
                <span className="text-2xl mb-2 block">॥</span>
                <div className="text-sm text-muted-foreground">Pada</div>
                <div className="font-semibold text-foreground">{kundaliData.pada}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
              <TabsTrigger value="chart">Birth Chart</TabsTrigger>
              <TabsTrigger value="planets">Planets</TabsTrigger>
              <TabsTrigger value="dasha">Dasha</TabsTrigger>
              <TabsTrigger value="doshas">Doshas</TabsTrigger>
            </TabsList>

            {/* Birth Chart Tab */}
            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>{chartStyle === 'south' ? 'South' : 'North'} Indian Birth Chart</CardTitle>
                      <CardDescription>Your planetary positions at the time of birth</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant={chartStyle === 'south' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setChartStyle('south')}
                      >
                        South Indian
                      </Button>
                      <Button 
                        variant={chartStyle === 'north' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setChartStyle('north')}
                      >
                        North Indian
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {chartStyle === 'south' ? (
                    /* South Indian Chart Grid */
                    <div className="max-w-md mx-auto">
                      <div className="grid grid-cols-4 gap-1 aspect-square">
                        {[12, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6].map((houseNum, idx) => {
                          if (houseNum === null) {
                            return <div key={idx} className="bg-muted/30" />;
                          }
                          const house = kundaliData.houses.find(h => h.number === houseNum);
                          const isLagna = houseNum === 1;
                          return (
                            <div
                              key={idx}
                              className={`border p-2 text-center flex flex-col justify-between ${isLagna ? 'bg-primary/10 border-primary' : 'bg-background'}`}
                            >
                              <div className="text-xs text-muted-foreground">{houseNum}</div>
                              <div className="text-lg font-medium">
                                {house?.planets.join(' ')}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {house?.sign.split(' ')[0]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* North Indian Diamond Chart */
                    <NorthIndianChart houses={kundaliData.houses} />
                  )}

                  {/* Yogas */}
                  {kundaliData.yogas.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold mb-3">Beneficial Yogas Found</h4>
                      <div className="flex flex-wrap gap-2">
                        {kundaliData.yogas.map((yoga) => (
                          <Badge key={yoga} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            ✓ {yoga}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Planets Tab */}
            <TabsContent value="planets">
              <Card>
                <CardHeader>
                  <CardTitle>Planetary Positions</CardTitle>
                  <CardDescription>Detailed positions of all 9 planets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Planet</th>
                          <th className="text-left py-2">Sign</th>
                          <th className="text-left py-2">Degree</th>
                          <th className="text-left py-2">House</th>
                          <th className="text-left py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kundaliData.planetaryPositions.map((pos, idx) => {
                          const planet = planets[idx];
                          return (
                            <tr key={pos.planet} className="border-b">
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xl ${planet.color}`}>{planet.symbol}</span>
                                  <span>{pos.planet}</span>
                                </div>
                              </td>
                              <td className="py-3">{pos.sign}</td>
                              <td className="py-3">{pos.degree}</td>
                              <td className="py-3">{pos.house}</td>
                              <td className="py-3">
                                {pos.retrograde ? (
                                  <Badge variant="outline" className="text-amber-600">Retrograde</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-green-600">Direct</Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dasha Tab */}
            <TabsContent value="dasha">
              <Card>
                <CardHeader>
                  <CardTitle>Vimshottari Dasha</CardTitle>
                  <CardDescription>Current planetary periods affecting your life</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="text-sm text-muted-foreground mb-1">Mahadasha (Main Period)</div>
                      <div className="text-2xl font-bold text-primary">{kundaliData.currentDasha.mahadasha}</div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {kundaliData.currentDasha.startDate} - {kundaliData.currentDasha.endDate}
                      </div>
                    </div>
                    <div className="p-6 rounded-lg bg-secondary/50 border">
                      <div className="text-sm text-muted-foreground mb-1">Antardasha (Sub Period)</div>
                      <div className="text-2xl font-bold">{kundaliData.currentDasha.antardasha}</div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Currently Active
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Dasha Interpretation</h4>
                    <p className="text-sm text-muted-foreground">
                      Your current {kundaliData.currentDasha.mahadasha} Mahadasha brings focus on 
                      {kundaliData.currentDasha.mahadasha === "Venus" && " relationships, art, and material comforts."}
                      {kundaliData.currentDasha.mahadasha === "Jupiter" && " wisdom, spirituality, and expansion."}
                      {kundaliData.currentDasha.mahadasha === "Saturn" && " discipline, karma, and life lessons."}
                      {kundaliData.currentDasha.mahadasha === "Mars" && " energy, courage, and action."}
                      {kundaliData.currentDasha.mahadasha === "Mercury" && " communication, intellect, and business."}
                      {kundaliData.currentDasha.mahadasha === "Moon" && " emotions, intuition, and nurturing."}
                      {kundaliData.currentDasha.mahadasha === "Sun" && " self-expression, authority, and vitality."}
                      {kundaliData.currentDasha.mahadasha === "Rahu" && " material desires and unconventional paths."}
                      {kundaliData.currentDasha.mahadasha === "Ketu" && " spirituality, detachment, and past karma."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Doshas Tab */}
            <TabsContent value="doshas">
              <Card>
                <CardHeader>
                  <CardTitle>Dosha Analysis</CardTitle>
                  <CardDescription>Astrological afflictions and remedies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-4 rounded-lg border ${kundaliData.doshas.mangal ? 'bg-red-50 dark:bg-red-950/20 border-red-200' : 'bg-green-50 dark:bg-green-950/20 border-green-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Mangal Dosha (Kuja Dosha)</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Mars placement affecting marriage compatibility
                        </p>
                      </div>
                      <Badge variant={kundaliData.doshas.mangal ? "destructive" : "default"}>
                        {kundaliData.doshas.mangal ? "Present" : "Not Present"}
                      </Badge>
                    </div>
                    {kundaliData.doshas.mangal && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <p className="text-sm"><strong>Remedy:</strong> Perform Mangal Shanti Pooja, wear Red Coral (after consultation)</p>
                      </div>
                    )}
                  </div>

                  <div className={`p-4 rounded-lg border ${kundaliData.doshas.shani ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200' : 'bg-green-50 dark:bg-green-950/20 border-green-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Shani Sade Sati</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Saturn's 7.5 year transit over Moon sign
                        </p>
                      </div>
                      <Badge variant={kundaliData.doshas.shani ? "outline" : "default"}>
                        {kundaliData.doshas.shani ? "Active" : "Not Active"}
                      </Badge>
                    </div>
                    {kundaliData.doshas.shani && (
                      <div className="mt-3 pt-3 border-t border-yellow-200">
                        <p className="text-sm"><strong>Remedy:</strong> Hanuman Chalisa recitation, visit Shani temple on Saturdays</p>
                      </div>
                    )}
                  </div>

                  <div className={`p-4 rounded-lg border ${kundaliData.doshas.kalsarpa ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-200' : 'bg-green-50 dark:bg-green-950/20 border-green-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Kalsarpa Dosha</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          All planets between Rahu and Ketu
                        </p>
                      </div>
                      <Badge variant={kundaliData.doshas.kalsarpa ? "outline" : "default"}>
                        {kundaliData.doshas.kalsarpa ? "Present" : "Not Present"}
                      </Badge>
                    </div>
                    {kundaliData.doshas.kalsarpa && (
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <p className="text-sm"><strong>Remedy:</strong> Kalsarpa Shanti Pooja at Trimbakeshwar or Kalahasti</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={handleDownloadPDF}
              disabled={isExportingPdf}
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Chart (PDF)
                </>
              )}
            </Button>
            <Button className="gap-2" onClick={() => navigate('/contact')}>
              <MessageSquare className="h-4 w-4" />
              Book Jyotish Consultation
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return <MobileLayout title="Kundali">{content}</MobileLayout>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {content}
      <Footer />
    </div>
  );
}
