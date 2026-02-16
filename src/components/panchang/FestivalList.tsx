import { Calendar, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n";

interface Festival {
  name: string;
  date: string;
  description: string;
  type: "major" | "regional" | "observance";
}

// Mock festival data - in production, this would come from an API
const upcomingFestivals: Festival[] = [
  {
    name: "Makar Sankranti",
    date: "2026-01-14",
    description: "Festival marking the sun's transition into Capricorn",
    type: "major",
  },
  {
    name: "Pongal",
    date: "2026-01-15",
    description: "Tamil harvest festival",
    type: "regional",
  },
  {
    name: "Republic Day",
    date: "2026-01-26",
    description: "National holiday",
    type: "observance",
  },
  {
    name: "Vasant Panchami",
    date: "2026-02-03",
    description: "Festival dedicated to Goddess Saraswati",
    type: "major",
  },
  {
    name: "Maha Shivaratri",
    date: "2026-02-27",
    description: "The great night of Lord Shiva",
    type: "major",
  },
  {
    name: "Holi",
    date: "2026-03-17",
    description: "Festival of colors",
    type: "major",
  },
];

export const FestivalList = () => {
  const { t } = useLanguage();

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "major":
        return <Badge className="bg-primary">Major Festival</Badge>;
      case "regional":
        return <Badge variant="secondary">Regional</Badge>;
      default:
        return <Badge variant="outline">Observance</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const festivalDate = new Date(dateStr);
    const diffTime = festivalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          {t("panchang.festivals")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingFestivals.map((festival, index) => {
            const daysUntil = getDaysUntil(festival.date);
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground mt-1">
                    {daysUntil > 0 ? `${daysUntil}d` : "Today"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-foreground">
                      {festival.name}
                    </h4>
                    {getTypeBadge(festival.type)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(festival.date)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {festival.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
