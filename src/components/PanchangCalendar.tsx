import { useState } from "react";
import { ChevronLeft, ChevronRight, Sun, Moon, Star } from "lucide-react";
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
  festival?: string;
}

// Mock data for calendar - in production, this would come from an API
const generateMonthData = (year: number, month: number): PanchangDay[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const tithis = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
  ];
  const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
    "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
    "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
    "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
    "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
    "Uttara Bhadrapada", "Revati"
  ];

  const days: PanchangDay[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const tithiIndex = (i - 1) % 15;
    const nakshatraIndex = (i - 1) % 27;
    days.push({
      date: i,
      tithi: tithis[tithiIndex],
      nakshatra: nakshatras[nakshatraIndex],
      isEkadashi: tithiIndex === 10,
      isAmavasya: i === 15,
      isPurnima: i === 30 || i === daysInMonth,
      festival: i === 1 ? "Navratri" : i === 10 ? "Dussehra" : undefined,
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
            <CardTitle className="flex items-center gap-2">
              <span>{monthNames[month]} {selectedDay.date}, {year}</span>
              {selectedDay.festival && (
                <Badge variant="secondary">{selectedDay.festival}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
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
