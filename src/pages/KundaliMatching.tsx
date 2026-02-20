import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Heart, Star, Users, Check, X, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { TimePickerAMPM } from "@/components/ui/time-picker-ampm";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getKundaliMatching } from "@/api/astrology";

interface PersonData {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthLocation: string;
  gender: 'male' | 'female' | '';
}

interface KootaResult {
  name: string;
  description: string;
  maxPoints: number;
  score: number;
  details: string;
}

interface MatchingResult {
  kootas: KootaResult[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  verdict: 'excellent' | 'good' | 'average' | 'poor';
  mangalDosha: {
    personA: boolean;
    personB: boolean;
    cancelled: boolean;
  };
  recommendation: string;
}

// Nakshatra list for calculations
const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
  "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
  "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati"
];

// Rashi (Moon Sign) list
const rashis = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", 
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"
];

export default function KundaliMatching() {
  const { user: profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [personA, setPersonA] = useState<PersonData>({
    name: profile?.full_name || "",
    dateOfBirth: profile?.date_of_birth || "",
    timeOfBirth: profile?.time_of_birth || "",
    birthLocation: profile?.birth_location || "",
    gender: (profile?.gender as 'male' | 'female') || ""
  });

  const [personB, setPersonB] = useState<PersonData>({
    name: "",
    dateOfBirth: "",
    timeOfBirth: "",
    birthLocation: "",
    gender: ""
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<MatchingResult | null>(null);




  const calculateMatch = async () => {
    if (!personA.dateOfBirth || !personA.timeOfBirth || !personA.birthLocation ||
        !personB.dateOfBirth || !personB.timeOfBirth || !personB.birthLocation) {
      toast({
        title: "Missing Details",
        description: "Please fill in all birth details for both persons",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);

    try {
      const response = await getKundaliMatching({
        person_a: {
          date_of_birth: personA.dateOfBirth,
          time_of_birth: personA.timeOfBirth,
          birth_place_name: personA.birthLocation,
          gender: personA.gender,
          name: personA.name,
        },
        person_b: {
          date_of_birth: personB.dateOfBirth,
          time_of_birth: personB.timeOfBirth,
          birth_place_name: personB.birthLocation,
          gender: personB.gender,
          name: personB.name,
        },
      });

      // Normalize kootas
      const rawKootas = response.kootas || response.koota_scores || [];
      const kootas: KootaResult[] = rawKootas.map((k: any) => ({
        name: k.name || '',
        description: k.description || '',
        maxPoints: k.max_points ?? k.maxPoints ?? 0,
        score: k.score ?? 0,
        details: k.details || '',
      }));

      const totalScore = response.total_score ?? response.totalScore ?? kootas.reduce((s, k) => s + k.score, 0);
      const maxScore = response.max_score ?? response.maxScore ?? 36;
      const percentage = response.percentage ?? Math.round((totalScore / maxScore) * 100);

      const rawVerdict = (response.verdict || '').toLowerCase();
      const verdict: MatchingResult['verdict'] =
        rawVerdict === 'excellent' ? 'excellent'
        : rawVerdict === 'good' ? 'good'
        : rawVerdict === 'average' ? 'average'
        : 'poor';

      const md: any = response.mangal_dosha || response.mangalDosha || {};

      setResult({
        kootas,
        totalScore,
        maxScore,
        percentage,
        verdict,
        mangalDosha: {
          personA: md.person_a ?? md.personA ?? false,
          personB: md.person_b ?? md.personB ?? false,
          cancelled: md.cancelled ?? false,
        },
        recommendation: response.recommendation || '',
      });

      toast({
        title: "Match Calculated",
        description: `Compatibility score: ${totalScore}/${maxScore} (${percentage}%)`
      });
    } catch (error) {
      console.error('Kundali matching failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'average': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const content = (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-sm font-medium mb-4">
          <Heart className="h-4 w-4 inline mr-1" />
          Marriage Compatibility
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
          Kundali Matching
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Traditional Ashtakoot matching system to analyze marriage compatibility 
          based on 36 Gunas. Enter birth details of both partners for detailed analysis.
        </p>
      </div>

      {/* Input Forms */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
        {/* Person A */}
        <Card className="border-pink-200 dark:border-pink-800">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
              <Users className="h-5 w-5" />
              Person 1 (You)
            </CardTitle>
            <CardDescription>Enter your birth details</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nameA">Full Name</Label>
              <Input
                id="nameA"
                value={personA.name}
                onChange={(e) => setPersonA(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Birth *
              </Label>
              <Input
                type="date"
                value={personA.dateOfBirth}
                onChange={(e) => setPersonA(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time of Birth *
              </Label>
              <TimePickerAMPM
                value={personA.timeOfBirth}
                onChange={(value) => setPersonA(prev => ({ ...prev, timeOfBirth: value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Birth Location *
              </Label>
              <CityAutocomplete
                value={personA.birthLocation}
                onChange={(value) => setPersonA(prev => ({ ...prev, birthLocation: value }))}
                placeholder="City, State, Country"
              />
            </div>
            <div className="space-y-2">
              <Label>Gender *</Label>
              <RadioGroup 
                value={personA.gender} 
                onValueChange={(value: 'male' | 'female') => setPersonA(prev => ({ ...prev, gender: value }))}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="male" id="personA-male" />
                  <Label htmlFor="personA-male" className="cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="female" id="personA-female" />
                  <Label htmlFor="personA-female" className="cursor-pointer">Female</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Person B */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Users className="h-5 w-5" />
              Person 2 (Partner)
            </CardTitle>
            <CardDescription>Enter partner's birth details</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nameB">Full Name</Label>
              <Input
                id="nameB"
                value={personB.name}
                onChange={(e) => setPersonB(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Birth *
              </Label>
              <Input
                type="date"
                value={personB.dateOfBirth}
                onChange={(e) => setPersonB(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time of Birth *
              </Label>
              <TimePickerAMPM
                value={personB.timeOfBirth}
                onChange={(value) => setPersonB(prev => ({ ...prev, timeOfBirth: value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Birth Location *
              </Label>
              <CityAutocomplete
                value={personB.birthLocation}
                onChange={(value) => setPersonB(prev => ({ ...prev, birthLocation: value }))}
                placeholder="City, State, Country"
              />
            </div>
            <div className="space-y-2">
              <Label>Gender *</Label>
              <RadioGroup 
                value={personB.gender} 
                onValueChange={(value: 'male' | 'female') => setPersonB(prev => ({ ...prev, gender: value }))}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="male" id="personB-male" />
                  <Label htmlFor="personB-male" className="cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="female" id="personB-female" />
                  <Label htmlFor="personB-female" className="cursor-pointer">Female</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calculate Button */}
      <div className="text-center mb-8">
        <Button 
          size="lg" 
          onClick={calculateMatch} 
          disabled={isCalculating}
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
        >
          {isCalculating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Calculating Ashtakoot Match...
            </>
          ) : (
            <>
              <Heart className="h-5 w-5 mr-2" />
              Calculate Compatibility
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Score Overview */}
          <Card className="border-2 border-primary/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Compatibility Result</CardTitle>
              <CardDescription>
                {personA.name || "Person 1"} & {personB.name || "Person 2"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-primary mb-2">
                  {result.totalScore}/{result.maxScore}
                </div>
                <div className="text-xl text-muted-foreground mb-4">
                  {result.percentage}% Compatible
                </div>
                <Badge className={`${getVerdictColor(result.verdict)} text-white text-lg px-4 py-1`}>
                  {result.verdict.charAt(0).toUpperCase() + result.verdict.slice(1)} Match
                </Badge>
              </div>
              <Progress value={result.percentage} className="h-4 mb-4" />
              <p className="text-center text-muted-foreground">{result.recommendation}</p>
            </CardContent>
          </Card>

          {/* Ashtakoot Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Ashtakoot Analysis
              </CardTitle>
              <CardDescription>Detailed breakdown of 8 Kootas (36 points)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.kootas.map((koota) => (
                  <div key={koota.name} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold">{koota.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">({koota.description})</span>
                      </div>
                      <Badge variant={koota.score >= koota.maxPoints * 0.5 ? "default" : "secondary"}>
                        {koota.score}/{koota.maxPoints}
                      </Badge>
                    </div>
                    <Progress value={(koota.score / koota.maxPoints) * 100} className="h-2 mb-2" />
                    <p className="text-sm text-muted-foreground">{koota.details}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mangal Dosha Check */}
          <Card>
            <CardHeader>
              <CardTitle>Mangal Dosha Analysis</CardTitle>
              <CardDescription>Mars placement affecting marriage compatibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${result.mangalDosha.personA ? 'bg-red-50 dark:bg-red-950/20 border-red-200' : 'bg-green-50 dark:bg-green-950/20 border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.mangalDosha.personA ? <X className="h-5 w-5 text-red-500" /> : <Check className="h-5 w-5 text-green-500" />}
                    <span className="font-medium">{personA.name || "Person 1"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.mangalDosha.personA ? "Mangal Dosha Present" : "No Mangal Dosha"}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${result.mangalDosha.personB ? 'bg-red-50 dark:bg-red-950/20 border-red-200' : 'bg-green-50 dark:bg-green-950/20 border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.mangalDosha.personB ? <X className="h-5 w-5 text-red-500" /> : <Check className="h-5 w-5 text-green-500" />}
                    <span className="font-medium">{personB.name || "Person 2"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.mangalDosha.personB ? "Mangal Dosha Present" : "No Mangal Dosha"}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${result.mangalDosha.cancelled ? 'bg-green-50 dark:bg-green-950/20 border-green-200' : result.mangalDosha.personA || result.mangalDosha.personB ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200' : 'bg-green-50 dark:bg-green-950/20 border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="font-medium">Status</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.mangalDosha.cancelled 
                      ? "Dosha Cancelled (both have it)" 
                      : result.mangalDosha.personA || result.mangalDosha.personB 
                        ? "Remedies Recommended" 
                        : "No Dosha Concerns"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => window.print()}>
              Print Report
            </Button>
            <Button onClick={() => navigate('/contact')}>
              Book Jyotish Consultation
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return <MobileLayout title="Kundali Matching">{content}</MobileLayout>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {content}
      <Footer />
    </div>
  );
}
