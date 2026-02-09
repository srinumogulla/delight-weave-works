import { useState, useEffect } from "react";
import { Sparkles, Gem, BookOpen, Heart, Moon, Sun, Shield, Star, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimePickerAMPM } from "@/components/ui/time-picker-ampm";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { useLanguage } from "@/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface RemedyRecommendation {
  category: 'pooja' | 'mantra' | 'gemstone' | 'donation' | 'fasting';
  name: string;
  description: string;
  frequency?: string;
  instructions: string;
  effectivePlanets: string[];
  poojaId?: string;
  priority: 'high' | 'medium' | 'low';
}

interface DoshaAnalysis {
  mangalDosha: { present: boolean; severity: 'mild' | 'moderate' | 'severe'; houses: number[] };
  shaniSadeSati: { active: boolean; phase: string };
  kalsarpaDosha: { present: boolean; type: string };
  rahuKetu: { afflicted: boolean; houses: number[] };
  weakPlanets: string[];
  currentDasha: { mahadasha: string; antardasha: string };
}

// Remedy database
const remedyDatabase: RemedyRecommendation[] = [
  // Mangal Dosha Remedies
  {
    category: 'pooja',
    name: 'Mangal Shanti Pooja',
    description: 'Pacifies Mars and reduces Mangal Dosha effects',
    frequency: 'Once or on Tuesdays',
    instructions: 'Perform on Tuesday during Mars hora for maximum benefit',
    effectivePlanets: ['Mars'],
    poojaId: 'mangal-shanti',
    priority: 'high'
  },
  {
    category: 'mantra',
    name: 'Mangal Beej Mantra',
    description: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah',
    frequency: 'Daily 108 times',
    instructions: 'Chant facing south on Tuesdays wearing red',
    effectivePlanets: ['Mars'],
    priority: 'high'
  },
  {
    category: 'gemstone',
    name: 'Red Coral (Moonga)',
    description: 'Strengthens Mars and improves courage',
    instructions: 'Wear 5-7 carats in gold ring on ring finger, Tuesday morning',
    effectivePlanets: ['Mars'],
    priority: 'medium'
  },
  {
    category: 'donation',
    name: 'Red items donation',
    description: 'Donate red lentils, red cloth, jaggery on Tuesdays',
    frequency: 'Every Tuesday',
    instructions: 'Donate to a temple or needy person before sunset',
    effectivePlanets: ['Mars'],
    priority: 'medium'
  },
  {
    category: 'fasting',
    name: 'Tuesday Fasting (Mangalwar Vrat)',
    description: 'Fast on Tuesdays to appease Mars',
    frequency: 'Every Tuesday',
    instructions: 'Eat only once after sunset, avoid salt',
    effectivePlanets: ['Mars'],
    priority: 'low'
  },
  // Shani Remedies
  {
    category: 'pooja',
    name: 'Shani Shanti Pooja',
    description: 'Reduces malefic effects of Saturn',
    frequency: 'On Saturdays',
    instructions: 'Best performed during Sade Sati or Saturn transit',
    effectivePlanets: ['Saturn'],
    poojaId: 'shani-shanti',
    priority: 'high'
  },
  {
    category: 'mantra',
    name: 'Shani Beej Mantra',
    description: 'Om Praam Preem Praum Sah Shanaischaraya Namah',
    frequency: 'Daily 108 times',
    instructions: 'Chant facing west on Saturdays wearing black/blue',
    effectivePlanets: ['Saturn'],
    priority: 'high'
  },
  {
    category: 'gemstone',
    name: 'Blue Sapphire (Neelam)',
    description: 'Strengthens Saturn - wear only after trial period',
    instructions: 'Wear 3-5 carats in silver/iron ring on middle finger, Saturday morning',
    effectivePlanets: ['Saturn'],
    priority: 'medium'
  },
  {
    category: 'donation',
    name: 'Black items donation',
    description: 'Donate black sesame, mustard oil, iron items on Saturdays',
    frequency: 'Every Saturday',
    instructions: 'Donate to laborers or elderly before sunset',
    effectivePlanets: ['Saturn'],
    priority: 'medium'
  },
  // Rahu Remedies
  {
    category: 'pooja',
    name: 'Rahu Shanti Pooja',
    description: 'Neutralizes malefic Rahu effects',
    frequency: 'During Rahu Kaal or eclipses',
    instructions: 'Perform with Durga or Saraswati worship',
    effectivePlanets: ['Rahu'],
    poojaId: 'rahu-shanti',
    priority: 'high'
  },
  {
    category: 'mantra',
    name: 'Rahu Beej Mantra',
    description: 'Om Bhram Bhreem Bhraum Sah Rahave Namah',
    frequency: 'Daily 108 times',
    instructions: 'Chant during Rahu Kaal for 40 days',
    effectivePlanets: ['Rahu'],
    priority: 'high'
  },
  {
    category: 'gemstone',
    name: 'Hessonite (Gomed)',
    description: 'Neutralizes Rahu affliction',
    instructions: 'Wear 4-6 carats in silver ring on middle finger, Saturday evening',
    effectivePlanets: ['Rahu'],
    priority: 'medium'
  },
  // Ketu Remedies
  {
    category: 'pooja',
    name: 'Ketu Shanti Pooja',
    description: 'Pacifies Ketu for spiritual growth',
    frequency: 'On Tuesdays or during eclipses',
    instructions: 'Combine with Ganesha worship for best results',
    effectivePlanets: ['Ketu'],
    poojaId: 'ketu-shanti',
    priority: 'high'
  },
  {
    category: 'mantra',
    name: 'Ketu Beej Mantra',
    description: 'Om Sraam Sreem Sraum Sah Ketave Namah',
    frequency: 'Daily 108 times',
    instructions: 'Chant during Brahma Muhurta wearing grey',
    effectivePlanets: ['Ketu'],
    priority: 'high'
  },
  {
    category: 'gemstone',
    name: "Cat's Eye (Lehsunia)",
    description: 'Strengthens Ketu and provides protection',
    instructions: 'Wear 3-5 carats in silver ring on middle finger, Thursday morning',
    effectivePlanets: ['Ketu'],
    priority: 'medium'
  },
  // General Remedies
  {
    category: 'pooja',
    name: 'Navagraha Shanti Pooja',
    description: 'Balances all nine planetary influences',
    frequency: 'Annually or during difficult transits',
    instructions: 'Best performed on Amavasya or Purnima',
    effectivePlanets: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'],
    poojaId: 'navagraha-shanti',
    priority: 'high'
  },
  {
    category: 'mantra',
    name: 'Gayatri Mantra',
    description: 'Universal mantra for spiritual protection and wisdom',
    frequency: 'Daily 108 times',
    instructions: 'Chant at sunrise, noon, and sunset for maximum benefit',
    effectivePlanets: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'],
    priority: 'high'
  },
  {
    category: 'mantra',
    name: 'Mahamrityunjaya Mantra',
    description: 'For health, longevity, and overcoming obstacles',
    frequency: 'Daily 108 times',
    instructions: 'Chant during Brahma Muhurta or at night before sleep',
    effectivePlanets: ['Moon', 'Saturn'],
    priority: 'high'
  }
];

