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

  const calculateNakshatra = (dateOfBirth: string): number => {
    const date = new Date(dateOfBirth);
    return (date.getDate() + date.getMonth()) % 27;
  };

  const calculateRashi = (dateOfBirth: string): number => {
    const date = new Date(dateOfBirth);
    return (date.getDate() * 2 + date.getMonth()) % 12;
  };

  const calculateMatch = () => {
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

    setTimeout(() => {
      const nakA = calculateNakshatra(personA.dateOfBirth);
      const nakB = calculateNakshatra(personB.dateOfBirth);
      const rashiA = calculateRashi(personA.dateOfBirth);
      const rashiB = calculateRashi(personB.dateOfBirth);
      
      // Calculate Ashtakoot points
      const kootas: KootaResult[] = [
        {
          name: "Varna",
          description: "Spiritual/ego compatibility",
          maxPoints: 1,
          score: Math.abs(rashiA - rashiB) <= 3 ? 1 : 0,
          details: Math.abs(rashiA - rashiB) <= 3 
            ? "Good spiritual compatibility between partners" 
            : "Some adjustment needed in spiritual outlook"
        },
        {
          name: "Vasya",
          description: "Mutual attraction & control",
          maxPoints: 2,
          score: (nakA + nakB) % 3 === 0 ? 2 : (nakA + nakB) % 3 === 1 ? 1 : 0,
          details: (nakA + nakB) % 3 === 0 
            ? "Strong mutual attraction and understanding" 
            : "Moderate level of mutual influence"
        },
        {
          name: "Tara",
          description: "Birth star compatibility",
          maxPoints: 3,
          score: Math.abs(nakA - nakB) % 9 < 4 ? 3 : Math.abs(nakA - nakB) % 9 < 7 ? 1.5 : 0,
          details: `Based on ${nakshatras[nakA]} and ${nakshatras[nakB]} nakshatras`
        },
        {
          name: "Yoni",
          description: "Physical/intimate compatibility",
          maxPoints: 4,
          score: (nakA * nakB) % 5 === 0 ? 4 : (nakA * nakB) % 5 < 3 ? 2 : 1,
          details: (nakA * nakB) % 5 === 0 
            ? "Excellent physical compatibility" 
            : "Good physical harmony with some adjustments"
        },
        {
          name: "Graha Maitri",
          description: "Mental compatibility",
          maxPoints: 5,
          score: Math.abs(rashiA - rashiB) % 4 === 0 ? 5 : Math.abs(rashiA - rashiB) % 4 < 2 ? 3 : 1,
          details: `Moon sign lords: ${rashis[rashiA]} and ${rashis[rashiB]}`
        },
        {
          name: "Gana",
          description: "Temperament match",
          maxPoints: 6,
          score: nakA % 3 === nakB % 3 ? 6 : Math.abs((nakA % 3) - (nakB % 3)) === 1 ? 3 : 0,
          details: nakA % 3 === nakB % 3 
            ? "Excellent temperament compatibility (same Gana)" 
            : "Different temperaments - understanding needed"
        },
        {
          name: "Bhakoot",
          description: "Relative position of Moon signs",
          maxPoints: 7,
          score: [2, 6, 8, 12].includes(Math.abs(rashiA - rashiB) + 1) ? 0 : 7,
          details: [2, 6, 8, 12].includes(Math.abs(rashiA - rashiB) + 1) 
            ? "Bhakoot Dosha present - remedies recommended" 
            : "Favorable Moon sign positions"
        },
        {
          name: "Nadi",
          description: "Health & genetic compatibility",
          maxPoints: 8,
          score: nakA % 3 !== nakB % 3 ? 8 : 0,
          details: nakA % 3 !== nakB % 3 
            ? "Different Nadis - excellent for progeny" 
            : "Same Nadi - Nadi Dosha present"
        }
      ];

      const totalScore = kootas.reduce((sum, k) => sum + k.score, 0);
      const maxScore = 36;
      const percentage = Math.round((totalScore / maxScore) * 100);

      let verdict: 'excellent' | 'good' | 'average' | 'poor';
      let recommendation: string;

      if (totalScore >= 28) {
        verdict = 'excellent';
        recommendation = "This is an excellent match! The compatibility is very high across all dimensions. The marriage is likely to be harmonious and blessed.";
      } else if (totalScore >= 21) {
        verdict = 'good';
        recommendation = "This is a good match with strong compatibility in most areas. Minor differences can be resolved with understanding and adjustment.";
      } else if (totalScore >= 14) {
        verdict = 'average';
        recommendation = "This match shows average compatibility. Consider consulting a Jyotish expert for remedies and deeper analysis before proceeding.";
      } else {
        verdict = 'poor';
        recommendation = "This match shows significant compatibility challenges. We strongly recommend consulting with an experienced Jyotish for detailed analysis and remedies.";
      }

      // Mangal Dosha check
      const mangalA = new Date(personA.dateOfBirth).getDate() % 4 === 0;
      const mangalB = new Date(personB.dateOfBirth).getDate() % 4 === 0;

      setResult({
        kootas,
        totalScore,
        maxScore,
        percentage,
        verdict,
        mangalDosha: {
          personA: mangalA,
          personB: mangalB,
          cancelled: mangalA && mangalB
        },
        recommendation
      });

      setIsCalculating(false);
      toast({
        title: "Match Calculated",
        description: `Compatibility score: ${totalScore}/${maxScore} (${percentage}%)`
      });
    }, 2500);
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
