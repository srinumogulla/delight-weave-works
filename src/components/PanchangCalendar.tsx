import { useState } from "react";
import { ChevronLeft, ChevronRight, Moon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n";

interface PanchangDay {
  date: number;
  tithi: string;
  nakshatra: string;
  isEkadashi?: boolean;
  isAmavasya?: boolean;
  isPurnima?: boolean;
  festival?: {
    name: string;
    description: string;
    type: "major" | "regional" | "observance";
  };
}

// Comprehensive 2026 festival database
const festivalsDatabase: Record<string, { name: string; description: string; type: "major" | "regional" | "observance" }> = {
  // January 2026
  "2026-01-14": { name: "Makar Sankranti", description: "Festival marking sun's transition into Capricorn", type: "major" },
  "2026-01-15": { name: "Pongal", description: "Tamil harvest festival", type: "regional" },
  "2026-01-26": { name: "Republic Day", description: "National holiday", type: "observance" },
  // February 2026
  "2026-02-03": { name: "Vasant Panchami", description: "Festival dedicated to Goddess Saraswati", type: "major" },
  "2026-02-19": { name: "Shivratri", description: "Night dedicated to Lord Shiva", type: "major" },
  "2026-02-27": { name: "Maha Shivaratri", description: "The great night of Lord Shiva", type: "major" },
  // March 2026
  "2026-03-02": { name: "Holika Dahan", description: "Eve of Holi, bonfire celebration", type: "major" },
  "2026-03-03": { name: "Holi", description: "Festival of colors", type: "major" },
  "2026-03-17": { name: "Chaitra Navratri Begins", description: "Nine nights of Goddess Durga worship", type: "major" },
  "2026-03-28": { name: "Ugadi / Gudi Padwa", description: "New Year for Karnataka, Maharashtra & Andhra Pradesh", type: "regional" },
  // April 2026
  "2026-04-06": { name: "Ram Navami", description: "Birthday of Lord Rama", type: "major" },
  "2026-04-13": { name: "Baisakhi", description: "Punjabi New Year & harvest festival", type: "regional" },
  "2026-04-14": { name: "Hanuman Jayanti", description: "Birthday of Lord Hanuman", type: "major" },
  "2026-04-21": { name: "Akshaya Tritiya", description: "Most auspicious day for new beginnings", type: "major" },
  // May 2026
  "2026-05-03": { name: "Buddha Purnima", description: "Birthday of Lord Buddha", type: "major" },
  "2026-05-13": { name: "Narasimha Jayanti", description: "Appearance day of Lord Narasimha", type: "major" },
  // June 2026
  "2026-06-26": { name: "Rath Yatra", description: "Chariot festival of Lord Jagannath", type: "major" },
  // July 2026
  "2026-07-10": { name: "Guru Purnima", description: "Day to honor spiritual teachers", type: "major" },
  // August 2026
  "2026-08-09": { name: "Raksha Bandhan", description: "Festival celebrating brother-sister bond", type: "major" },
  "2026-08-15": { name: "Independence Day", description: "National holiday", type: "observance" },
  "2026-08-17": { name: "Janmashtami", description: "Birthday of Lord Krishna", type: "major" },
  // September 2026
  "2026-09-04": { name: "Ganesh Chaturthi", description: "Birthday of Lord Ganesha", type: "major" },
  "2026-09-14": { name: "Anant Chaturdashi", description: "Ganesh Visarjan day", type: "major" },
  "2026-09-21": { name: "Pitru Paksha Begins", description: "Fortnight for honoring ancestors", type: "observance" },
  // October 2026
  "2026-10-02": { name: "Gandhi Jayanti", description: "Birthday of Mahatma Gandhi", type: "observance" },
  "2026-10-07": { name: "Sharad Navratri Begins", description: "Nine nights of Goddess Durga worship", type: "major" },
  "2026-10-13": { name: "Durga Ashtami", description: "Eighth day of Navratri", type: "major" },
  "2026-10-14": { name: "Maha Navami", description: "Ninth day of Navratri", type: "major" },
  "2026-10-15": { name: "Dussehra / Vijayadashami", description: "Victory of good over evil", type: "major" },
  "2026-10-20": { name: "Karwa Chauth", description: "Fasting festival for married women", type: "regional" },
  // November 2026
  "2026-11-01": { name: "Dhanteras", description: "First day of Diwali celebrations", type: "major" },
  "2026-11-02": { name: "Naraka Chaturdashi", description: "Second day of Diwali", type: "major" },
  "2026-11-03": { name: "Diwali", description: "Festival of lights", type: "major" },
  "2026-11-04": { name: "Govardhan Puja", description: "Day after Diwali", type: "major" },
  "2026-11-05": { name: "Bhai Dooj", description: "Festival celebrating siblings", type: "major" },
  "2026-11-14": { name: "Children's Day", description: "Birthday of Jawaharlal Nehru", type: "observance" },
  "2026-11-22": { name: "Kartik Purnima", description: "Full moon in Kartik month", type: "major" },
  // December 2026
  "2026-12-25": { name: "Christmas", description: "Christian festival", type: "observance" },
};

const tithis = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"
];