export default function Remedies() {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user: profile } = useAuth();

  // Form state
  const [name, setName] = useState("");
  const [gender, setGender] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [birthLocation, setBirthLocation] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Results state
  const [analysis, setAnalysis] = useState<DoshaAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<RemedyRecommendation[]>([]);

  // Auto-fill from profile
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setGender((profile as any).gender || "");
      if (profile.date_of_birth) {
        setDateOfBirth(profile.date_of_birth);
      }
      if (profile.time_of_birth) {
        const [hours, minutes] = profile.time_of_birth.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        setTimeOfBirth(`${hour12.toString().padStart(2, '0')}:${minutes} ${period}`);
      }
      if (profile.birth_location) {
        setBirthLocation(profile.birth_location);
      }
    }
  }, [profile]);

  const analyzeChart = () => {
    if (!name || !gender || !dateOfBirth || !timeOfBirth || !birthLocation) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsCalculating(true);

    // Simulate calculation
    setTimeout(() => {
      const birthDate = new Date(dateOfBirth);
      const dayOfMonth = birthDate.getDate();
      const month = birthDate.getMonth();
      const year = birthDate.getFullYear();

      // Simulated analysis based on birth details
      const mangalPresent = (dayOfMonth + month) % 4 === 0;
      const mangalSeverity = dayOfMonth % 3 === 0 ? 'severe' : dayOfMonth % 3 === 1 ? 'moderate' : 'mild';
      
      const sadeSatiActive = (year + month) % 7 === 0;
      const sadeSatiPhase = sadeSatiActive ? (dayOfMonth % 3 === 0 ? 'Rising' : dayOfMonth % 3 === 1 ? 'Peak' : 'Setting') : 'Not Active';
      
      const kalsarpaPresent = (dayOfMonth + year) % 8 === 0;
      const kalsarpaType = kalsarpaPresent ? (dayOfMonth % 2 === 0 ? 'Anant' : 'Takshak') : '';
      
      const rahuAfflicted = (month + dayOfMonth) % 5 === 0;

      const doshaAnalysis: DoshaAnalysis = {
        mangalDosha: {
          present: mangalPresent,
          severity: mangalSeverity as 'mild' | 'moderate' | 'severe',
          houses: mangalPresent ? [1, 4, 7, 8, 12].filter((_, i) => (dayOfMonth + i) % 3 === 0) : []
        },
        shaniSadeSati: {
          active: sadeSatiActive,
          phase: sadeSatiPhase
        },
        kalsarpaDosha: {
          present: kalsarpaPresent,
          type: kalsarpaType
        },
        rahuKetu: {
          afflicted: rahuAfflicted,
          houses: rahuAfflicted ? [6, 12] : []
        },
        weakPlanets: ['Mars', 'Saturn', 'Rahu', 'Ketu'].filter((_, i) => (dayOfMonth + month + i) % 4 === 0),
        currentDasha: {
          mahadasha: ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'][dayOfMonth % 9],
          antardasha: ['Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun'][(dayOfMonth + month) % 9]
        }
      };

      setAnalysis(doshaAnalysis);

      // Generate recommendations based on analysis
      const recs: RemedyRecommendation[] = [];

      if (doshaAnalysis.mangalDosha.present) {
        recs.push(...remedyDatabase.filter(r => r.effectivePlanets.includes('Mars')));
      }

      if (doshaAnalysis.shaniSadeSati.active) {
        recs.push(...remedyDatabase.filter(r => r.effectivePlanets.includes('Saturn')));
      }

      if (doshaAnalysis.kalsarpaDosha.present || doshaAnalysis.rahuKetu.afflicted) {
        recs.push(...remedyDatabase.filter(r => 
          r.effectivePlanets.includes('Rahu') || r.effectivePlanets.includes('Ketu')
        ));
      }

      // Always add general remedies
      recs.push(...remedyDatabase.filter(r => r.effectivePlanets.length > 3));

      // Remove duplicates and sort by priority
      const uniqueRecs = recs.filter((r, i, arr) => arr.findIndex(x => x.name === r.name) === i);
      uniqueRecs.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      setRecommendations(uniqueRecs);
      setIsCalculating(false);
      toast.success("Analysis complete! See your personalized remedies below.");
    }, 1500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pooja': return <BookOpen className="h-5 w-5" />;
      case 'mantra': return <Moon className="h-5 w-5" />;
      case 'gemstone': return <Gem className="h-5 w-5" />;
      case 'donation': return <Heart className="h-5 w-5" />;
      case 'fasting': return <Sun className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-500 text-white">High Priority</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
      default: return <Badge variant="outline">Supplementary</Badge>;
    }
  };

  const content = (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            Vedic Remedies Engine
          </h1>
          <p className="text-muted-foreground">
            Personalized poojas, mantras, and gemstones based on your birth chart analysis
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Birth Details</CardTitle>
            <CardDescription>
              Provide accurate birth information for precise dosha analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <RadioGroup value={gender} onValueChange={setGender} className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Time of Birth *</Label>
                <TimePickerAMPM value={timeOfBirth} onChange={setTimeOfBirth} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Birth Location *</Label>
                <CityAutocomplete value={birthLocation} onChange={setBirthLocation} />
              </div>
            </div>

            <Button 
              onClick={analyzeChart} 
              className="w-full mt-6" 
              size="lg"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                  Analyzing Chart...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze & Get Remedies
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <>
            {/* Dosha Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Dosha Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Mangal Dosha */}
                  <div className={`p-4 rounded-lg border-2 ${analysis.mangalDosha.present ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-green-500 bg-green-50 dark:bg-green-950'}`}>
                    <h4 className="font-semibold mb-1">Mangal Dosha</h4>
                    <p className={`text-sm ${analysis.mangalDosha.present ? 'text-red-600' : 'text-green-600'}`}>
                      {analysis.mangalDosha.present ? `Present (${analysis.mangalDosha.severity})` : 'Not Present'}
                    </p>
                    {analysis.mangalDosha.present && analysis.mangalDosha.houses.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Affected houses: {analysis.mangalDosha.houses.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Shani Sade Sati */}
                  <div className={`p-4 rounded-lg border-2 ${analysis.shaniSadeSati.active ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-green-500 bg-green-50 dark:bg-green-950'}`}>
                    <h4 className="font-semibold mb-1">Shani Sade Sati</h4>
                    <p className={`text-sm ${analysis.shaniSadeSati.active ? 'text-blue-600' : 'text-green-600'}`}>
                      {analysis.shaniSadeSati.phase}
                    </p>
                  </div>

                  {/* Kalsarpa Dosha */}
                  <div className={`p-4 rounded-lg border-2 ${analysis.kalsarpaDosha.present ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' : 'border-green-500 bg-green-50 dark:bg-green-950'}`}>
                    <h4 className="font-semibold mb-1">Kalsarpa Dosha</h4>
                    <p className={`text-sm ${analysis.kalsarpaDosha.present ? 'text-purple-600' : 'text-green-600'}`}>
                      {analysis.kalsarpaDosha.present ? `${analysis.kalsarpaDosha.type} Type` : 'Not Present'}
                    </p>
                  </div>

                  {/* Current Dasha */}
                  <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                    <h4 className="font-semibold mb-1">Current Dasha</h4>
                    <p className="text-sm text-primary">
                      {analysis.currentDasha.mahadasha} - {analysis.currentDasha.antardasha}
                    </p>
                  </div>
                </div>

                {/* Weak Planets */}
                {analysis.weakPlanets.length > 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-muted">
                    <h4 className="font-semibold mb-2">Weak Planets in Chart</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.weakPlanets.map((planet, idx) => (
                        <Badge key={idx} variant="secondary">{planet}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Personalized Remedies
                </CardTitle>
                <CardDescription>
                  {recommendations.length} remedies recommended based on your chart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pooja">Poojas</TabsTrigger>
                    <TabsTrigger value="mantra">Mantras</TabsTrigger>
                    <TabsTrigger value="gemstone">Gemstones</TabsTrigger>
                    <TabsTrigger value="donation">Donations</TabsTrigger>
                    <TabsTrigger value="fasting">Fasting</TabsTrigger>
                  </TabsList>

                  {['all', 'pooja', 'mantra', 'gemstone', 'donation', 'fasting'].map((tab) => (
                    <TabsContent key={tab} value={tab} className="space-y-4">
                      {recommendations
                        .filter(r => tab === 'all' || r.category === tab)
                        .map((remedy, idx) => (
                          <div
                            key={idx}
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                {getCategoryIcon(remedy.category)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="font-semibold">{remedy.name}</h4>
                                  {getPriorityBadge(remedy.priority)}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {remedy.description}
                                </p>
                                {remedy.frequency && (
                                  <p className="text-xs text-primary mb-1">
                                    Frequency: {remedy.frequency}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {remedy.instructions}
                                </p>
                              </div>
                              {remedy.poojaId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/booking?service=${remedy.poojaId}`)}
                                >
                                  Book
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                    </TabsContent>
                  ))}
                </Tabs>

                {/* Consultation CTA */}
                <div className="mt-8 p-6 bg-primary/10 rounded-lg text-center">
                  <h3 className="text-lg font-semibold mb-2">Need Expert Guidance?</h3>
                  <p className="text-muted-foreground mb-4">
                    Consult with our experienced Jyotish experts for personalized remedy planning
                  </p>
                  <Button onClick={() => navigate('/contact')}>
                    Book Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return <MobileLayout title="Vedic Remedies">{content}</MobileLayout>;
  }

  return (
    <>
      <Header />
      {content}
      <Footer />
    </>
  );
}
