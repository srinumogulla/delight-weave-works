import { useState } from "react";
import { Sun, Moon, Clock, AlertTriangle, Check, Calendar } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PanchangCalendar } from "@/components/PanchangCalendar";
import { MuhuratFinder } from "@/components/MuhuratFinder";
import { FestivalList } from "@/components/FestivalList";
import { useLanguage } from "@/i18n";

// Static Panchang data for today
const todayPanchang = {
  date: new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  hinduDate: "Magha Shukla Saptami, Vikram Samvat 2082",
  tithi: {
    name: "Saptami",
    endTime: "03:45 PM",
  },
  nakshatra: {
    name: "Mrigashira",
    endTime: "06:30 PM",
  },
  yoga: "Shiva",
  karana: "Baalava",
  vara: "Shanivara (Saturday)",
  sunrise: "06:58 AM",
  sunset: "06:12 PM",
  moonrise: "11:45 AM",
  moonset: "01:23 AM",
  rahukaal: "09:00 AM - 10:30 AM",
  yamagandam: "01:30 PM - 03:00 PM",
  gulika: "06:00 AM - 07:30 AM",
  auspicious: [
    "Vivah (Marriage)",
    "Griha Pravesh",
    "Vehicle Purchase",
    "Starting New Business",
    "Traveling",
  ],
  inauspicious: [
    "Shradh Karma",
    "Hair Cut",
    "Lending Money",
  ],
};

const Panchang = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("today");

  const content = (
    <main className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          {t("panchang.title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("panchang.subtitle")}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="muhurat">Muhurat</TabsTrigger>
        </TabsList>

        {/* Today's Panchang */}
        <TabsContent value="today" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Main Panchang Details */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {todayPanchang.date}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {todayPanchang.hinduDate}
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("panchang.tithi")}</p>
                    <p className="font-semibold">{todayPanchang.tithi.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Until {todayPanchang.tithi.endTime}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("panchang.nakshatra")}</p>
                    <p className="font-semibold">{todayPanchang.nakshatra.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Until {todayPanchang.nakshatra.endTime}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("panchang.yoga")}</p>
                    <p className="font-semibold">{todayPanchang.yoga}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("panchang.karana")}</p>
                    <p className="font-semibold">{todayPanchang.karana}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">{t("panchang.vara")}</p>
                  <p className="font-semibold">{todayPanchang.vara}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Timings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <Sun className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("panchang.sunrise")}</p>
                      <p className="font-semibold">{todayPanchang.sunrise}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Sun className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("panchang.sunset")}</p>
                      <p className="font-semibold">{todayPanchang.sunset}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Moon className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("panchang.moonrise")}</p>
                      <p className="font-semibold">{todayPanchang.moonrise}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                    <Moon className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("panchang.moonset")}</p>
                      <p className="font-semibold">{todayPanchang.moonset}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{t("panchang.rahukaal")}</span>
                    </div>
                    <Badge variant="destructive">{todayPanchang.rahukaal}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{t("panchang.yamagandam")}</span>
                    </div>
                    <Badge variant="outline">{todayPanchang.yamagandam}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">{t("panchang.gulika")}</span>
                    </div>
                    <Badge variant="outline">{todayPanchang.gulika}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Auspicious/Inauspicious */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-green-50 dark:bg-green-900/20">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Check className="h-5 w-5" />
                  {t("panchang.auspicious")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {todayPanchang.auspicious.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-red-50 dark:bg-red-900/20">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  {t("panchang.inauspicious")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {todayPanchang.inauspicious.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Festivals */}
          <FestivalList />
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-6">
              <PanchangCalendar />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Muhurat Finder */}
        <TabsContent value="muhurat">
          <MuhuratFinder />
        </TabsContent>
      </Tabs>
    </main>
  );

  if (isMobile) {
    return (
      <MobileLayout showHeader={true}>
        {content}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {content}
      <Footer />
    </div>
  );
};

export default Panchang;