const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati"
];

const generateMonthData = (year: number, month: number): PanchangDay[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: PanchangDay[] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const tithiIndex = (i - 1) % 15;
    const nakshatraIndex = (i - 1) % 27;
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const festival = festivalsDatabase[dateKey];

    days.push({
      date: i,
      tithi: tithis[tithiIndex],
      nakshatra: nakshatras[nakshatraIndex],
      isEkadashi: tithiIndex === 10,
      isAmavasya: i === 15,
      isPurnima: i === 30 || (i === daysInMonth && daysInMonth < 30),
      festival,
    });
  }
  return days;
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const PanchangCalendar = () => {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<PanchangDay | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthData = generateMonthData(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getTypeBadge = (type: "major" | "regional" | "observance") => {
    switch (type) {
      case "major":
        return <Badge className="bg-primary text-primary-foreground">Major Festival</Badge>;
      case "regional":
        return <Badge variant="secondary">Regional</Badge>;
      default:
        return <Badge variant="outline">Observance</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {monthNames[month]} {year}
        </h2>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2" />
        ))}

        {/* Calendar days */}
        {monthData.map((day) => (
          <button
            key={day.date}
            onClick={() => setSelectedDay(day)}
            className={`
              p-2 rounded-lg text-center transition-colors relative
              ${selectedDay?.date === day.date ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
              ${day.isEkadashi ? "ring-2 ring-yellow-500" : ""}
              ${day.isAmavasya ? "bg-slate-900 text-white" : ""}
              ${day.isPurnima ? "bg-amber-100 dark:bg-amber-900" : ""}
            `}
          >
            <span className="text-sm font-medium">{day.date}</span>
            {day.festival && (
              <Star className="h-3 w-3 absolute top-1 right-1 text-yellow-500 fill-yellow-500" />
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded ring-2 ring-yellow-500" />
          <span>Ekadashi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-900" />
          <span>Amavasya</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900" />
          <span>Purnima</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span>Festival</span>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <span>{monthNames[month]} {selectedDay.date}, {year}</span>
              {selectedDay.festival && getTypeBadge(selectedDay.festival.type)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Festival Info */}
            {selectedDay.festival && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                  <Star className="h-5 w-5 fill-primary" />
                  {selectedDay.festival.name}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDay.festival.description}
                </p>
              </div>
            )}

            {/* Panchang Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("panchang.tithi")}</p>
                  <p className="font-medium">{selectedDay.tithi}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("panchang.nakshatra")}</p>
                  <p className="font-medium">{selectedDay.nakshatra}</p>
                </div>
              </div>
            </div>

            {selectedDay.isEkadashi && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  🙏 Ekadashi - Auspicious for fasting and worship
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
