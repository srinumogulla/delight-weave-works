import { useState } from "react";
import { Calendar, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n";

interface AuspiciousDate {
  date: string;
  day: string;
  tithi: string;
  nakshatra: string;
  muhurat: string;
  rating: "excellent" | "good" | "average";
}

const activityTypes = [
  { value: "marriage", label: "Marriage" },
  { value: "grihaPravesh", label: "Griha Pravesh" },
  { value: "mundan", label: "Mundan" },
  { value: "naming", label: "Naming Ceremony" },
  { value: "business", label: "Business Start" },
  { value: "travel", label: "Travel" },
];

// Mock auspicious dates - in production, this would come from an API
const mockAuspiciousDates: AuspiciousDate[] = [
  {
    date: "2026-01-25",
    day: "Sunday",
    tithi: "Saptami",
    nakshatra: "Rohini",
    muhurat: "09:30 AM - 11:00 AM",
    rating: "excellent",
  },
  {
    date: "2026-01-28",
    day: "Wednesday",
    tithi: "Dashami",
    nakshatra: "Mrigashira",
    muhurat: "10:00 AM - 12:30 PM",
    rating: "good",
  },
  {
    date: "2026-02-02",
    day: "Monday",
    tithi: "Purnima",
    nakshatra: "Pushya",
    muhurat: "08:00 AM - 10:00 AM",
    rating: "excellent",
  },
  {
    date: "2026-02-10",
    day: "Tuesday",
    tithi: "Ashtami",
    nakshatra: "Ashwini",
    muhurat: "11:00 AM - 01:00 PM",
    rating: "average",
  },
  {
    date: "2026-02-15",
    day: "Sunday",
    tithi: "Trayodashi",
    nakshatra: "Uttara Phalguni",
    muhurat: "09:00 AM - 11:30 AM",
    rating: "good",
  },
];

export const MuhuratFinder = () => {
  const { t } = useLanguage();
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [results, setResults] = useState<AuspiciousDate[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!selectedActivity) return;
    
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setResults(mockAuspiciousDates);
      setIsSearching(false);
    }, 500);
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "bg-green-500";
      case "good":
        return "bg-yellow-500";
      default:
        return "bg-orange-500";
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
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedActivity} onValueChange={setSelectedActivity}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t("panchang.selectActivity")} />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map((activity) => (
                <SelectItem key={activity.value} value={activity.value}>
                  {t(`panchang.${activity.value}`) || activity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={!selectedActivity || isSearching}>
            <Calendar className="h-4 w-4 mr-2" />
            {t("panchang.findAuspicious")}
          </Button>
        </div>

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
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatDate(result.date)}</span>
                        <span className="text-muted-foreground">({result.day})</span>
                        <Badge className={getRatingColor(result.rating)}>
                          {result.rating.charAt(0).toUpperCase() + result.rating.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>{t("panchang.tithi")}: {result.tithi}</span>
                        <span>{t("panchang.nakshatra")}: {result.nakshatra}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">Muhurat: {result.muhurat}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Check className="h-4 w-4 mr-1" />
                      Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
