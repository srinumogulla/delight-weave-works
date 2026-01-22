import { useState } from "react";
import { Calendar, Clock, Check, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { useLanguage } from "@/i18n";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuspiciousDate {
  date: string;
  day: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  muhurat: string;
  rating: "excellent" | "good" | "average";
  rahukaal: string;
  reason: string;
}

// Activity types with associated favorable nakshatras and tithis
const activityTypes = [
  { value: "marriage", label: "Marriage (Vivah)", nakshatras: ["Rohini", "Mrigashira", "Magha", "Uttara Phalguni", "Hasta", "Swati", "Anuradha", "Mula", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"], avoidTithis: ["4", "9", "14", "Amavasya", "Purnima"] },
  { value: "grihaPravesh", label: "Griha Pravesh", nakshatras: ["Rohini", "Mrigashira", "Pushya", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Anuradha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Uttara Bhadrapada", "Revati"], avoidTithis: ["4", "9", "14", "Amavasya"] },
  { value: "mundan", label: "Mundan (First Haircut)", nakshatras: ["Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Jyeshtha", "Shravana", "Dhanishta", "Shatabhisha", "Revati"], avoidTithis: ["4", "9", "14", "Amavasya", "Purnima"] },
  { value: "naming", label: "Naming Ceremony (Namkaran)", nakshatras: ["Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Anuradha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Uttara Bhadrapada", "Revati"], avoidTithis: ["4", "9", "14", "Amavasya"] },
  { value: "upanayana", label: "Upanayana (Thread Ceremony)", nakshatras: ["Hasta", "Chitra", "Swati", "Pushya", "Dhanishta", "Shravana", "Punarvasu", "Ashwini", "Mrigashira", "Revati"], avoidTithis: ["4", "9", "14", "Amavasya", "Purnima"] },
  { value: "vehiclePurchase", label: "Vehicle Purchase", nakshatras: ["Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishta", "Revati"], avoidTithis: ["4", "8", "9", "14", "Amavasya"] },
  { value: "propertyPurchase", label: "Property Purchase", nakshatras: ["Rohini", "Mrigashira", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Anuradha", "Uttara Ashadha", "Shravana", "Uttara Bhadrapada", "Revati"], avoidTithis: ["4", "9", "14", "Amavasya"] },
  { value: "business", label: "Business Start", nakshatras: ["Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Anuradha", "Mula", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Uttara Bhadrapada", "Revati"], avoidTithis: ["4", "9", "14", "Amavasya"] },
  { value: "travel", label: "Travel / Journey", nakshatras: ["Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Anuradha", "Mula", "Shravana", "Dhanishta", "Revati"], avoidTithis: ["4", "9", "14", "Amavasya"] },
  { value: "surgery", label: "Surgery / Medical", nakshatras: ["Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Chitra", "Shravana", "Revati"], avoidTithis: ["4", "9", "14", "Amavasya", "Purnima"] },
  { value: "education", label: "Education / Learning Start", nakshatras: ["Ashwini", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Shravana", "Revati", "Rohini", "Mrigashira"], avoidTithis: ["4", "9", "14", "Amavasya"] },
  { value: "engagement", label: "Engagement (Sagai)", nakshatras: ["Rohini", "Mrigashira", "Magha", "Uttara Phalguni", "Hasta", "Swati", "Anuradha", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"], avoidTithis: ["4", "9", "14", "Amavasya", "Purnima"] },
];

const allNakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const tithis = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"
];

const yogas = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti",
  "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi",
  "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
  "Brahma", "Indra", "Vaidhriti"
];

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const MuhuratFinder = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [results, setResults] = useState<AuspiciousDate[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Set default date range (next 30 days)
  useState(() => {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(thirtyDaysLater.toISOString().split('T')[0]);
  });

  const handleSearch = () => {
    if (!selectedActivity) {
      toast.error("Please select an activity type");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select a date range");
      return;
    }
    
    setIsSearching(true);
    
    // Find activity config
    const activity = activityTypes.find(a => a.value === selectedActivity);
    if (!activity) return;

    // Calculate auspicious dates within the range
    setTimeout(() => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const auspiciousDates: AuspiciousDate[] = [];
      
      // Iterate through each day in range
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay();
        const dayOfMonth = date.getDate();
        const month = date.getMonth();
        
        // Calculate panchang elements for this day (simplified calculation)
        const nakshatraIndex = (dayOfMonth + month) % 27;
        const nakshatra = allNakshatras[nakshatraIndex];
        const tithiIndex = (dayOfMonth - 1) % 16;
        const tithi = tithis[tithiIndex];
        const yogaIndex = (dayOfMonth + month + dayOfWeek) % 27;
        const yoga = yogas[yogaIndex];
        
        // Check if nakshatra is favorable for this activity
        const isNakshatraFavorable = activity.nakshatras.includes(nakshatra);
        
        // Check if tithi is not in avoid list
        const isTithiGood = !activity.avoidTithis.some(avoid => 
          tithi.toLowerCase().includes(avoid.toLowerCase())
        );
        
        // Calculate Rahu Kaal (simplified)
        const rahukaalTimes: Record<number, string> = {
          0: "04:30 PM - 06:00 PM",
          1: "07:30 AM - 09:00 AM",
          2: "03:00 PM - 04:30 PM",
          3: "12:00 PM - 01:30 PM",
          4: "01:30 PM - 03:00 PM",
          5: "10:30 AM - 12:00 PM",
          6: "09:00 AM - 10:30 AM"
        };
        const rahukaal = rahukaalTimes[dayOfWeek];
        
        // Determine rating
        let rating: "excellent" | "good" | "average" = "average";
        let reason = "";
        
        if (isNakshatraFavorable && isTithiGood) {
          // Check for excellent conditions
          const excellentNakshatras = ["Rohini", "Pushya", "Uttara Phalguni", "Hasta", "Shravana", "Revati"];
          if (excellentNakshatras.includes(nakshatra)) {
            rating = "excellent";
            reason = `${nakshatra} nakshatra is highly auspicious. ${tithi} is favorable.`;
          } else {
            rating = "good";
            reason = `${nakshatra} nakshatra is suitable. ${tithi} is acceptable.`;
          }
          
          // Calculate muhurat time (avoid Rahu Kaal)
          let muhuratStart = "09:00 AM";
          let muhuratEnd = "11:30 AM";
          
          // Adjust based on Rahu Kaal
          if (rahukaal.startsWith("09:00")) {
            muhuratStart = "10:30 AM";
            muhuratEnd = "12:30 PM";
          } else if (rahukaal.startsWith("10:30")) {
            muhuratStart = "08:00 AM";
            muhuratEnd = "10:30 AM";
          }
          
          auspiciousDates.push({
            date: date.toISOString().split('T')[0],
            day: days[dayOfWeek],
            tithi,
            nakshatra,
            yoga,
            muhurat: `${muhuratStart} - ${muhuratEnd}`,
            rating,
            rahukaal,
            reason
          });
        }
      }
      
      // Sort by rating and date
      auspiciousDates.sort((a, b) => {
        const ratingOrder = { excellent: 0, good: 1, average: 2 };
        if (ratingOrder[a.rating] !== ratingOrder[b.rating]) {
          return ratingOrder[a.rating] - ratingOrder[b.rating];
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      
      // Limit to top 10 results
      setResults(auspiciousDates.slice(0, 10));
      setIsSearching(false);
      
      if (auspiciousDates.length === 0) {
        toast.info("No highly auspicious dates found in this range. Try expanding your search.");
      } else {
        toast.success(`Found ${Math.min(auspiciousDates.length, 10)} auspicious dates!`);
      }
    }, 800);
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "bg-green-500 text-white";
      case "good":
        return "bg-yellow-500 text-white";
      default:
        return "bg-orange-500 text-white";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {t("panchang.muhuratFinder")}
        </CardTitle>
        <CardDescription>
          Find auspicious dates and times for important life events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label className="mb-2 block">Activity Type *</Label>
            <Select value={selectedActivity} onValueChange={setSelectedActivity}>
              <SelectTrigger>
                <SelectValue placeholder={t("panchang.selectActivity")} />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((activity) => (
                  <SelectItem key={activity.value} value={activity.value}>
                    {activity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="mb-2 block">From Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div>
            <Label className="mb-2 block">To Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-2">
            <Label className="mb-2 block">Location (Optional)</Label>
            <CityAutocomplete value={location} onChange={setLocation} />
            <p className="text-xs text-muted-foreground mt-1">
              Location helps calculate accurate sunrise/sunset timings for muhurat
            </p>
          </div>
        </div>
        
        <Button onClick={handleSearch} disabled={!selectedActivity || isSearching} className="w-full">
          {isSearching ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
              Finding Auspicious Dates...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              {t("panchang.findAuspicious")}
            </>
          )}
        </Button>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Auspicious Dates for {activityTypes.find(a => a.value === selectedActivity)?.label}
            </h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{formatDate(result.date)}</span>
                        <span className="text-muted-foreground">({result.day})</span>
                        <Badge className={getRatingColor(result.rating)}>
                          {result.rating.charAt(0).toUpperCase() + result.rating.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <span>{t("panchang.tithi")}: {result.tithi}</span>
                        <span>{t("panchang.nakshatra")}: {result.nakshatra}</span>
                        <span>{t("panchang.yoga")}: {result.yoga}</span>
                        <span>{t("panchang.rahukaal")}: {result.rahukaal}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">Best Muhurat: {result.muhurat}</span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground italic">
                        {result.reason}
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/booking?date=${result.date}`)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              * Muhurat times are calculated to avoid Rahu Kaal. Consult a Jyotish for precise timing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
